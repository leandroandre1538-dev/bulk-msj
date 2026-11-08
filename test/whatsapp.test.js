// Pruebas sin MongoDB ni Meta reales: se simulan la base de datos y la Graph API.
// Ejecutar con: npm test
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';
import jwt from 'jsonwebtoken';
import XLSX from 'xlsx';

process.env.MONGODB_URL = 'mongodb://simulado';

const { buildTemplatePayload, normalizePhone, runWithConcurrency } = await import('../src/libs/whatsapp.js');
const { TOKEN_SECRET } = await import('../src/config.js');
const { default: app } = await import('../src/app.js');
const { default: Credential } = await import('../src/models/credential.model.js');
const { default: Group } = await import('../src/models/group.model.js');
const { default: Contact } = await import('../src/models/contact.model.js');

const USER_ID = new mongoose.Types.ObjectId().toString();
const GROUP_ID = new mongoose.Types.ObjectId().toString();
const cookie = `token=${jwt.sign({ id: USER_ID }, TOKEN_SECRET)}`;

const template = {
    name: 'promo_cliente',
    language: 'es',
    status: 'APPROVED',
    components: [
        { type: 'HEADER', format: 'TEXT', text: 'Hola {{1}}' },
        { type: 'BODY', text: '{{1}}, tienes {{2}} puntos' },
        { type: 'FOOTER', text: 'VentaBot' },
        {
            type: 'BUTTONS', buttons: [
                { type: 'QUICK_REPLY', text: 'No gracias' },
                { type: 'URL', text: 'Ver', url: 'https://x.com/p/{{1}}' }
            ]
        }
    ]
};

const realFetch = globalThis.fetch;
const graphCalls = [];
let server, baseUrl;

before(async () => {
    // Simula la conexión a Mongo y los modelos usados en el flujo
    mongoose.connect = async () => {};
    Credential.findOne = async () => ({ wabId: 'WABA1', phoneId: 'PHONE1', tokenAccess: 'TOKEN1' });
    Group.findOne = async () => ({ _id: GROUP_ID });
    Contact.find = async () => [{ phoneNumber: '51900000000' }];
    Contact.insertMany = async (docs) => docs.map((d, i) => ({ _id: String(i), ...d }));

    // Simula la Graph API de Meta: el número 51999999999 devuelve error
    globalThis.fetch = async (url, options = {}) => {
        if (!String(url).startsWith('https://graph.facebook.com/')) return realFetch(url, options);
        graphCalls.push({ url: String(url), options });
        if (String(url).includes('/message_templates')) {
            return Response.json({ data: [template, { ...template, name: 'pendiente', status: 'PENDING' }] });
        }
        if (String(url).includes('/debug_token')) {
            return Response.json({ data: { is_valid: true, type: 'SYSTEM_USER', application: 'Mi App', expires_at: 0, scopes: ['whatsapp_business_messaging'] } });
        }
        if (String(url).includes('/WABA1/phone_numbers')) {
            return Response.json({ data: [{ id: 'PHONE1', display_phone_number: '+1 555 000 1111' }] });
        }
        if (String(url).includes('/PHONE1?fields=')) {
            // Simula que Meta no reconoce un campo: la petición completa falla y luego se piden uno por uno
            if (String(url).includes(',') || String(url).includes('fields=platform_type')) {
                return Response.json({ error: { code: 100, message: 'Tried accessing nonexisting field' } }, { status: 400 });
            }
            const field = String(url).split('fields=')[1];
            const values = {
                display_phone_number: '+1 555 000 1111', verified_name: 'Test Number', account_mode: 'SANDBOX',
                status: 'CONNECTED', name_status: 'APPROVED', messaging_limit_tier: 'TIER_250',
                health_status: { can_send_message: 'AVAILABLE', entities: [] }
            };
            return Response.json(field in values ? { id: 'PHONE1', [field]: values[field] } : { id: 'PHONE1' });
        }
        if (String(url).includes('/WABA1?fields=')) {
            return Response.json({ id: 'WABA1', name: 'Mi Negocio', account_review_status: 'APPROVED', currency: 'USD' });
        }
        const body = JSON.parse(options.body);
        if (body.to === '51999999999') {
            return Response.json({ error: { message: 'Recipient phone number not in allowed list' } }, { status: 400 });
        }
        return Response.json({ messages: [{ id: 'wamid.1' }] });
    };

    await new Promise((resolve) => { server = app.listen(0, resolve); });
    baseUrl = `http://localhost:${server.address().port}`;
});

after(() => {
    server?.close();
    globalThis.fetch = realFetch;
});

test('normalizePhone deja solo dígitos', () => {
    assert.equal(normalizePhone('+51 987-654-321'), '51987654321');
    assert.equal(normalizePhone(51987654321), '51987654321');
});

test('buildTemplatePayload arma header, body y botón URL', () => {
    const payload = buildTemplatePayload(template, { header: ['Ana'], body: ['Ana', '300'], buttons: ['abc'] }, '51987654321');
    assert.equal(payload.to, '51987654321');
    assert.deepEqual(payload.template.components, [
        { type: 'header', parameters: [{ type: 'text', text: 'Ana' }] },
        { type: 'body', parameters: [{ type: 'text', text: 'Ana' }, { type: 'text', text: '300' }] },
        { type: 'button', sub_type: 'url', index: '1', parameters: [{ type: 'text', text: 'abc' }] }
    ]);
});

test('buildTemplatePayload falla si falta una variable', () => {
    assert.throws(() => buildTemplatePayload(template, { header: ['Ana'], body: ['Ana'] }, '1'), /\{\{2\}\} en el body/);
});

test('plantilla sin variables no envía components', () => {
    const payload = buildTemplatePayload({ name: 'hello_world', language: 'en_US', components: [{ type: 'BODY', text: 'Hola' }] }, {}, '1');
    assert.equal(payload.template.components, undefined);
});

test('header con imagen usa el archivo de ejemplo', () => {
    const t = { name: 'img', components: [{ type: 'HEADER', format: 'IMAGE', example: { header_handle: ['https://img/1.jpg'] } }] };
    const payload = buildTemplatePayload(t, {}, '1');
    assert.deepEqual(payload.template.components[0].parameters, [{ type: 'image', image: { link: 'https://img/1.jpg' } }]);
});

test('runWithConcurrency respeta el límite y el orden', async () => {
    let active = 0, maxActive = 0;
    const out = await runWithConcurrency([1, 2, 3, 4, 5, 6, 7], 3, async (n) => {
        active++; maxActive = Math.max(maxActive, active);
        await new Promise((r) => setTimeout(r, 5));
        active--;
        return n * 2;
    });
    assert.deepEqual(out, [2, 4, 6, 8, 10, 12, 14]);
    assert.ok(maxActive <= 3);
});

test('API: importar contactos desde Excel', async () => {
    const sheet = XLSX.utils.aoa_to_sheet([
        ['Nombre', 'Número', 'Puntos', 'Codigo.Promo'],
        ['Ana', '+51 987 654 321', 300, 'A1'],
        ['Luis', 51912345678, 150, 'B2'],
        ['Repetido', '51900000000', 10, 'C3'],   // ya existe en el grupo
        ['Sin número', '', 5, 'D4'],             // se omite
    ]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Hoja1');
    const buffer = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });

    const form = new FormData();
    form.append('groupId', GROUP_ID);
    form.append('file', new Blob([buffer]), 'contactos.xlsx');

    const res = await realFetch(`${baseUrl}/api/contacts/import`, { method: 'POST', body: form, headers: { cookie } });
    const data = await res.json();
    assert.equal(res.status, 201, JSON.stringify(data));
    assert.equal(data.length, 2);
    assert.equal(data[0].name, 'Ana');
    assert.equal(data[0].phoneNumber, '51987654321');
    assert.deepEqual(data[0].variables, { PUNTOS: '300', CODIGO_PROMO: 'A1' });
    assert.equal(data[1].phoneNumber, '51912345678');
});

test('API: importar Excel sin columna de número da error claro', async () => {
    const sheet = XLSX.utils.aoa_to_sheet([['Nombre'], ['Ana']]);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, sheet, 'Hoja1');
    const form = new FormData();
    form.append('groupId', GROUP_ID);
    form.append('file', new Blob([XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' })]), 'x.xlsx');

    const res = await realFetch(`${baseUrl}/api/contacts/import`, { method: 'POST', body: form, headers: { cookie } });
    assert.equal(res.status, 400);
    assert.match((await res.json()).message, /NÚMERO/);
});

test('API: sin sesión no se puede enviar', async () => {
    const res = await realFetch(`${baseUrl}/api/templates/sendMessages`, { method: 'POST' });
    assert.equal(res.status, 401);
});

test('API: listar plantillas usa la credencial guardada y filtra aprobadas', async () => {
    graphCalls.length = 0;
    const res = await realFetch(`${baseUrl}/api/templates/getTemplates`, { headers: { cookie } });
    const data = await res.json();
    assert.equal(res.status, 200);
    assert.deepEqual(data.data.map((t) => t.name), ['promo_cliente']);
    assert.match(graphCalls[0].url, /\/WABA1\/message_templates/);
    assert.equal(graphCalls[0].options.headers.Authorization, 'Bearer TOKEN1');
});

test('API: envío masivo devuelve un resultado por contacto', async () => {
    graphCalls.length = 0;
    const variables = { header: ['Ana'], body: ['Ana', '300'], buttons: ['abc'] };
    const res = await realFetch(`${baseUrl}/api/templates/sendMessages`, {
        method: 'POST',
        headers: { cookie, 'Content-Type': 'application/json' },
        body: JSON.stringify({
            template,
            recipientList: [
                { number: '+51 987 654 321', variables },
                { number: '51999999999', variables },             // Meta responde error
                { number: '123', variables },                     // número inválido
                { number: '51912345678', variables: { header: ['Luis'], body: ['Luis'] } } // falta variable
            ]
        })
    });
    const { results } = await res.json();
    assert.equal(res.status, 200);
    assert.deepEqual(results.map((r) => r.state), ['success', 'warning', 'warning', 'warning']);
    assert.match(results[1].description, /allowed list/);
    assert.match(results[2].description, /Número inválido/);
    assert.match(results[3].description, /\{\{2\}\}/);
    // Solo se llamó a Meta para los dos números válidos con variables completas
    assert.equal(graphCalls.length, 2);
    assert.match(graphCalls[0].url, /\/PHONE1\/messages$/);
});

test('buildDiagnostics: token inválido corta el diagnóstico', async () => {
    const { buildDiagnostics } = await import('../src/libs/whatsappStatus.js');
    const d = buildDiagnostics({ phoneError: Object.assign(new Error('expired'), { code: 190 }) });
    assert.equal(d.length, 1);
    assert.equal(d[0].level, 'error');
    assert.match(d[0].message, /token/);
});

test('buildDiagnostics: producción, token temporal, phone de otra WABA y envío bloqueado', async () => {
    const { buildDiagnostics } = await import('../src/libs/whatsappStatus.js');
    const d = buildDiagnostics({
        token: { valid: true, expiresAt: '2026-11-08T00:00:00Z', scopes: ['whatsapp_business_messaging'] },
        phone: {
            account_mode: 'LIVE', status: 'CONNECTED',
            health_status: {
                can_send_message: 'BLOCKED',
                entities: [
                    { entity_type: 'WABA', errors: [{ error_code: 141006, error_description: 'No hay método de pago', possible_solution: 'Agrega una tarjeta' }] },
                    { entity_type: 'BUSINESS', errors: [{ error_code: 141006, error_description: 'No hay método de pago' }] }
                ]
            }
        },
        waba: { account_review_status: 'APPROVED', primary_funding_id: '123' },
        phoneBelongsToWaba: false
    });
    const text = d.map((x) => `${x.level}: ${x.message}`).join('\n');
    assert.match(text, /warning: El token es temporal/);
    assert.match(text, /error: Al token le faltan permisos: whatsapp_business_management/);
    assert.match(text, /ok: Número en PRODUCCIÓN/);
    assert.match(text, /ok: La cuenta tiene un método de pago/);
    assert.match(text, /error: El Phone ID no pertenece/);
    assert.match(text, /error: Meta indica que el envío está BLOQUEADO/);
    // El error repetido por entidad aparece una sola vez
    assert.equal(d.filter((x) => x.message.includes('141006')).length, 1);
});

test('API: estado de la cuenta de WhatsApp (modo prueba) sin exponer el token', async () => {
    const res = await realFetch(`${baseUrl}/api/whatsapp/status`, { headers: { cookie } });
    const data = await res.json();
    assert.equal(res.status, 200, JSON.stringify(data));
    assert.equal(data.configured, true);
    assert.equal(data.phone.account_mode, 'SANDBOX');
    assert.equal(data.phone.verified_name, 'Test Number');
    assert.equal(data.phone.platform_type, undefined); // campo rechazado por Meta, se omite sin romper
    assert.equal(data.phoneBelongsToWaba, true);
    assert.equal(data.token.expiresAt, null);
    assert.equal(data.credential.tokenPreview, '••••');
    assert.ok(!JSON.stringify(data).includes('TOKEN1'));
    assert.ok(data.diagnostics.some((x) => x.level === 'warning' && /PRUEBA/.test(x.message)));
    assert.ok(data.diagnostics.some((x) => x.level === 'ok' && /permanente/.test(x.message)));
    assert.ok(data.diagnostics.some((x) => /método de pago/.test(x.message)));
});

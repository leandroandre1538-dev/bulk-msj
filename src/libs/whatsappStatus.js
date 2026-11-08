import { graphGet, graphGetFields } from './whatsapp.js';

// Consulta a Meta el estado de la cuenta de WhatsApp asociada a las credenciales guardadas
// y arma un diagnóstico legible (modo prueba/producción, token, número, pagos, etc.).

const PHONE_FIELDS = [
    'display_phone_number', 'verified_name', 'account_mode', 'status', 'name_status',
    'code_verification_status', 'quality_rating', 'messaging_limit_tier', 'platform_type', 'health_status'
];

const WABA_FIELDS = [
    'name', 'account_review_status', 'business_verification_status', 'currency',
    'timezone_id', 'primary_funding_id', 'health_status'
];

const REQUIRED_SCOPES = ['whatsapp_business_messaging', 'whatsapp_business_management'];

const LIMIT_TIERS = {
    TIER_50: '50', TIER_250: '250', TIER_1K: '1.000', TIER_2K: '2.000', TIER_10K: '10.000',
    TIER_100K: '100.000', TIER_UNLIMITED: 'ilimitados'
};

export const describeLimitTier = (tier) => (LIMIT_TIERS[tier] ? `${LIMIT_TIERS[tier]} destinatarios únicos cada 24 h` : tier || null);

const settledValue = (result) => (result.status === 'fulfilled' ? result.value : null);
const settledError = (result) => (result.status === 'rejected' ? result.reason : null);

export const maskToken = (token = '') => (token.length > 12 ? `${token.slice(0, 6)}…${token.slice(-4)}` : '••••');

const parseToken = (debug) => {
    const data = debug?.data;
    if (!data) return null;
    return {
        valid: data.is_valid !== false,
        type: data.type || null,
        application: data.application || null,
        // expires_at = 0 significa que el token no caduca
        expiresAt: data.expires_at ? new Date(data.expires_at * 1000).toISOString() : null,
        scopes: data.scopes || []
    };
};

// Errores únicos del health_status (Meta los repite por cada entidad: número, WABA, negocio, app).
const healthErrors = (health) => {
    const seen = new Map();
    for (const entity of health?.entities || []) {
        for (const err of entity.errors || []) {
            const key = `${err.error_code}-${err.error_description}`;
            if (!seen.has(key)) seen.set(key, { ...err, entity: entity.entity_type });
        }
    }
    return [...seen.values()];
};

/** Diagnóstico a partir de lo que respondió Meta. Función pura para poder probarla. */
export const buildDiagnostics = ({ token, tokenError, phone, phoneError, waba, wabaError, phoneBelongsToWaba }) => {
    const d = [];
    const add = (level, message) => d.push({ level, message });

    // debug_token puede fallar por otros motivos; la invalidez se decide con las consultas al número y a la WABA.
    const tokenInvalid = [phoneError, wabaError].some((e) => e?.code === 190) || token?.valid === false;
    if (tokenInvalid) {
        add('error', 'El token de acceso es inválido o caducó. Genera uno nuevo y actualízalo en Configuración.');
        return d;
    }

    // Token
    if (token) {
        if (token.expiresAt) {
            add('warning', `El token es temporal y caduca el ${new Date(token.expiresAt).toLocaleString('es-PE', { timeZone: 'America/Lima' })}. Usa un token permanente de usuario del sistema.`);
        } else {
            add('ok', 'El token es permanente (no caduca).');
        }
        const missing = REQUIRED_SCOPES.filter((s) => !token.scopes.includes(s));
        if (token.scopes.length && missing.length) {
            add('error', `Al token le faltan permisos: ${missing.join(', ')}.`);
        }
    }

    // Número
    if (phoneError) {
        add('error', `No se pudo leer el Phone ID: ${phoneError.message}. Revisa que sea el "Phone number ID" (un ID largo), no el número de teléfono.`);
    } else if (phone) {
        if (phone.account_mode === 'SANDBOX') {
            add('warning', 'Número de PRUEBA (sandbox): solo puede enviar a los números (máximo 5) agregados en Meta → WhatsApp → API Setup → "To". A cualquier otro número Meta lo rechaza con el error 131030.');
        } else if (phone.account_mode === 'LIVE') {
            add('ok', 'Número en PRODUCCIÓN: puede enviar a cualquier número de WhatsApp.');
        }

        if (phone.status && phone.status !== 'CONNECTED') {
            add('error', `El número no está conectado (estado: ${phone.status}).`);
        }
        if (phone.name_status && !['APPROVED', 'AVAILABLE_WITHOUT_REVIEW'].includes(phone.name_status)) {
            add('warning', `El nombre visible del número no está aprobado (estado: ${phone.name_status}).`);
        }
        if (phone.quality_rating === 'RED') {
            add('warning', 'La calidad del número es BAJA (roja): Meta puede limitar o bloquear envíos.');
        } else if (phone.quality_rating === 'YELLOW') {
            add('warning', 'La calidad del número es MEDIA (amarilla).');
        }
        if (phone.messaging_limit_tier) {
            add('info', `Límite de mensajes iniciados por la empresa: ${describeLimitTier(phone.messaging_limit_tier)}.`);
        }
    }

    // Cuenta de WhatsApp Business
    if (wabaError) {
        add('error', `No se pudo leer el WABA ID: ${wabaError.message}. Revisa que sea el "WhatsApp Business Account ID".`);
    } else if (waba) {
        if (waba.account_review_status && waba.account_review_status !== 'APPROVED') {
            add('warning', `La cuenta de WhatsApp Business no está aprobada (revisión: ${waba.account_review_status}).`);
        }
        if (waba.primary_funding_id) {
            add('ok', 'La cuenta tiene un método de pago configurado.');
        } else {
            add('warning', 'No se pudo confirmar un método de pago. Sin él, en un número de producción Meta acepta los mensajes pero no los entrega. Revísalo en Business Manager → Cuentas de WhatsApp → Configuración de pago.');
        }
    }

    if (phoneBelongsToWaba === false) {
        add('error', 'El Phone ID no pertenece a la cuenta (WABA ID) configurada.');
    }

    // Diagnóstico propio de Meta: ¿puede enviar mensajes?
    const health = phone?.health_status || waba?.health_status;
    if (health?.can_send_message) {
        const errors = healthErrors(health);
        if (health.can_send_message === 'AVAILABLE') {
            add('ok', 'Meta indica que la cuenta puede enviar mensajes.');
        } else {
            const level = health.can_send_message === 'BLOCKED' ? 'error' : 'warning';
            add(level, `Meta indica que el envío está ${health.can_send_message === 'BLOCKED' ? 'BLOQUEADO' : 'LIMITADO'}.`);
        }
        for (const err of errors) {
            const solution = err.possible_solution ? ` Solución: ${err.possible_solution}` : '';
            add(health.can_send_message === 'BLOCKED' ? 'error' : 'warning', `${err.error_description || 'Error'} (código ${err.error_code}).${solution}`);
        }
    }

    return d;
};

export const getWhatsAppStatus = async ({ wabId, phoneId, tokenAccess }) => {
    const [tokenRes, phoneRes, wabaRes, numbersRes] = await Promise.allSettled([
        graphGet(`debug_token?input_token=${encodeURIComponent(tokenAccess)}`, tokenAccess),
        graphGetFields(phoneId, PHONE_FIELDS, tokenAccess),
        graphGetFields(wabId, WABA_FIELDS, tokenAccess),
        graphGet(`${wabId}/phone_numbers?fields=id,display_phone_number,verified_name&limit=100`, tokenAccess)
    ]);

    const token = parseToken(settledValue(tokenRes));
    const phone = settledValue(phoneRes);
    const waba = settledValue(wabaRes);
    const numbers = settledValue(numbersRes)?.data || null;
    const phoneBelongsToWaba = numbers ? numbers.some((n) => n.id === phoneId) : null;

    const errors = {};
    if (settledError(phoneRes)) errors.phone = settledError(phoneRes).message;
    if (settledError(wabaRes)) errors.waba = settledError(wabaRes).message;

    return {
        token,
        phone,
        waba,
        wabaPhoneNumbers: numbers,
        phoneBelongsToWaba,
        errors,
        diagnostics: buildDiagnostics({
            token,
            tokenError: settledError(tokenRes),
            phone,
            phoneError: settledError(phoneRes),
            waba,
            wabaError: settledError(wabaRes),
            phoneBelongsToWaba
        })
    };
};

import { GRAPH_API_VERSION } from "../config.js";

const GRAPH_URL = `https://graph.facebook.com/${GRAPH_API_VERSION}`;

// Deja solo dígitos: WhatsApp espera el número con código de país, sin "+" ni espacios (ej. 51987654321).
export const normalizePhone = (value) => String(value ?? '').replace(/\D/g, '');

export const isValidPhone = (phone) => phone.length >= 8 && phone.length <= 15;

// Cantidad de variables {{n}} de un texto (usa el mayor índice encontrado).
const placeholderCount = (text = '') => {
    const indexes = (text.match(/{{\s*\d+\s*}}/g) || []).map((m) => parseInt(m.replace(/\D/g, ''), 10));
    return indexes.length ? Math.max(...indexes) : 0;
};

const textParameters = (text, values = [], section) => {
    const count = placeholderCount(text);
    const parameters = [];
    for (let i = 0; i < count; i++) {
        const value = values[i] == null ? '' : String(values[i]).trim();
        if (!value) {
            throw new Error(`Falta el valor de {{${i + 1}}} en ${section}`);
        }
        parameters.push({ type: 'text', text: value });
    }
    return parameters;
};

/**
 * Construye el mensaje de plantilla para la Cloud API.
 * @param template  plantilla tal como la devuelve Meta (name, language, components)
 * @param variables { header: [], body: [], buttons: [] } valores de cada {{n}} en orden
 * @param to        número de destino ya normalizado
 */
export const buildTemplatePayload = (template, variables = {}, to) => {
    const components = [];

    for (const component of template.components || []) {
        const type = String(component.type || '').toUpperCase();

        if (type === 'HEADER') {
            const format = String(component.format || 'TEXT').toUpperCase();
            if (['IMAGE', 'VIDEO', 'DOCUMENT'].includes(format)) {
                const link = component.example?.header_handle?.[0];
                if (!link) throw new Error(`La plantilla no tiene un archivo de ejemplo para el header (${format})`);
                const mediaType = format.toLowerCase();
                components.push({ type: 'header', parameters: [{ type: mediaType, [mediaType]: { link } }] });
            } else if (format === 'TEXT') {
                const parameters = textParameters(component.text, variables.header, 'el header');
                if (parameters.length) components.push({ type: 'header', parameters });
            }
        } else if (type === 'BODY') {
            const parameters = textParameters(component.text, variables.body, 'el body');
            if (parameters.length) components.push({ type: 'body', parameters });
        } else if (type === 'BUTTONS') {
            // Los valores de botones se consumen en orden, uno por cada botón URL con variable.
            let next = 0;
            (component.buttons || []).forEach((button, index) => {
                const buttonType = String(button.type || '').toUpperCase();
                if (buttonType === 'URL' && placeholderCount(button.url) > 0) {
                    const value = variables.buttons?.[next++];
                    const text = value == null ? '' : String(value).trim();
                    if (!text) throw new Error(`Falta el valor de la variable del botón "${button.text}"`);
                    components.push({
                        type: 'button',
                        sub_type: 'url',
                        index: String(index),
                        parameters: [{ type: 'text', text }]
                    });
                }
            });
        }
        // FOOTER y botones sin variables no necesitan parámetros.
    }

    return {
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'template',
        template: {
            name: template.name,
            language: { code: template.language || 'es' },
            ...(components.length ? { components } : {})
        }
    };
};

const graphError = (data, status) =>
    data?.error?.error_data?.details || data?.error?.error_user_msg || data?.error?.message || `Error HTTP ${status}`;

export const sendTemplateMessage = async (payload, { phoneId, tokenAccess }) => {
    const response = await fetch(`${GRAPH_URL}/${phoneId}/messages`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${tokenAccess}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) throw new Error(graphError(data, response.status));
    return data;
};

// GET genérico a la Graph API. El error incluye el código de Meta (190 = token inválido o caducado).
export const graphGet = async (path, tokenAccess) => {
    const response = await fetch(`${GRAPH_URL}/${path}`, { headers: { Authorization: `Bearer ${tokenAccess}` } });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) {
        const error = new Error(graphError(data, response.status));
        error.status = response.status;
        error.code = data?.error?.code;
        throw error;
    }
    return data;
};

// Pide varios campos de un objeto. Si Meta rechaza alguno (no existe en esta versión o falta permiso),
// los vuelve a pedir uno por uno y conserva los que sí responden.
export const graphGetFields = async (id, fields, tokenAccess) => {
    try {
        return await graphGet(`${id}?fields=${fields.join(',')}`, tokenAccess);
    } catch (error) {
        if (error.code === 190 || fields.length === 1) throw error;
        const parts = await Promise.all(
            fields.map((field) => graphGet(`${id}?fields=${field}`, tokenAccess).catch(() => ({})))
        );
        const merged = Object.assign({}, ...parts);
        if (!Object.keys(merged).some((key) => key !== 'id')) throw error;
        return merged;
    }
};

// Trae todas las plantillas de la cuenta (con paginación).
export const fetchTemplates = async ({ wabId, tokenAccess }) => {
    let url = `${GRAPH_URL}/${wabId}/message_templates?fields=name,language,status,category,components&limit=100`;
    const templates = [];

    for (let page = 0; url && page < 10; page++) {
        const response = await fetch(url, { headers: { Authorization: `Bearer ${tokenAccess}` } });
        const data = await response.json().catch(() => ({}));
        if (!response.ok) {
            const error = new Error(graphError(data, response.status));
            error.status = response.status;
            throw error;
        }
        templates.push(...(data.data || []));
        url = data.paging?.next;
    }
    return templates;
};

// Ejecuta worker sobre items con un máximo de `limit` tareas simultáneas, conservando el orden.
export const runWithConcurrency = async (items, limit, worker) => {
    const results = new Array(items.length);
    let cursor = 0;
    const runners = Array.from({ length: Math.min(limit, items.length) }, async () => {
        while (cursor < items.length) {
            const i = cursor++;
            results[i] = await worker(items[i], i);
        }
    });
    await Promise.all(runners);
    return results;
};

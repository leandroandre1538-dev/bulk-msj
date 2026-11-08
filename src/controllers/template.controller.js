import Credential from '../models/credential.model.js';
import { appendExecutionResults } from './execution.controller.js';
import {
    buildTemplatePayload,
    fetchTemplates,
    isValidPhone,
    normalizePhone,
    runWithConcurrency,
    sendTemplateMessage
} from '../libs/whatsapp.js';

// Máximo de destinatarios por petición. El frontend envía la lista en lotes de este tamaño
// para no superar el tiempo máximo de una función serverless.
export const MAX_RECIPIENTS_PER_REQUEST = 50;
const CONCURRENCY = 5;

// Las credenciales de WhatsApp se leen del servidor; nunca viajan desde el navegador.
const getUserCredential = (userId) => Credential.findOne({ userId });

const MISSING_CREDENTIAL = 'Configura tus credenciales de WhatsApp en Configuración antes de continuar';

export const getTemplates = async (req, res) => {
    try {
        const credential = await getUserCredential(req.user.id);
        if (!credential) {
            return res.status(400).json({ message: MISSING_CREDENTIAL });
        }

        const templates = await fetchTemplates(credential);
        // Solo las plantillas aprobadas por Meta se pueden enviar.
        const approved = templates.filter((t) => String(t.status).toUpperCase() === 'APPROVED');
        res.json({ data: approved });
    } catch (error) {
        console.error('Error al obtener plantillas:', error.message);
        res.status(error.status && error.status < 500 ? 400 : 502).json({ message: error.message });
    }
};

export const sendMessagesByTemplateAndListContacts = async (req, res) => {
    const { template, recipientList, executionId } = req.body;

    if (!template?.name || !Array.isArray(template.components)) {
        return res.status(400).json({ message: 'Plantilla inválida' });
    }
    if (!Array.isArray(recipientList) || recipientList.length === 0) {
        return res.status(400).json({ message: 'La lista de destinatarios está vacía' });
    }
    if (recipientList.length > MAX_RECIPIENTS_PER_REQUEST) {
        return res.status(400).json({ message: `Máximo ${MAX_RECIPIENTS_PER_REQUEST} destinatarios por petición` });
    }

    try {
        const credential = await getUserCredential(req.user.id);
        if (!credential) {
            return res.status(400).json({ message: MISSING_CREDENTIAL });
        }

        const results = await runWithConcurrency(recipientList, CONCURRENCY, async (recipient) => {
            const phone = normalizePhone(recipient?.number);
            if (!isValidPhone(phone)) {
                return { phone: String(recipient?.number ?? ''), state: 'warning', description: 'Número inválido (usa código de país, ej. 51987654321)' };
            }
            try {
                const payload = buildTemplatePayload(template, recipient.variables, phone);
                await sendTemplateMessage(payload, credential);
                return { phone, state: 'success', description: '' };
            } catch (error) {
                console.error(`Error al enviar mensaje a ${phone}:`, error.message);
                return { phone, state: 'warning', description: error.message };
            }
        });

        // Guarda el resultado del lote en el historial (si el envío está registrado)
        if (executionId) {
            await appendExecutionResults(executionId, req.user.id, results)
                .catch((error) => console.error('No se pudo guardar el historial del lote:', error));
        }

        res.json({ results });
    } catch (error) {
        console.error('Error al procesar los mensajes:', error);
        res.status(500).json({ message: 'Error al procesar los mensajes' });
    }
};

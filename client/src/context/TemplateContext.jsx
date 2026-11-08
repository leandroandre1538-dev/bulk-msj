import { createContext, useContext, useState } from "react";
import { getTemplatesRequest, sendMessagesByTemplateRequest } from "../api/template";
import { createExecutionRequest, finishExecutionRequest } from "../api/execution";

const TemplateContext = createContext();

// Debe coincidir con MAX_RECIPIENTS_PER_REQUEST del backend.
const BATCH_SIZE = 50;

export const useTemplate = () => {
    const context = useContext(TemplateContext);

    if (!context) {
        throw new Error("useTemplate must be used within a TemplateContext");
    }

    return context;
}

const apiErrorMessage = (error, fallback) =>
    error?.response?.data?.message || error?.message || fallback;

export function TemplateProvider({ children }) {
    const [templates, setTemplates] = useState([]);

    // Devuelve un mensaje de error (string) o null si todo salió bien.
    const getTemplates = async () => {
        try {
            const response = await getTemplatesRequest();
            setTemplates(response.data.data || []);
            return null;
        } catch (error) {
            console.log(error);
            setTemplates([]);
            return apiErrorMessage(error, 'No se pudieron obtener las plantillas');
        }
    }

    // Envía la lista en lotes para no superar el tiempo máximo de la función en Vercel.
    // Registra el envío en el historial: el servidor guarda el resultado de cada lote.
    // onProgress(enviados, total) se llama después de cada lote.
    const sendMessagesByTemplate = async ({ template, recipientList, groupId }, onProgress) => {
        let executionId = null;
        try {
            const created = await createExecutionRequest({
                templateName: template.name,
                templateLanguage: template.language,
                groupId,
                total: recipientList.length
            });
            executionId = created.data._id;
        } catch (error) {
            // Si no se puede registrar, el envío sigue igual (solo no quedará en el historial)
            console.error('No se pudo registrar el envío en el historial:', error);
        }

        const results = [];
        const failedBatches = []; // lotes que no llegaron al servidor: se guardan al finalizar
        for (let i = 0; i < recipientList.length; i += BATCH_SIZE) {
            const batch = recipientList.slice(i, i + BATCH_SIZE);
            try {
                const response = await sendMessagesByTemplateRequest({ template, recipientList: batch, executionId });
                results.push(...response.data.results);
            } catch (error) {
                console.error(error);
                const description = apiErrorMessage(error, 'Error al enviar el lote');
                const batchResults = batch.map((r) => ({ phone: r.number, state: 'warning', description }));
                results.push(...batchResults);
                failedBatches.push(...batchResults);
            }
            onProgress?.(Math.min(i + BATCH_SIZE, recipientList.length), recipientList.length);
        }

        if (executionId) {
            await finishExecutionRequest(executionId, failedBatches)
                .catch((error) => console.error('No se pudo finalizar el registro del envío:', error));
        }
        return { results, executionId };
    }

    return (
        <TemplateContext.Provider
            value={{
                templates,
                getTemplates,
                setTemplates,
                sendMessagesByTemplate
            }}
        >
            {children}
        </TemplateContext.Provider>
    );
}

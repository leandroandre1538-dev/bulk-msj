import { createContext, useContext, useState } from "react";
import { getTemplatesRequest, sendMessagesByTemplateRequest } from "../api/template";

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
    // onProgress(enviados, total) se llama después de cada lote.
    const sendMessagesByTemplate = async ({ template, recipientList }, onProgress) => {
        const results = [];
        for (let i = 0; i < recipientList.length; i += BATCH_SIZE) {
            const batch = recipientList.slice(i, i + BATCH_SIZE);
            try {
                const response = await sendMessagesByTemplateRequest({ template, recipientList: batch });
                results.push(...response.data.results);
            } catch (error) {
                console.error(error);
                const description = apiErrorMessage(error, 'Error al enviar el lote');
                results.push(...batch.map((r) => ({ phone: r.number, state: 'warning', description })));
            }
            onProgress?.(Math.min(i + BATCH_SIZE, recipientList.length), recipientList.length);
        }
        return { results };
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

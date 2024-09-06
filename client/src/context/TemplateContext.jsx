import { createContext, useContext, useState } from "react";
import { getTemplatesRequest, sendMessagesByTemplateRequest } from "../api/template";

const TemplateContext = createContext();

export const useTemplate = () => {
    const context = useContext(TemplateContext);

    if (!context) {
        throw new Error("useTemplate must be used within a TemplateContext");
    }

    return context;
}

export function TemplateProvider({ children }) {
    const [templates, setTemplates] = useState([]);

    const getTemplates = async (waba_id, access_token) => {
        try {
            const response = await getTemplatesRequest(waba_id, access_token);
            setTemplates(response.data.data);
        } catch (error) {
            console.log(error);
        }
    }

    const sendMessagesByTemplate = async (data) => {
        try {
            const response = await sendMessagesByTemplateRequest(data);
            return response.data;
        } catch (error) {
            console.error(error);
            throw error;
        }
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
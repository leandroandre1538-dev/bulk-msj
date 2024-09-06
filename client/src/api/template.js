import axios from './axios.js';

export const getTemplatesRequest = (waba_id, access_token) => {
    return axios.get(`/templates/getTemplates`, {
        params: { waba_id, access_token }
    });
};

export const sendMessagesByTemplateRequest = (data) => {
    return axios.post(`/templates/sendMessages`, data);
};
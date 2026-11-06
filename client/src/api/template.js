import axios from './axios.js';

// Las credenciales de WhatsApp se leen en el servidor, no se envían desde el navegador.
export const getTemplatesRequest = () => axios.get(`/templates/getTemplates`);

export const sendMessagesByTemplateRequest = (data) => axios.post(`/templates/sendMessages`, data);

import axios from './axios.js'

export const getCredentialsRequest = () => axios.get('/credentials');

export const getCredentialRequest = (id) => axios.get(`/credentials/${id}`);

export const createCredentialRequest = (credential) => axios.post('/credentials', credential);

export const updateCredentialRequest = (id, credential) => axios.put(`/credentials/${id}`, credential);

export const deleteCredentialRequest = (id) => axios.delete(`/credentials/${id}`);

export const getCredentialsByUserIdRequest = (userId) => axios.get(`/credentials/user/${userId}`);
export const getWhatsAppStatusRequest = () => axios.get('/whatsapp/status');

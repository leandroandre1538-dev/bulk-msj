import axios from './axios.js';

export const getExecutionsRequest = () => axios.get('/executions');

export const getExecutionRequest = (id) => axios.get(`/executions/${id}`);

export const createExecutionRequest = (data) => axios.post('/executions', data);

export const finishExecutionRequest = (id, extraResults = []) =>
    axios.patch(`/executions/${id}/finish`, { extraResults });

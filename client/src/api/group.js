import axios from './axios.js';

export const createGroupRequest = (group) => axios.post('/groups', group);

export const getAllGroupsRequest = () => axios.get('/groups');

export const getGroupRequest = (id) => axios.get(`/groups/${id}`);

export const updateGroupRequest = (id, group) => axios.put(`/groups/${id}`, group);

export const deleteGroupRequest = (id) => axios.delete(`/groups/${id}`);

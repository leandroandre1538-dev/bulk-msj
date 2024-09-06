import axios from "./axios.js";

export const getContactsRequest = () => axios.get("/contacts");

export const getContactRequest = (id) => axios.get(`/contacts/${id}`);

export const getContactsByGroupRequest = (groupId) => axios.get(`/contacts/group/${groupId}`)

export const createContactRequest = (contact) => axios.post("/contacts", contact);

export const deleteContactRequest = (id) => axios.delete(`/contacts/${id}`);

export const updateContactRequest = (id, contact) => axios.put(`/contacts/${id}`, contact);

export const createContactsForExcelRequest = async (formData) => {
    return await axios.post('/contacts/import', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    });
};
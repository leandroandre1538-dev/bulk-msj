import { createContext, useContext, useState } from "react";
import {
    getContactsRequest,
    getContactRequest,
    createContactRequest,
    updateContactRequest,
    deleteContactRequest,
    getContactsByGroupRequest,
    createContactsForExcelRequest
} from "../api/contact";

const ContactContext = createContext();

export const useContact = () => {
    const context = useContext(ContactContext);
    if (!context) {
        throw new Error("useContact must be used within a ContactProvider");
    }
    return context;
}

export function ContactProvider({ children }) {
    const [allContacts, setAllContacts] = useState([]);
    const [filteredContacts, setFilteredContacts] = useState([]);

    const getContacts = async () => {
        try {
            const res = await getContactsRequest();
            setAllContacts(res.data); // Actualizar contactos completos
            setFilteredContacts(res.data); // Inicialmente, los contactos filtrados son los mismos que todos
        } catch (error) {
            console.error(error);
            setAllContacts([]);
            setFilteredContacts([]);
        }
    }

    const getContactsByGroup = async (groupId) => {
        try {
            const res = await getContactsByGroupRequest(groupId);
            setFilteredContacts(res.data); // Actualizar solo los contactos filtrados

        } catch (error) {
            console.error(error);
            setFilteredContacts([]);
        }
    }

    const createContact = async (contact) => {
        try {
            const res = await createContactRequest(contact);
            if (res.status === 201) {
                setAllContacts(prevContacts => [...prevContacts, res.data]);
                setFilteredContacts(prevContacts => [...prevContacts, res.data]);
            } else {
                console.error('Error al crear contacto:', res);
            }
        } catch (error) {
            throw error;
        }
    };

    const deleteContact = async (id) => {
        try {
            const res = await deleteContactRequest(id);
            if (res.status === 204) {
                setAllContacts(prevContacts => prevContacts.filter(contact => contact._id !== id));
                setFilteredContacts(prevContacts => prevContacts.filter(contact => contact._id !== id)); // Actualizar también los contactos filtrados
            } else {
                console.log("Error en la respuesta de la API:", res.status);
            }
        } catch (error) {
            console.error("Error al eliminar contacto:", error);
        }
    }

    const getContact = async (id) => {
        try {
            const res = await getContactRequest(id);
            return res.data;
        } catch (error) {
            console.error(error);
        }
    }

    const updateContact = async (id, contact) => {
        try {
            const res = await updateContactRequest(id, contact);
            if (res.status === 200) {
                const updatedContact = res.data;
                setAllContacts(prevContacts =>
                    prevContacts.map(c => (c._id === id ? updatedContact : c))
                );
                setFilteredContacts(prevContacts =>
                    prevContacts.map(c => (c._id === id ? updatedContact : c))
                );
            } else {
                console.error('Error en la respuesta de la API:', res);
            }
        } catch (error) {
            throw error;
        }
    };

    const createContactsForExcel = async (file, groupId) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('groupId', groupId);

            const res = await createContactsForExcelRequest(formData);

            if (res.status === 201) {
                setAllContacts(prevContacts => [...prevContacts, ...res.data]);
                setFilteredContacts(prevContacts => [...prevContacts, ...res.data]);
            } else {
                console.error('Error al crear contactos desde Excel:', res);
            }
        } catch (error) {
            console.error('Error al crear contactos desde Excel:', error);
        }
    };

    return (
        <ContactContext.Provider
            value={{
                allContacts,
                filteredContacts,
                getContacts,
                getContactsByGroup,
                createContact,
                deleteContact,
                getContact,
                updateContact,
                createContactsForExcel
            }}
        >
            {children}
        </ContactContext.Provider>
    );
}
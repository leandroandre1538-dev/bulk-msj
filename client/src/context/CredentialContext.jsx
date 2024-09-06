import { createContext, useContext, useState } from "react";
import {
    getCredentialsRequest,
    getCredentialRequest,
    getCredentialsByUserIdRequest,
    createCredentialRequest,
    updateCredentialRequest,
    deleteCredentialRequest
} from "../api/credential";

const CredentialContext = createContext();

export const useCredential = () => {
    const context = useContext(CredentialContext);

    if (!context) {
        throw new Error("useCredential must be used within a CredentialProvider");
    }

    return context;
}

export function CredentialProvider({ children }) {
    const [credentials, setCredentials] = useState([]);
    const [credential, setCredential] = useState(null);

    const getCredentials = async () => {
        try {
            const response = await getCredentialsRequest();
            setCredentials(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    const getCredential = async (id) => {
        try {
            const response = await getCredentialRequest(id);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    const getCredentialsByUserId = async (userId) => {
        try {
            const response = await getCredentialsByUserIdRequest(userId);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    const createCredential = async (credential) => {
        const response = await createCredentialRequest(credential);
        console.log(response);
    }

    const updateCredential = async (id, credential) => {
        try {
            const response = await updateCredentialRequest(id, credential);
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    }

    const deleteCredential = async (id) => {
        try {
            const response = await deleteCredentialRequest(id);
            if (response.status == 204) {
                setCredentials(credentials.filter((credential) => credential._id !== id));
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <CredentialContext.Provider
            value={{
                credentials,
                credential,
                getCredentials,
                getCredential,
                getCredentialsByUserId,
                createCredential,
                updateCredential,
                deleteCredential
            }}
        >
            {children}
        </CredentialContext.Provider>
    );
}

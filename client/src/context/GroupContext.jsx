import { createContext, useContext, useState } from "react";
import {
    createGroupRequest,
    getAllGroupsRequest,
    getGroupRequest,
    updateGroupRequest,
    deleteGroupRequest
} from "../api/group";

const GroupContext = createContext();

export const useGroup = () => {
    const context = useContext(GroupContext);

    if (!context) {
        throw new Error("useGroup must be used within a GroupProvider");
    }

    return context;
}

export function GroupProvider({ children }) {
    const [groups, setGroups] = useState([]);
    const [group, setGroup] = useState(null);

    const getGroups = async () => {
        try {
            const response = await getAllGroupsRequest();
            setGroups(response.data);
        } catch (error) {
            console.error(error);
        }
    }

    const getGroup = async (id) => {
        try {
            const response = await getGroupRequest(id);
            return response.data;
        } catch (error) {
            console.error(error);
        }
    }

    const createGroup = async (group) => {
        try {
            const response = await createGroupRequest(group);
            console.log(response);
            return response.data; // Retorna el grupo creado si todo sale bien
        } catch (error) {
            if (error.response && error.response.status === 400) {
                throw new Error(error.response.data.message); // Arroja el mensaje de error del backend
            }
            throw new Error('Error al crear el grupo'); // Arroja un error genérico si es otro tipo de error
        }
    };    

    const updateGroup = async (id, group) => {
        try {
            const response = await updateGroupRequest(id, group);
            console.log(response);
        } catch (error) {
            console.error(error);
        }
    }

    const deleteGroup = async (id) => {
        try {
            const response = await deleteGroupRequest(id);
            if (response.status === 204) {
                setGroups(groups.filter((group) => group._id !== id));
            }
        } catch (error) {
            console.error(error);
        }
    }

    return (
        <GroupContext.Provider
            value={{
                groups,
                group,
                getGroups,
                getGroup,
                createGroup,
                updateGroup,
                deleteGroup
            }}
        >
            {children}
        </GroupContext.Provider>
    );
}
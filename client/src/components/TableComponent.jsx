import React, { useState, useEffect } from 'react';
import { useContact } from '../context/ContactContext';
import { useGroup } from "../context/GroupContext";
import { PlusCircleIcon, PencilIcon, TrashIcon } from '@heroicons/react/solid';
import CreateGroupModal from './CreateGroupModal';
import CreateEditContactModal from './CreateEditContactModal';

function TableComponent() {
    const { filteredContacts, getContactsByGroup, deleteContact } = useContact();
    const { groups, getGroups, getGroup } = useGroup();
    const [groupData, setGroupData] = useState(null);
    const [showConfirm, setShowConfirm] = useState(false);
    const [contactToDelete, setContactToDelete] = useState(null);
    const [selectedGroup, setSelectedGroup] = useState("");
    const [groupIdForForm, setGroupIdForForm] = useState("");
    const [variableKeys, setVariableKeys] = useState([]);
    const [isModalGroupNewOpen, setIsModalGroupNewOpen] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [contactData, setContactData] = useState(null);

    const openModalGroupNew = () => {
        setIsModalGroupNewOpen(true);
        getGroups();
    };

    const closeModalGroupNew = (newGroupId) => {
        setIsModalGroupNewOpen(false);
        getGroups().then(() => {
            if (newGroupId) {
                setSelectedGroup(newGroupId);
                fetchContactsByGroup(newGroupId);
            }
        });
    };

    const openCreateModal = () => {
        setContactData(null); // Limpia datos para creación
        setGroupIdForForm(selectedGroup);
        setIsModalOpen(true);
    };

    const openEditModal = (contact) => {
        setContactData(contact); // Configura datos para edición
        setGroupIdForForm(selectedGroup);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setContactData(null);
        setGroupIdForForm(null);
    };

    useEffect(() => {
        getGroups();
    }, []);

    useEffect(() => {
        if (groups.length > 0 && !selectedGroup) {
            const firstGroup = groups[0]._id;
            setSelectedGroup(firstGroup);
            fetchContactsByGroup(firstGroup);
        }
    }, [groups]);

    useEffect(() => {
        if (filteredContacts.length > 0) {
            const firstContact = filteredContacts[0];
            if (firstContact) {
                const keys = Object.keys(firstContact.variables);
                setVariableKeys(keys);
            } else {
                setVariableKeys([]);
            }
        } else {
            setVariableKeys([]);
        }
    }, [filteredContacts]);

    const fetchContactsByGroup = async (groupId) => {
        try {
            await getContactsByGroup(groupId);
            const group = await getGroup(groupId);
            setGroupData(group);
        } catch (error) {
            console.error('Error al filtrar datos por grupo:', error);
        }
    };

    const handleDeleteClick = (contact) => {
        setContactToDelete(contact);
        setShowConfirm(true);
    };

    const confirmDelete = async () => {
        if (contactToDelete) {
            await deleteContact(contactToDelete._id);
            setShowConfirm(false);
            setContactToDelete(null);
        }
    };

    const cancelDelete = () => {
        setShowConfirm(false);
        setContactToDelete(null);
    };

    const onGroupChange = async (event) => {
        const selectedGroup = event.target.value;
        setSelectedGroup(selectedGroup);
        await fetchContactsByGroup(selectedGroup);
    };

    const tooltipMessage = "Primero debe crear un grupo y luego importar una lista de contactos para permitir la inserción unitaria.";
    const isDisabled = groups.length === 0;

    return (
        <div className="relative overflow-x-auto">
            <div className="flex flex-col sm:flex-row sm:justify-between mb-4">
                <div className="flex space-x-2">
                    <button
                        type="button"
                        onClick={openModalGroupNew}
                        className="flex items-center justify-center mb-2 sm:mb-0 rounded-md bg-[#6D28D9] px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5B21B6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                    >
                        <PlusCircleIcon className="h-5 w-5 mr-2" />
                        Nuevo grupo
                    </button>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        disabled={filteredContacts.length <= 0}
                        title={isDisabled ? tooltipMessage : ""}
                        className={`flex items-center justify-center mb-2 sm:mb-0 rounded-md px-4 py-2 text-sm font-semibold text-white shadow-sm ${filteredContacts.length <= 0 ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#4CAF50] hover:bg-[#388E3C]'} focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${filteredContacts.length <= 0 ? 'focus-visible:outline-gray-400' : 'focus-visible:outline-green-600'}`}
                    >
                        <PlusCircleIcon className="h-5 w-5 mr-2" />
                        Nuevo contacto
                    </button>
                </div>

                {isModalGroupNewOpen && (
                    <CreateGroupModal
                        onClose={closeModalGroupNew}
                    />
                )}


                {isModalOpen && (
                    <CreateEditContactModal
                        contact={contactData}
                        groupId={groupIdForForm}
                        variableKeys={variableKeys}
                        onClose={closeModal}
                    />
                )}

                <select
                    onChange={onGroupChange}
                    value={selectedGroup}
                    className="bg-[#F2F2DC] text-[#333333] p-2 rounded transition duration-200 ease-in-out focus:ring-2 focus:ring-[#6D28D9] focus:outline-none"
                >
                    {groups.length > 0 ? (
                        groups.map(group => (
                            <option key={group._id} value={group._id}>{group.groupName}</option>
                        ))
                    ) : (
                        <option value="" disabled>No hay grupos</option>
                    )}
                </select>
            </div>

            <table className="min-w-full divide-y divide-[#F2F2F2]/50">
                <thead className="bg-[#6D28D9] text-[#F2F2DC]">
                    <tr>
                        <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider">Nombre</th>
                        <th className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider">Número</th>
                        {variableKeys.map(key => (
                            <th key={key} className="px-4 py-2 text-left text-xs font-bold uppercase tracking-wider">{key}</th>
                        ))}
                        <th className="px-4 py-2 text-center text-xs font-bold uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredContacts.length > 0 ? (
                        filteredContacts.map((contact) => (
                            <tr key={contact._id}>
                                <td className="px-4 py-2 text-sm font-medium text-[#F2F2DC]">{contact.name || '-'}</td>
                                <td className="px-4 py-2 text-sm text-[#F2F2DC]">{contact.phoneNumber || '-'}</td>
                                {variableKeys.map(key => (
                                    <td key={key} className="px-4 py-2 text-sm text-[#F2F2DC]">
                                        {contact.variables && contact.variables[key] ? contact.variables[key] : '-'}
                                    </td>
                                ))}
                                <td className="px-4 py-2 text-center text-sm text-[#F2F2DC]">
                                    <div className="flex justify-center items-center space-x-2">
                                        <button onClick={() => openEditModal(contact)}>
                                            <PencilIcon className="h-5 w-5 text-[#F2F2DC] hover:text-[#b88efd]" />
                                        </button>
                                        <button onClick={() => handleDeleteClick(contact)}>
                                            <TrashIcon className="h-5 w-5 text-[#F2F2DC] hover:text-[#b88efd]" />
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))
                    ) : (
                        <tr>
                            <td colSpan={4 + variableKeys.length} className="px-4 py-2 text-center text-sm text-[#F2F2DC]">No hay contactos</td>
                        </tr>
                    )}
                </tbody>
            </table>

            {showConfirm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-[#F2F2DC] p-6 rounded-lg shadow-lg w-full max-w-md">
                        <h3 className="text-lg font-semibold text-[#141414]">Confirmar Eliminación</h3>
                        <p className="text-[#141414] mt-2">¿Estás seguro de que deseas eliminar este contacto?</p>
                        <div className="flex justify-end gap-4 mt-4">
                            <button
                                onClick={confirmDelete}
                                className="bg-[#6D28D9] text-white px-4 py-2 rounded-md hover:bg-[#5B21B6]"
                            >
                                Sí
                            </button>
                            <button
                                onClick={cancelDelete}
                                className="bg-[#F2F2DC] text-[#141414] px-4 py-2 rounded-md hover:bg-[#D1D1D1]"
                            >
                                No
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TableComponent;

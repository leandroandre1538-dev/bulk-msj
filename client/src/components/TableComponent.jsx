import React, { useState, useEffect } from 'react';
import { useContact } from '../context/ContactContext';
import { useGroup } from "../context/GroupContext";
import { Icon } from './ui';
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
        <div>
            <div className="mb-5 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-3">
                    <label htmlFor="group-select" className="text-sm text-fg-2">Grupo</label>
                    <select
                        id="group-select"
                        onChange={onGroupChange}
                        value={selectedGroup}
                        className="g-select h-11 sm:w-72"
                    >
                        {groups.length > 0 ? (
                            groups.map(group => (
                                <option key={group._id} value={group._id}>{group.groupName}</option>
                            ))
                        ) : (
                            <option value="" disabled>No hay grupos</option>
                        )}
                    </select>
                    {selectedGroup && (
                        <span className="g-chip">{filteredContacts.length} contacto(s)</span>
                    )}
                </div>
                <div className="flex flex-wrap gap-2">
                    <button type="button" onClick={openModalGroupNew} className="g-btn-tonal">
                        <Icon name="group_add" size={20} />
                        Nuevo grupo
                    </button>
                    <button
                        type="button"
                        onClick={openCreateModal}
                        disabled={filteredContacts.length <= 0}
                        title={isDisabled ? tooltipMessage : ""}
                        className="g-btn-tonal"
                    >
                        <Icon name="person_add" size={20} />
                        Nuevo contacto
                    </button>
                </div>
            </div>

            {groupData?.description && (
                <p className="-mt-2 mb-4 text-sm text-muted">{groupData.description}</p>
            )}

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

            <div className="overflow-x-auto rounded-2xl border border-line bg-bg">
                <table className="min-w-full text-left text-sm">
                    <thead className="bg-surface-2 text-fg-2">
                        <tr>
                            <th className="px-4 py-3 font-medium">Nombre</th>
                            <th className="px-4 py-3 font-medium">Número</th>
                            {variableKeys.map(key => (
                                <th key={key} className="px-4 py-3 font-medium">{key}</th>
                            ))}
                            <th className="px-4 py-3 text-right font-medium">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                        {filteredContacts.length > 0 ? (
                            filteredContacts.map((contact) => (
                                <tr key={contact._id} className="transition-colors hover:bg-surface">
                                    <td className="px-4 py-3 font-medium text-fg">{contact.name || '-'}</td>
                                    <td className="px-4 py-3 font-mono text-fg-2">{contact.phoneNumber || '-'}</td>
                                    {variableKeys.map(key => (
                                        <td key={key} className="px-4 py-3 text-fg-2">
                                            {contact.variables && contact.variables[key] ? contact.variables[key] : '-'}
                                        </td>
                                    ))}
                                    <td className="px-2 py-1 text-right">
                                        <div className="flex justify-end">
                                            <button className="g-icon-btn" onClick={() => openEditModal(contact)} aria-label={`Editar ${contact.name}`} title="Editar">
                                                <Icon name="edit" size={20} />
                                            </button>
                                            <button className="g-icon-btn hover:text-[var(--danger)]" onClick={() => handleDeleteClick(contact)} aria-label={`Eliminar ${contact.name}`} title="Eliminar">
                                                <Icon name="delete" size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={3 + variableKeys.length} className="px-4 py-12 text-center text-muted">
                                    <Icon name="person_off" size={36} className="mb-2 block text-muted" />
                                    No hay contactos en este grupo. Importa un Excel para empezar.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {showConfirm && (
                <div className="g-backdrop">
                    <div className="g-dialog">
                        <Icon name="delete" size={28} className="text-[var(--danger)]" />
                        <h3 className="mt-3 text-xl text-fg">¿Eliminar contacto?</h3>
                        <p className="mt-2 text-fg-2">
                            Se eliminará <strong>{contactToDelete?.name}</strong> ({contactToDelete?.phoneNumber}) de este grupo.
                        </p>
                        <div className="mt-6 flex justify-end gap-2">
                            <button onClick={cancelDelete} className="g-btn-text">Cancelar</button>
                            <button onClick={confirmDelete} className="g-btn-danger">Eliminar</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default TableComponent;

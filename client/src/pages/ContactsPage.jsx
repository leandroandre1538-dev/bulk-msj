import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ImportModal from '../components/ImportModal';
import { useContact } from '../context/ContactContext';
import TableComponent from '../components/TableComponent';
import { useGroup } from "../context/GroupContext";

function ContactsPage() {
    const { user } = useAuth();
    const { createContactsForExcel } = useContact();
    const [showModal, setShowModal] = useState(false);
    const { groups, getGroups } = useGroup();

    useEffect(() => {
        getGroups();
    }, []);

    const handleImportClick = () => {
        if (groups.length > 0) {
            setShowModal(true);
        }
    };

    const handleModalClose = () => {
        setShowModal(false);
    };

    const handleModalConfirm = async (file, groupId) => {
        try {
            await createContactsForExcel(file, groupId);
            setShowModal(false);
        } catch (error) {
            console.log("Error al importar contactos: " + error.message);
        }
    };

    const isDisabled = groups.length === 0;
    const tooltipMessage = "Primero debes crear un grupo";

    return (
        <>
            {showModal && (
                <ImportModal
                    onClose={handleModalClose}
                    onConfirm={handleModalConfirm}
                />
            )}
            <div className="lg:flex lg:items-center lg:justify-between h-auto max-h-screen">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-[#F2F2DC] sm:truncate sm:text-3xl sm:tracking-tight">
                        Contactos
                    </h2>
                    <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                        <div className="mt-2 flex items-center text-sm text-[#7A7A7A]">
                            Hola {user.firstName} {user.lastName}, aquí puedes gestionar la lista de contactos a los cuales será enviado el mensaje masivo.
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex flex-col flex-1 items-center justify-center py-6 px-4">
                <div className="bg-[#141414] w-full p-10 rounded-lg shadow-lg">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-xl font-bold leading-7 text-[#F2F2DC] sm:truncate sm:text-2xl sm:tracking-tight">
                                Lista de Contactos
                            </h2>
                        </div>
                        <div className="flex flex-col md:flex-row md:space-x-4">
                            <button
                                type="button"
                                onClick={handleImportClick}
                                disabled={isDisabled}
                                title={isDisabled ? tooltipMessage : ""}
                                className={`mb-3 md:mb-0 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm w-full lg:w-auto ${isDisabled ? "bg-gray-500 cursor-not-allowed" : "bg-[#6D28D9] hover:bg-[#5B21B6]"}`}
                            >
                                <span>Importar</span>
                            </button>
                            <button
                                type="button"
                                disabled={isDisabled}
                                title={isDisabled ? tooltipMessage : ""}
                                className={`mb-3 md:mb-0 inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm w-full lg:w-auto ${isDisabled ? "bg-gray-500 cursor-not-allowed" : "bg-[#6D28D9] hover:bg-[#5B21B6]"}`}
                            >
                                <span>Exportar</span>
                            </button>
                        </div>
                    </div>

                    <div className="border-b border-[#F2F2F2]/20 p-2 mt-4"></div>

                    <div className="mt-4">
                        <TableComponent/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default ContactsPage;
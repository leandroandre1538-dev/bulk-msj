import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import ImportModal from '../components/ImportModal';
import { useContact } from '../context/ContactContext';
import TableComponent from '../components/TableComponent';
import { useGroup } from "../context/GroupContext";
import { Alert, Icon, PageHeader } from '../components/ui';

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

    // El modal muestra el resultado (o el error) y se cierra solo si la importación fue exitosa.
    const handleModalConfirm = (file, groupId) => createContactsForExcel(file, groupId);

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

            <PageHeader
                title="Contactos"
                subtitle={`Hola ${user.firstName}, organiza aquí los grupos y contactos que recibirán tus envíos.`}
                actions={
                    <button
                        type="button"
                        onClick={handleImportClick}
                        disabled={isDisabled}
                        title={isDisabled ? tooltipMessage : ""}
                        className="g-btn-primary"
                    >
                        <Icon name="upload_file" size={20} />
                        Importar Excel
                    </button>
                }
            />

            {isDisabled && (
                <Alert type="info" className="mb-4">Primero crea un grupo con el botón «Nuevo grupo» y luego importa tu Excel.</Alert>
            )}

            <section className="g-card">
                <TableComponent />
            </section>
        </>
    );
}

export default ContactsPage;

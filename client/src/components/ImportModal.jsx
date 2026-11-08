import React, { useState } from 'react';
import LoaderGeneral from './LoaderGeneral'; // Asegúrate de que la ruta sea correcta
import { useGroup } from "../context/GroupContext";
import { Alert, Icon } from "./ui";

const ImportModal = ({ onClose, onConfirm }) => {
    const [groupId, setGroupId] = useState("");
    const { groups } = useGroup();
    const [file, setFile] = useState(null);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false); // Estado para manejar el loader

    const handleConfirm = async () => {
        if (groupId.trim() === "" || !file) {
            setError("Debe seleccionar un grupo y un archivo.");
            setSuccess(""); // Limpiar mensajes de éxito si hay error
            return;
        }

        setLoading(true); // Mostrar el loader

        try {
            // Aquí podrías realizar la llamada a la API o la operación de importación
            const imported = await onConfirm(file, groupId); // Asume que `onConfirm` es una función asincrónica
            setSuccess(Array.isArray(imported) ? `Se importaron ${imported.length} contacto(s)` : "Importación exitosa");
            setError(""); // Limpiar errores si la operación es exitosa

            // Mostrar el mensaje de éxito y cerrar el modal después de 1.5 segundos
            setTimeout(() => {
                onClose(); // Cerrar el modal
            }, 1500);

        } catch (error) {
            // Se deja el modal abierto para que el usuario vea el motivo del error
            setError(error.message || "Hubo un error durante la importación.");
            setSuccess("");
        } finally {
            setLoading(false); // Ocultar el loader
        }
    };

    const onGroupChange = (event) => {
        setGroupId(event.target.value);
    }

    return (
        <>
            {loading && <LoaderGeneral />}
            <div className={`g-backdrop ${loading ? 'pointer-events-none' : ''}`}>
                <div className="g-dialog">
                    <Icon name="upload_file" size={28} className="text-accent" />
                    <h2 className="mt-3 text-2xl text-fg">Importar contactos</h2>
                    <p className="mt-2 mb-5 text-sm text-fg-2">
                        El Excel necesita una columna <strong>Número</strong> (con código de país, ej. 51987654321) y, opcionalmente,
                        <strong> Nombre</strong>. Las demás columnas se guardan como variables para la plantilla.
                    </p>

                    {error && <Alert type="error" className="mb-4">{error}</Alert>}
                    {success && <Alert type="success" className="mb-4">{success}</Alert>}

                    <div className="flex flex-col gap-4">
                        <div>
                            <label className="g-label" htmlFor="import-group">Grupo de destino</label>
                            <select id="import-group" onChange={onGroupChange} className="g-select" defaultValue="">
                                <option value="">Selecciona un grupo</option>
                                {groups.length > 0 ? (
                                    groups.map(group => (
                                        <option key={group._id} value={group._id}>{group.groupName}</option>
                                    ))
                                ) : (
                                    <option value="" disabled>No hay grupos</option>
                                )}
                            </select>
                        </div>

                        <label
                            htmlFor="import-file"
                            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-line bg-bg px-4 py-8 text-center transition-colors hover:border-[var(--accent)]"
                        >
                            <Icon name={file ? "description" : "cloud_upload"} size={32} className="text-accent" />
                            <span className="text-sm text-fg">{file ? file.name : "Haz clic para elegir un archivo .xlsx o .xls"}</span>
                            <span className="text-xs text-muted">Máximo 4 MB</span>
                            <input
                                id="import-file"
                                type="file"
                                className="sr-only"
                                accept=".xlsx, .xls"
                                onChange={(e) => setFile(e.target.files[0])}
                            />
                        </label>
                    </div>

                    <div className="mt-6 flex justify-end gap-2">
                        <button onClick={onClose} className="g-btn-text">Cancelar</button>
                        <button onClick={handleConfirm} className="g-btn-primary" disabled={loading}>
                            Importar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ImportModal;

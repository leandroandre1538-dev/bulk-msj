import React, { useState } from 'react';
import LoaderGeneral from './LoaderGeneral'; // Asegúrate de que la ruta sea correcta
import { useGroup } from "../context/GroupContext";

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
            {loading && <LoaderGeneral />} {/* Mostrar el loader si `loading` es verdadero */}
            <div className={`fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-40 p-4 sm:p-0 ${loading ? 'pointer-events-none' : ''}`}>
                <div className="bg-[#141414] rounded-lg p-6 shadow-lg max-w-sm w-full z-30"> {/* Asegúrate de que el z-index del modal sea menor que el del loader */}
                    <h2 className="text-xl font-semibold text-[#F2F2DC] mb-4">Importar Contactos</h2>
                    {error && (
                        <div className="bg-red-500 text-white p-2 rounded-md mb-4 text-center">
                            {error}
                        </div>
                    )}
                    {success && (
                        <div className="bg-green-500 text-white p-2 rounded-md mb-4 text-center">
                            {success}
                        </div>
                    )}
                    <p className="text-[#F2F2DC] mb-2">Seleccione un grupo para estos contactos:</p>
                    <select
                        onChange={onGroupChange}
                        className="w-full p-2 bg-[#F2F2DC] text-[#333333] rounded mb-4 transition duration-200 ease-in-out focus:ring-2 focus:ring-[#6D28D9] focus:outline-none"
                    >
                        <option value="">Seleccionar un grupo</option>
                        {groups.length > 0 ? (
                            groups.map(group => (
                                <option key={group._id} value={group._id}>{group.groupName}</option>
                            ))
                        ) : (
                            <option value="" disabled>No hay grupos</option>
                        )}
                    </select>
                    <input
                        type="file"
                        className="w-full p-2 bg-[#333333] text-[#F2F2DC] rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-[#6D28D9] transition duration-200 ease-in-out"
                        accept=".xlsx, .xls"
                        onChange={(e) => setFile(e.target.files[0])}
                    />
                    <div className="flex justify-end mt-4">
                        <button
                            onClick={handleConfirm}
                            className="bg-[#6D28D9] text-white px-4 py-2 rounded-md mr-2 hover:bg-[#5B21B6] transition duration-200 ease-in-out"
                            disabled={loading} // Desactiva el botón mientras se carga
                        >
                            Continuar
                        </button>
                        <button
                            onClick={onClose}
                            className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition duration-200 ease-in-out"
                        >
                            Cancelar
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};

export default ImportModal;
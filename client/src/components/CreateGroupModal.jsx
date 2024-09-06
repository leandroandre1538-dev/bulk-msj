import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useGroup } from "../context/GroupContext";
import LoaderGeneral from './LoaderGeneral';

const CreateGroupModal = ({ onClose }) => {
    const { createGroup } = useGroup();
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const response = await createGroup(data);
            setSuccessMessage("¡Grupo creado exitosamente!");
            setErrorMessage(""); 
            reset();
            setTimeout(() => {
                setSuccessMessage("");
                onClose(response._id);
            }, 3000);
        } catch (error) {
            setErrorMessage(error.message === 'Ya existe un grupo con ese nombre' ? 
                "Intento registrar un grupo que ya existe, intente con otro nombre" : 
                "Ocurrió un error, por favor intente nuevamente.");
            setTimeout(() => {
                setErrorMessage("");
            }, 3000);
        } finally {
            setLoading(false);  // Finaliza la carga sin importar el resultado
        }
    };    

    return (
        <>
            {loading && <LoaderGeneral />}
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-[#141414] rounded-lg p-6 shadow-lg w-full max-w-md">
                    <h2 className="text-xl font-semibold text-[#F2F2DC] mb-4">Crear Grupo</h2>

                    {successMessage && (
                        <div className="bg-green-500 text-white p-2 my-2 rounded-md text-center">
                            {successMessage}
                        </div>
                    )}

                    {errorMessage && (
                        <div className="bg-red-500 text-white p-2 my-2 rounded-md text-center">
                            {errorMessage}
                        </div>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <label className="block text-[#F2F2DC] mb-2">Nombre del grupo</label>
                        <input
                            type="text"
                            {...register('groupName', { required: true })}
                            className="w-full p-2 border border-[#F2F2DC] rounded-md text-black mb-2"
                            placeholder="Nombre del grupo"
                        />
                        {errors.groupName && <p className="text-red-500">El nombre del grupo es requerido</p>}

                        <label className="block text-[#F2F2DC] mb-2">Descripción</label>
                        <textarea
                            {...register('description', { required: true })}
                            className="w-full p-2 border border-[#F2F2DC] rounded-md text-black mb-4"
                            placeholder="Descripción"
                        />
                        {errors.description && <p className="text-red-500">La descripción es requerida</p>}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-[#6D28D9] text-white px-4 py-2 rounded-md mr-2"
                                disabled={loading} 
                            >
                                Crear
                            </button>
                            <button
                                onClick={() => onClose(null)} // Pasar null si se cancela
                                className="bg-red-500 text-white px-4 py-2 rounded-md"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateGroupModal;
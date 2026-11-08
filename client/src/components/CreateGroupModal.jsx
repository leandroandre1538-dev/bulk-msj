import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { useGroup } from "../context/GroupContext";
import LoaderGeneral from './LoaderGeneral';
import { Alert, Icon } from './ui';

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
            <div className="g-backdrop">
                <div className="g-dialog">
                    <Icon name="group_add" size={28} className="text-accent" />
                    <h2 className="mt-3 mb-5 text-2xl text-fg">Nuevo grupo</h2>

                    {successMessage && <Alert type="success" className="mb-4">{successMessage}</Alert>}
                    {errorMessage && <Alert type="error" className="mb-4">{errorMessage}</Alert>}

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <div>
                            <label className="g-label">Nombre del grupo</label>
                            <input
                                type="text"
                                {...register('groupName', { required: true })}
                                className="g-input"
                                placeholder="Ej. Clientes Lima"
                            />
                            {errors.groupName && <p className="g-field-error">El nombre del grupo es requerido</p>}
                        </div>

                        <div>
                            <label className="g-label">Descripción</label>
                            <textarea
                                {...register('description', { required: true })}
                                className="g-textarea"
                                placeholder="¿Para qué es este grupo?"
                            />
                            {errors.description && <p className="g-field-error">La descripción es requerida</p>}
                        </div>

                        <div className="mt-2 flex justify-end gap-2">
                            <button type="button" onClick={() => onClose(null)} className="g-btn-text">
                                Cancelar
                            </button>
                            <button type="submit" className="g-btn-primary" disabled={loading}>
                                Crear grupo
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateGroupModal;

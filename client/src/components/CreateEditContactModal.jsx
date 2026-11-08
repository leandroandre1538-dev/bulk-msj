import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useContact } from "../context/ContactContext";
import LoaderGeneral from './LoaderGeneral';
import { Alert, Icon } from './ui';

const CreateEditContactModal = ({ contact, groupId, variableKeys, onClose }) => {
    const { createContact, updateContact } = useContact();
    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const { register, handleSubmit, formState: { errors }, reset } = useForm();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (contact) {
            reset({ name: contact.name, phoneNumber: contact.phoneNumber, ...contact.variables });
        } else {
            reset({ name: "", phoneNumber: "", variables: {} });
        }
    }, [contact, reset]);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const contactData = {
                name: data.name,
                phoneNumber: data.phoneNumber,
                groupId: groupId,
                variables: { ...data.variables }
            };

            if (contact) {
                await updateContact(contact._id, contactData);
                setSuccessMessage("¡Contacto actualizado exitosamente!");
            } else {
                await createContact(contactData);
                setSuccessMessage("¡Contacto creado exitosamente!");
            }

            reset();
            setTimeout(() => {
                setSuccessMessage("");
                onClose();
            }, 3000);
        } catch (error) {
            setSuccessMessage(""); // Limpia el mensaje de éxito en caso de error
            if (error.response && error.response.status === 409) {
                setErrorMessage("Número de contacto ya existente, intente con otro.");
            } else {
                setErrorMessage("Ocurrió un error, por favor intente nuevamente.");
            }
            console.error('Error al procesar el contacto:', error);
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
                    <Icon name={contact ? "edit" : "person_add"} size={28} className="text-accent" />
                    <h2 className="mt-3 mb-5 text-2xl text-fg">
                        {contact ? "Editar contacto" : "Nuevo contacto"}
                    </h2>

                    {successMessage && <Alert type="success" className="mb-4">{successMessage}</Alert>}
                    {errorMessage && <Alert type="error" className="mb-4">{errorMessage}</Alert>}

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        <div>
                            <label className="g-label">Nombre</label>
                            <input
                                type="text"
                                {...register('name', {
                                    required: "El nombre es requerido",
                                    validate: value => value.trim() !== "" || "El nombre no puede estar vacío"
                                })}
                                className="g-input"
                                placeholder="Nombre"
                            />
                            {errors.name && <p className="g-field-error">{errors.name.message}</p>}
                        </div>

                        <div>
                            <label className="g-label">Número (con código de país)</label>
                            <input
                                type="text"
                                inputMode="numeric"
                                {...register('phoneNumber', {
                                    required: "El número es requerido",
                                    pattern: {
                                        value: /^[0-9]+$/,
                                        message: "El número debe contener solo números"
                                    },
                                    validate: value => value.trim() !== "" || "El número no puede estar vacío"
                                })}
                                className="g-input font-mono"
                                placeholder="51987654321"
                            />
                            {errors.phoneNumber && <p className="g-field-error">{errors.phoneNumber.message}</p>}
                        </div>

                        {variableKeys.map((key, index) => (
                            <div key={index}>
                                <label className="g-label">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <input
                                    type="text"
                                    {...register(`variables.${key}`, {
                                        required: `${key.charAt(0).toUpperCase() + key.slice(1)} es requerido`,
                                        validate: value => value.trim() !== "" || `${key.charAt(0).toUpperCase() + key.slice(1)} no puede estar vacío`
                                    })}
                                    className="g-input"
                                    placeholder={key}
                                    defaultValue={contact?.variables[key] || ""}
                                />
                                {errors.variables?.[key] && <p className="g-field-error">{errors.variables[key]?.message}</p>}
                            </div>
                        ))}

                        <div className="mt-2 flex justify-end gap-2">
                            <button type="button" onClick={() => onClose()} className="g-btn-text">
                                Cancelar
                            </button>
                            <button type="submit" className="g-btn-primary" disabled={loading}>
                                {contact ? "Guardar cambios" : "Crear contacto"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </>
    );
};

export default CreateEditContactModal;

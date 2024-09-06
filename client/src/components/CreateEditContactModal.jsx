import React, { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { useContact } from "../context/ContactContext";
import LoaderGeneral from './LoaderGeneral';

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
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
                <div className="bg-[#141414] rounded-lg p-6 shadow-lg w-full max-w-md">
                    <h2 className="text-xl font-semibold text-[#F2F2DC] mb-4">
                        {contact ? "Editar Contacto" : "Crear Contacto"}
                    </h2>

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
                        <label className="block text-[#F2F2DC] mb-2">Nombre</label>
                        <input
                            type="text"
                            {...register('name', {
                                required: "El nombre es requerido",
                                validate: value => value.trim() !== "" || "El nombre no puede estar vacío"
                            })}
                            className="w-full p-2 border border-[#F2F2DC] rounded-md text-black mb-2"
                            placeholder="Nombre"
                        />
                        {errors.name && <p className="text-red-500">{errors.name.message}</p>}

                        <label className="block text-[#F2F2DC] mb-2">Número</label>
                        <input
                            type="text"
                            {...register('phoneNumber', {
                                required: "El número es requerido",
                                pattern: {
                                    value: /^[0-9]+$/,
                                    message: "El número debe contener solo números"
                                },
                                validate: value => value.trim() !== "" || "El número no puede estar vacío"
                            })}
                            className="w-full p-2 border border-[#F2F2DC] rounded-md text-black mb-2"
                            placeholder="Número"
                        />
                        {errors.phoneNumber && <p className="text-red-500">{errors.phoneNumber.message}</p>}

                        {variableKeys.map((key, index) => (
                            <div key={index} className="mb-2">
                                <label className="block text-[#F2F2DC] mb-1">{key.charAt(0).toUpperCase() + key.slice(1)}</label>
                                <input
                                    type="text"
                                    {...register(`variables.${key}`, {
                                        required: `${key.charAt(0).toUpperCase() + key.slice(1)} es requerido`,
                                        validate: value => value.trim() !== "" || `${key.charAt(0).toUpperCase() + key.slice(1)} no puede estar vacío`
                                    })}
                                    className="w-full p-2 border border-[#F2F2DC] rounded-md text-black"
                                    placeholder={key}
                                    defaultValue={contact?.variables[key] || ""}
                                />
                                {errors.variables?.[key] && <p className="text-red-500">{errors.variables[key]?.message}</p>}
                            </div>
                        ))}

                        <div className="flex justify-end">
                            <button
                                type="submit"
                                className="bg-[#6D28D9] text-white px-4 py-2 rounded-md mr-2"
                                disabled={loading}
                            >
                                {contact ? "Actualizar" : "Crear"}
                            </button>
                            <button
                                onClick={() => onClose()}
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

export default CreateEditContactModal;

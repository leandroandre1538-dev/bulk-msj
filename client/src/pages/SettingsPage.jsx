import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCredential } from "../context/CredentialContext";

function SettingsPage() {
    const { user } = useAuth();
    const { getCredentialsByUserId, updateCredential, createCredential } = useCredential();
    const [isEditing, setIsEditing] = useState(false);
    const [wabId, setWabId] = useState('');
    const [phoneId, setPhoneId] = useState('');
    const [tokenAccess, setTokenAccess] = useState('');
    const [updatedAtCredential, setUpdatedAtCredential] = useState('');
    const [errors, setErrors] = useState({ wabId: false, phoneId: false, tokenAccess: false });

    useEffect(() => {
        const loadCredential = async () => {
            try {
                const fetchedCredentials = await getCredentialsByUserId(user.id);
                if (fetchedCredentials.length > 0) {
                    const fetchedCredential = fetchedCredentials[0]; // Accede al primer elemento del array
                    setWabId(fetchedCredential.wabId || '');
                    setPhoneId(fetchedCredential.phoneId || '');
                    setTokenAccess(fetchedCredential.tokenAccess || '');
                    setUpdatedAtCredential(fetchedCredential.updatedAt || '');
                }
            } catch (error) {
                console.error('Error loading credential:', error);
            }
        };
        loadCredential();
    }, [user.id, getCredentialsByUserId]);

    const handleEditClick = () => {
        setIsEditing(true);
    };

    const validateInput = (value) => {
        return value.trim() === '';
    };

    function handleInputChange(setValue) {
        return (e) => {
            setValue(e.target.value);
        };
    }

    const handleSaveClick = async () => {
        const newErrors = {
            wabId: validateInput(wabId),
            phoneId: validateInput(phoneId),
            tokenAccess: validateInput(tokenAccess)
        };
        setErrors(newErrors);

        if (!Object.values(newErrors).some(error => error)) {
            const fetchedCredentials = await getCredentialsByUserId(user.id);
            const credentialData = { wabId, phoneId, tokenAccess, userId: user.id };

            if (fetchedCredentials.length > 0 && fetchedCredentials[0]._id) {
                await updateCredential(fetchedCredentials[0]._id, credentialData);
            } else {
                await createCredential(credentialData);
            }

            setIsEditing(false);
            console.log('Changes saved successfully');
        }
    };

    return (
        <>
            <div className="lg:flex lg:items-center lg:justify-between h-auto max-h-screen">
                <div className="min-w-0 flex-1">
                    <h2 className="text-2xl font-bold leading-7 text-[#F2F2DC] sm:truncate sm:text-3xl sm:tracking-tight">
                        Configuración
                    </h2>
                    <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                        <div className="mt-2 flex items-center text-sm text-[#7A7A7A]">
                            Hola {user.firstName} {user.lastName}, aquí podrás realizar configuraciones sobre tu cuenta.
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex h-auto max-h-screen items-center justify-center py-6">
                <div className="bg-[#141414] w-full max-w p-10 rounded-lg shadow-lg">
                    <div className="md:flex md:items-center md:justify-between">
                        <div className="min-w-0 flex-1">
                            <h2 className="text-xl font-bold leading-7 text-[#F2F2DC] sm:truncate sm:text-2xl sm:tracking-tight">
                                Credenciales
                            </h2>
                            <div className="mt-1 flex flex-col sm:mt-0 sm:flex-row sm:flex-wrap sm:space-x-6">
                                <div className="mt-2 flex items-center text-sm text-[#7A7A7A]">
                                    Última actualización: { updatedAtCredential.split('T')[0] }. 
                                </div>
                            </div>
                        </div>
                        <div className="mt-5 flex flex-col md:flex-row md:space-x-4">
                            <button
                                type="button"
                                className="mb-3 md:mb-0 inline-flex items-center justify-center rounded-md bg-[#6D28D9] px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-[#5B21B6] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 w-full lg:w-auto"
                                onClick={handleEditClick}
                            >
                                <span>Editar</span>
                            </button>
                            <button
                                type="button"
                                className={`inline-flex items-center justify-center rounded-md px-3 py-2 text-sm font-semibold text-white shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 w-full lg:w-auto ${isEditing ? 'bg-[#6D28D9] hover:bg-[#5B21B6] focus-visible:outline-indigo-600' : 'bg-gray-400 cursor-not-allowed'}`}
                                onClick={handleSaveClick}
                                disabled={!isEditing}
                            >
                                <span>Guardar cambios</span>
                            </button>
                        </div>
                    </div>

                    <div className="border-b border-[#F2F2F2]/20 p-2"></div>
                    <div className="pt-4 md:flex md:items-center md:justify-normal">
                        <div className="grid grid-cols-1 gap-x-6 gap-y-8 sm:grid-cols-6">
                            <div className="col-span-full">
                                <label htmlFor="wabId" className="block text-sm font-medium leading-6 text-[#F2F2F2]">
                                    Identificador de la cuenta de WhatsApp Business
                                </label>
                                <div className="mt-2 relative group">
                                    <input
                                        type="text"
                                        className={`w-full lg:w-[750px] bg-[#FFFFFF] text-[#333333] px-4 py-2 rounded-md my-2 placeholder-[#9CA3AF] ${errors.wabId ? 'border border-red-500' : ''}`}
                                        placeholder="Ingrese el wab ID"
                                        value={wabId}
                                        onChange={handleInputChange(setWabId)}
                                        disabled={!isEditing}
                                    />
                                    {errors.wabId && <p className="text-red-500 text-sm">Este campo es obligatorio, siga el formato.</p>}
                                    {!isEditing && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm rounded-md opacity-0 group-hover:opacity-100">
                                        Primero debe habilitar 'Editar'
                                    </div>}
                                </div>
                            </div>
                            <div className="col-span-full">
                                <label htmlFor="phoneId" className="block text-sm font-medium leading-6 text-[#F2F2F2]">
                                    Identificador del número de teléfono
                                </label>
                                <div className="mt-2 relative group">
                                    <input
                                        type="text"
                                        className={`w-full lg:w-[750px] bg-[#FFFFFF] text-[#333333] px-4 py-2 rounded-md my-2 placeholder-[#9CA3AF] ${errors.phoneId ? 'border border-red-500' : ''}`}
                                        placeholder="Ingrese el phone ID"
                                        value={phoneId}
                                        onChange={handleInputChange(setPhoneId)}
                                        disabled={!isEditing}
                                    />
                                    {errors.phoneId && <p className="text-red-500 text-sm">Este campo es obligatorio, siga el formato.</p>}
                                    {!isEditing && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm rounded-md opacity-0 group-hover:opacity-100">
                                        Primero debe habilitar 'Editar'
                                    </div>}
                                </div>
                            </div>
                            <div className="col-span-full">
                                <label htmlFor="tokenAccess" className="block text-sm font-medium leading-6 text-[#F2F2F2]">
                                    Token de acceso
                                </label>
                                <div className="mt-2 relative group">
                                    <input
                                        type="text"
                                        className={`w-full lg:w-[750px] bg-[#FFFFFF] text-[#333333] px-4 py-2 rounded-md my-2 placeholder-[#9CA3AF] ${errors.tokenAccess ? 'border border-red-500' : ''}`}
                                        placeholder="Ingrese el token de acceso"
                                        value={tokenAccess}
                                        onChange={handleInputChange(setTokenAccess)}
                                        disabled={!isEditing}
                                    />
                                    {errors.tokenAccess && <p className="text-red-500 text-sm">Este campo es obligatorio, siga el formato.</p>}
                                    {!isEditing && <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 text-white text-sm rounded-md opacity-0 group-hover:opacity-100">
                                        Primero debe habilitar 'Editar'
                                    </div>}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}

export default SettingsPage;
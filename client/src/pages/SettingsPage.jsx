import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCredential } from "../context/CredentialContext";
import { Link } from "react-router-dom";
import { Icon, PageHeader } from "../components/ui";

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

    const fields = [
        { id: 'wabId', label: 'WABA ID', help: 'WhatsApp Business Account ID (Meta → WhatsApp → API Setup).', value: wabId, set: setWabId, placeholder: 'Ej. 102345678901234' },
        { id: 'phoneId', label: 'Phone number ID', help: 'Es un ID largo, no el número de teléfono.', value: phoneId, set: setPhoneId, placeholder: 'Ej. 109876543210987' },
        { id: 'tokenAccess', label: 'Token de acceso', help: 'Usa un token permanente de usuario del sistema; el temporal caduca en 24 h.', value: tokenAccess, set: setTokenAccess, placeholder: 'EAAG…' },
    ];

    return (
        <>
            <PageHeader
                title="Configuración"
                subtitle={`Hola ${user.firstName}, aquí conectas tu cuenta de WhatsApp Business.`}
            />

            <section className="g-card max-w-3xl">
                <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                        <h2 className="g-section-title flex items-center gap-2"><Icon name="key" size={22} className="text-accent" /> Credenciales de WhatsApp</h2>
                        <p className="mt-1 text-sm text-muted">
                            {updatedAtCredential ? `Última actualización: ${updatedAtCredential.split('T')[0]}` : 'Aún no has guardado credenciales.'}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {!isEditing ? (
                            <button type="button" className="g-btn-tonal" onClick={handleEditClick}>
                                <Icon name="edit" size={20} /> Editar
                            </button>
                        ) : (
                            <button type="button" className="g-btn-primary" onClick={handleSaveClick}>
                                <Icon name="save" size={20} /> Guardar cambios
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex flex-col gap-5">
                    {fields.map((field) => (
                        <div key={field.id}>
                            <label htmlFor={field.id} className="g-label">{field.label}</label>
                            <input
                                id={field.id}
                                type="text"
                                className={`g-input font-mono text-sm ${errors[field.id] ? '!border-[var(--danger)]' : ''}`}
                                placeholder={field.placeholder}
                                value={field.value}
                                onChange={handleInputChange(field.set)}
                                disabled={!isEditing}
                                autoComplete="off"
                                spellCheck={false}
                            />
                            {errors[field.id]
                                ? <p className="g-field-error">Este campo es obligatorio.</p>
                                : <p className="mt-1 text-xs text-muted">{field.help}</p>}
                        </div>
                    ))}
                </div>

                {!isEditing && (
                    <p className="mt-6 text-sm text-muted">
                        Pulsa <strong className="text-fg-2">Editar</strong> para cambiar los datos. Después de guardar, revisa el diagnóstico en{' '}
                        <Link to="/profile" className="text-accent underline">Perfil</Link>.
                    </p>
                )}
            </section>
        </>
    );
}

export default SettingsPage;

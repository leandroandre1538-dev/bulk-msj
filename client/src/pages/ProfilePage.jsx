import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getWhatsAppStatusRequest } from '../api/credential';

const LEVEL_STYLES = {
    error: { box: 'bg-red-500/15 border-red-500/60', dot: 'bg-red-500', label: 'Error' },
    warning: { box: 'bg-yellow-500/15 border-yellow-500/60', dot: 'bg-yellow-400', label: 'Atención' },
    ok: { box: 'bg-green-500/15 border-green-500/60', dot: 'bg-green-500', label: 'OK' },
    info: { box: 'bg-[#6D28D9]/15 border-[#6D28D9]/60', dot: 'bg-[#8B5CF6]', label: 'Info' }
};

const LIMIT_TIERS = {
    TIER_50: '50 / día', TIER_250: '250 / día', TIER_1K: '1.000 / día', TIER_2K: '2.000 / día',
    TIER_10K: '10.000 / día', TIER_100K: '100.000 / día', TIER_UNLIMITED: 'Ilimitado'
};

const QUALITY = { GREEN: 'Alta (verde)', YELLOW: 'Media (amarilla)', RED: 'Baja (roja)', UNKNOWN: 'Sin datos aún' };

const formatDate = (value) =>
    value ? new Date(value).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

function Field({ label, value, mono = false }) {
    return (
        <div className="py-2">
            <dt className="text-xs uppercase tracking-wide text-[#7A7A7A]">{label}</dt>
            <dd className={`mt-1 text-[#F2F2DC] break-all ${mono ? 'font-mono text-sm' : ''}`}>{value ?? '—'}</dd>
        </div>
    );
}

function Card({ title, children, action }) {
    return (
        <section className="bg-[#141414] p-6 rounded-lg">
            <div className="flex items-center justify-between mb-3 gap-4">
                <h3 className="text-lg font-semibold text-[#F2F2DC]">{title}</h3>
                {action}
            </div>
            {children}
        </section>
    );
}

function ModeBadge({ mode }) {
    if (!mode) return null;
    const isTest = mode === 'SANDBOX';
    return (
        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${isTest ? 'bg-yellow-400 text-black' : 'bg-green-500 text-white'}`}>
            {isTest ? 'Número de prueba (sandbox)' : 'Producción'}
        </span>
    );
}

function ProfilePage() {
    const { user } = useAuth();
    const [status, setStatus] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const loadStatus = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const res = await getWhatsAppStatusRequest();
            setStatus(res.data);
        } catch (err) {
            setError(err?.response?.data?.message || 'No se pudo consultar el estado de la cuenta de WhatsApp.');
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        loadStatus();
    }, [loadStatus]);

    const phone = status?.phone;
    const waba = status?.waba;
    const token = status?.token;

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-2xl font-bold leading-7 text-[#F2F2DC] sm:text-3xl sm:tracking-tight">Perfil</h2>
                <p className="mt-2 text-sm text-[#7A7A7A]">
                    Datos de tu usuario y estado de la cuenta de WhatsApp según las credenciales guardadas en Configuración.
                </p>
            </div>

            <Card title="Usuario">
                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
                    <Field label="Nombre" value={`${user?.firstName ?? ''} ${user?.lastName ?? ''}`.trim()} />
                    <Field label="Usuario" value={user?.username} />
                    <Field label="Correo" value={user?.email} />
                    <Field label="Registrado" value={formatDate(user?.createdAt)} />
                </dl>
            </Card>

            <Card
                title="Cuenta de WhatsApp"
                action={
                    <button
                        type="button"
                        onClick={loadStatus}
                        disabled={loading}
                        className={`rounded-md bg-[#6D28D9] px-3 py-2 text-sm font-semibold text-white hover:bg-[#5B21B6] ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {loading ? 'Consultando…' : 'Volver a verificar'}
                    </button>
                }
            >
                {error && <div className="bg-red-500 text-white p-3 rounded-md">{error}</div>}

                {!loading && status && !status.configured && (
                    <p className="text-[#F2F2DC]">
                        Aún no configuraste tus credenciales.{' '}
                        <Link to="/settings" className="text-[#A78BFA] underline">Ir a Configuración</Link>
                    </p>
                )}

                {loading && !status && <p className="text-[#7A7A7A]">Consultando a Meta…</p>}

                {status?.configured && (
                    <div className="space-y-6">
                        {/* Diagnóstico */}
                        <div>
                            <h4 className="text-sm uppercase tracking-wide text-[#7A7A7A] mb-2">Diagnóstico</h4>
                            <ul className="space-y-2">
                                {status.diagnostics.map((item, index) => {
                                    const style = LEVEL_STYLES[item.level] || LEVEL_STYLES.info;
                                    return (
                                        <li key={index} className={`flex gap-3 items-start border rounded-md p-3 ${style.box}`}>
                                            <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${style.dot}`} aria-hidden="true" />
                                            <span className="text-[#F2F2DC] text-sm">
                                                <strong className="mr-1">{style.label}:</strong>{item.message}
                                            </span>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>

                        {/* Número */}
                        <div>
                            <div className="flex flex-wrap items-center gap-3 mb-1">
                                <h4 className="text-sm uppercase tracking-wide text-[#7A7A7A]">Número de envío</h4>
                                <ModeBadge mode={phone?.account_mode} />
                            </div>
                            {status.errors?.phone ? (
                                <p className="text-red-400 text-sm">{status.errors.phone}</p>
                            ) : (
                                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
                                    <Field label="Número" value={phone?.display_phone_number} />
                                    <Field label="Nombre visible" value={phone?.verified_name} />
                                    <Field label="Estado del nombre" value={phone?.name_status} />
                                    <Field label="Estado" value={phone?.status} />
                                    <Field label="Calidad" value={QUALITY[phone?.quality_rating] || phone?.quality_rating} />
                                    <Field label="Límite de envío" value={LIMIT_TIERS[phone?.messaging_limit_tier] || phone?.messaging_limit_tier} />
                                    <Field label="Plataforma" value={phone?.platform_type} />
                                    <Field label="Phone ID" value={status.credential.phoneId} mono />
                                </dl>
                            )}
                        </div>

                        {/* WABA */}
                        <div>
                            <h4 className="text-sm uppercase tracking-wide text-[#7A7A7A] mb-1">Cuenta de WhatsApp Business (WABA)</h4>
                            {status.errors?.waba ? (
                                <p className="text-red-400 text-sm">{status.errors.waba}</p>
                            ) : (
                                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
                                    <Field label="Nombre" value={waba?.name} />
                                    <Field label="Revisión de la cuenta" value={waba?.account_review_status} />
                                    <Field label="Verificación del negocio" value={waba?.business_verification_status} />
                                    <Field label="Moneda" value={waba?.currency} />
                                    <Field label="Método de pago" value={waba ? (waba.primary_funding_id ? 'Configurado' : 'No detectado') : null} />
                                    <Field label="Números en la cuenta" value={status.wabaPhoneNumbers?.length} />
                                    <Field label="WABA ID" value={status.credential.wabId} mono />
                                </dl>
                            )}
                        </div>

                        {/* Token */}
                        <div>
                            <h4 className="text-sm uppercase tracking-wide text-[#7A7A7A] mb-1">Token de acceso</h4>
                            <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-x-6">
                                <Field label="Token" value={status.credential.tokenPreview} mono />
                                <Field label="Tipo" value={token?.type} />
                                <Field label="Caduca" value={token ? (token.expiresAt ? formatDate(token.expiresAt) : 'Nunca (permanente)') : null} />
                                <Field label="App" value={token?.application} />
                            </dl>
                            {token?.scopes?.length > 0 && (
                                <div className="mt-2 flex flex-wrap gap-2">
                                    {token.scopes.map((scope) => (
                                        <span key={scope} className="rounded bg-[#262626] px-2 py-1 text-xs font-mono text-[#F2F2DC]">{scope}</span>
                                    ))}
                                </div>
                            )}
                        </div>

                        <p className="text-xs text-[#7A7A7A]">
                            Credenciales actualizadas: {formatDate(status.credential.updatedAt)}.
                            Meta no permite consultar por API la lista de números de prueba; si el número es de prueba,
                            revisa esa lista en developers.facebook.com → tu app → WhatsApp → API Setup.
                        </p>
                    </div>
                )}
            </Card>
        </div>
    );
}

export default ProfilePage;

import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { getExecutionRequest, getExecutionsRequest } from '../api/execution';
import { Alert, Icon, PageHeader, Spinner } from '../components/ui';

const formatDate = (value) =>
    value ? new Date(value).toLocaleString('es-PE', { dateStyle: 'medium', timeStyle: 'short' }) : '—';

// Un envío "en curso" sin actividad por más de 10 minutos se considera interrumpido (p. ej. se cerró la pestaña).
const statusOf = (execution) => {
    if (execution.status === 'completed') return { label: 'Completado', icon: 'check_circle', className: 'text-[var(--success)]' };
    const idle = Date.now() - new Date(execution.updatedAt).getTime();
    return idle > 10 * 60 * 1000
        ? { label: 'Interrumpido', icon: 'pause_circle', className: 'text-[var(--warning)]' }
        : { label: 'En curso', icon: 'progress_activity', className: 'text-accent' };
};

function Counts({ execution }) {
    const processed = execution.successCount + execution.failedCount;
    return (
        <div className="flex flex-wrap items-center gap-2 text-sm">
            <span className="g-chip"><Icon name="group" size={16} /> {execution.total}</span>
            <span className="g-chip bg-[var(--success-bg)] text-[var(--success)]"><Icon name="check" size={16} /> {execution.successCount}</span>
            <span className="g-chip bg-[var(--danger-bg)] text-[var(--danger)]"><Icon name="close" size={16} /> {execution.failedCount}</span>
            {processed < execution.total && <span className="text-xs text-muted">{execution.total - processed} sin procesar</span>}
        </div>
    );
}

function ExecutionList() {
    const [executions, setExecutions] = useState(null);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        getExecutionsRequest()
            .then((res) => setExecutions(res.data))
            .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el historial.'));
    }, []);

    return (
        <>
            <PageHeader
                title="Historial de envíos"
                subtitle="Cada vez que envías una plantilla queda registrada aquí con el resultado por número."
                actions={<Link to="/templates" className="g-btn-primary"><Icon name="send" size={20} /> Nuevo envío</Link>}
            />

            {error && <Alert type="error">{error}</Alert>}
            {!executions && !error && <div className="flex justify-center py-16"><Spinner /></div>}

            {executions?.length === 0 && (
                <div className="g-card flex flex-col items-center py-16 text-center">
                    <Icon name="history" size={48} className="text-muted" />
                    <p className="mt-4 text-lg text-fg">Aún no hay envíos</p>
                    <p className="mt-1 text-sm text-muted">Cuando envíes una plantilla aparecerá aquí.</p>
                </div>
            )}

            {executions?.length > 0 && (
                <ul className="flex flex-col gap-2">
                    {executions.map((execution) => {
                        const status = statusOf(execution);
                        return (
                            <li key={execution._id}>
                                <button
                                    type="button"
                                    onClick={() => navigate(`/executions/${execution._id}`)}
                                    className="flex w-full flex-col gap-3 rounded-3xl bg-surface p-5 text-left transition-colors hover:bg-surface-2 md:flex-row md:items-center md:justify-between"
                                >
                                    <div className="flex min-w-0 items-start gap-4">
                                        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-bg text-accent">
                                            <Icon name="send" />
                                        </span>
                                        <div className="min-w-0">
                                            <p className="truncate font-medium text-fg">
                                                {execution.templateName}
                                                {execution.templateLanguage && <span className="ml-2 text-sm text-muted">({execution.templateLanguage})</span>}
                                            </p>
                                            <p className="mt-0.5 text-sm text-fg-2">
                                                {execution.groupName ? `Grupo: ${execution.groupName}` : 'Grupo eliminado'} · {formatDate(execution.createdAt)}
                                            </p>
                                            <p className={`mt-1 flex items-center gap-1 text-sm ${status.className}`}>
                                                <Icon name={status.icon} size={16} /> {status.label}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between gap-3 md:justify-end">
                                        <Counts execution={execution} />
                                        <Icon name="chevron_right" className="text-muted" />
                                    </div>
                                </button>
                            </li>
                        );
                    })}
                </ul>
            )}
        </>
    );
}

const FILTERS = [
    { id: 'all', label: 'Todos' },
    { id: 'success', label: 'Enviados' },
    { id: 'warning', label: 'Con error' },
];

function ExecutionDetail({ id }) {
    const [execution, setExecution] = useState(null);
    const [error, setError] = useState('');
    const [filter, setFilter] = useState('all');
    const [search, setSearch] = useState('');

    useEffect(() => {
        getExecutionRequest(id)
            .then((res) => setExecution(res.data))
            .catch((err) => setError(err?.response?.data?.message || 'No se pudo cargar el envío.'));
    }, [id]);

    const rows = useMemo(() => {
        const list = execution?.results || [];
        return list.filter((r) =>
            (filter === 'all' || r.state === filter) && (!search || r.phone.includes(search.replace(/\D/g, '')))
        );
    }, [execution, filter, search]);

    if (error) return <Alert type="error">{error}</Alert>;
    if (!execution) return <div className="flex justify-center py-16"><Spinner /></div>;

    const status = statusOf(execution);

    return (
        <>
            <Link to="/executions" className="g-btn-text -ml-3 mb-2"><Icon name="arrow_back" size={20} /> Historial</Link>
            <PageHeader
                title={execution.templateName}
                subtitle={`${execution.groupName ? `Grupo: ${execution.groupName}` : 'Grupo eliminado'} · ${formatDate(execution.createdAt)}`}
            />

            <div className="mb-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
                <div className="g-card"><p className="text-sm text-muted">Estado</p><p className={`mt-1 flex items-center gap-1 text-lg ${status.className}`}><Icon name={status.icon} size={20} /> {status.label}</p></div>
                <div className="g-card"><p className="text-sm text-muted">Destinatarios</p><p className="mt-1 text-3xl text-fg">{execution.total}</p></div>
                <div className="g-card"><p className="text-sm text-muted">Enviados</p><p className="mt-1 text-3xl text-[var(--success)]">{execution.successCount}</p></div>
                <div className="g-card"><p className="text-sm text-muted">Con error</p><p className="mt-1 text-3xl text-[var(--danger)]">{execution.failedCount}</p></div>
            </div>

            <Alert type="info" className="mb-4">
                «Enviado» significa que Meta aceptó el mensaje. Si no llega, revisa el diagnóstico en <Link to="/profile" className="underline">Perfil</Link> (método de pago, número de prueba, etc.).
            </Alert>

            <section className="g-card">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex flex-wrap gap-2" role="tablist">
                        {FILTERS.map((f) => (
                            <button
                                key={f.id}
                                type="button"
                                role="tab"
                                aria-selected={filter === f.id}
                                onClick={() => setFilter(f.id)}
                                className={`h-9 rounded-full px-4 text-sm transition-colors ${filter === f.id ? 'bg-active font-medium text-on-active' : 'bg-surface-2 text-fg-2 hover:bg-surface-3'}`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                    <div className="relative sm:w-64">
                        <Icon name="search" size={20} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" />
                        <input value={search} onChange={(e) => setSearch(e.target.value)} className="g-input h-10 pl-10" placeholder="Buscar número" />
                    </div>
                </div>

                <div className="overflow-x-auto rounded-2xl border border-line bg-bg">
                    <table className="min-w-full text-left text-sm">
                        <thead className="bg-surface-2 text-fg-2">
                            <tr>
                                <th className="px-4 py-3 font-medium">Número</th>
                                <th className="px-4 py-3 font-medium">Estado</th>
                                <th className="px-4 py-3 font-medium">Detalle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {rows.map((r, index) => (
                                <tr key={index} className="hover:bg-surface">
                                    <td className="whitespace-nowrap px-4 py-3 font-mono text-fg">{r.phone}</td>
                                    <td className="whitespace-nowrap px-4 py-3">
                                        {r.state === 'success'
                                            ? <span className="inline-flex items-center gap-1 text-[var(--success)]"><Icon name="check_circle" size={18} /> Enviado</span>
                                            : <span className="inline-flex items-center gap-1 text-[var(--danger)]"><Icon name="error" size={18} /> Error</span>}
                                    </td>
                                    <td className="px-4 py-3 text-fg-2">{r.description || '—'}</td>
                                </tr>
                            ))}
                            {rows.length === 0 && (
                                <tr><td colSpan={3} className="px-4 py-10 text-center text-muted">Sin resultados para este filtro.</td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </section>
        </>
    );
}

function ExecutionsPage() {
    const { id } = useParams();
    return id ? <ExecutionDetail id={id} /> : <ExecutionList />;
}

export default ExecutionsPage;

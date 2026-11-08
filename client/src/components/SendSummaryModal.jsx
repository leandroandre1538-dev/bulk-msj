import { Link } from 'react-router-dom';
import { Icon } from './ui';

const SendSummaryModal = ({ isOpen, onClose, sendResults = [], executionId }) => {
    if (!isOpen) return null;

    const results = Array.isArray(sendResults) ? sendResults : [];
    const ok = results.filter((r) => r.state === 'success').length;
    const failed = results.length - ok;

    return (
        <div className="g-backdrop">
            <div className="g-dialog max-w-2xl">
                <Icon name={failed === 0 ? 'task_alt' : 'rule'} size={32} className={failed === 0 ? 'text-[var(--success)]' : 'text-[var(--warning)]'} />
                <h2 className="mt-3 text-2xl text-fg">Envío terminado</h2>
                <p className="mt-1 text-fg-2">
                    {ok} enviado(s) · {failed} con error · {results.length} en total
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                    <div className="rounded-2xl bg-[var(--success-bg)] p-4 text-[var(--success)]">
                        <p className="text-sm">Aceptados por Meta</p>
                        <p className="text-3xl">{ok}</p>
                    </div>
                    <div className="rounded-2xl bg-[var(--danger-bg)] p-4 text-[var(--danger)]">
                        <p className="text-sm">Con error</p>
                        <p className="text-3xl">{failed}</p>
                    </div>
                </div>

                <div className="mt-5 max-h-72 overflow-auto rounded-2xl border border-line bg-bg">
                    <table className="min-w-full text-left text-sm">
                        <thead className="sticky top-0 bg-surface-2 text-fg-2">
                            <tr>
                                <th className="px-4 py-2 font-medium">Número</th>
                                <th className="px-4 py-2 font-medium">Estado</th>
                                <th className="px-4 py-2 font-medium">Detalle</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-line">
                            {results.map((result, index) => (
                                <tr key={index}>
                                    <td className="whitespace-nowrap px-4 py-2 font-mono text-fg">{result.phone}</td>
                                    <td className="whitespace-nowrap px-4 py-2">
                                        {result.state === 'success'
                                            ? <span className="inline-flex items-center gap-1 text-[var(--success)]"><Icon name="check_circle" size={18} /> Enviado</span>
                                            : <span className="inline-flex items-center gap-1 text-[var(--danger)]"><Icon name="error" size={18} /> Error</span>}
                                    </td>
                                    <td className="px-4 py-2 text-fg-2">{result.description || '—'}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                <p className="mt-3 text-xs text-muted">
                    «Enviado» significa que Meta aceptó el mensaje; la entrega puede fallar después (por ejemplo, sin método de pago).
                </p>

                <div className="mt-6 flex flex-wrap justify-end gap-2">
                    {executionId && (
                        <Link to={`/executions/${executionId}`} className="g-btn-text" onClick={onClose}>
                            <Icon name="history" size={20} /> Ver en el historial
                        </Link>
                    )}
                    <button onClick={onClose} className="g-btn-primary">Listo</button>
                </div>
            </div>
        </div>
    );
};

export default SendSummaryModal;

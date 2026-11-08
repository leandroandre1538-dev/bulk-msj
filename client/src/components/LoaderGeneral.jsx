import { Spinner } from './ui';

const LoaderGeneral = () => {
    return (
        <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-[var(--backdrop)] backdrop-blur-sm">
            <div className="flex flex-col items-center gap-4 rounded-4xl bg-surface px-10 py-8 shadow-2xl">
                <Spinner className="h-12 w-12" />
                <span className="text-fg-2">Cargando…</span>
            </div>
        </div>
    );
};

export default LoaderGeneral;

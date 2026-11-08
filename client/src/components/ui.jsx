import { useEffect, useState } from 'react';

// Ícono de Material Symbols (mismo set que usa Gemini). Nombres en https://fonts.google.com/icons
export function Icon({ name, filled = false, className = '', size = 24 }) {
    return (
        <span
            aria-hidden="true"
            className={`material-symbols-rounded ${filled ? 'filled' : ''} ${className}`}
            style={{ fontSize: size }}
        >
            {name}
        </span>
    );
}

// Logo de Inteligenze guardado en /public/brand (no depende de enlaces externos).
// Muestra la versión con texto oscuro o claro según el tema.
export function BrandLogo({ className = 'h-7' }) {
    return (
        <span className="inline-flex items-center">
            <img src="/brand/logo-light.png" alt="Inteligenze" className={`brand-logo-light w-auto ${className}`} />
            <img src="/brand/logo-dark.png" alt="Inteligenze" className={`brand-logo-dark w-auto ${className}`} />
        </span>
    );
}

export function BrandMark({ className = 'h-8 w-8' }) {
    return <img src="/brand/favicon.png" alt="" className={`rounded-xl ${className}`} />;
}

// Tema: 'system' | 'light' | 'dark'. Se guarda solo en este navegador.
const readTheme = () => {
    try {
        return localStorage.getItem('theme') || 'system';
    } catch {
        return 'system';
    }
};

export function useTheme() {
    const [theme, setTheme] = useState(readTheme);

    useEffect(() => {
        const root = document.documentElement;
        if (theme === 'system') root.removeAttribute('data-theme');
        else root.setAttribute('data-theme', theme);
        try {
            localStorage.setItem('theme', theme);
        } catch {
            /* sin almacenamiento disponible: el tema solo dura esta sesión */
        }
    }, [theme]);

    return [theme, setTheme];
}

export function Spinner({ className = 'h-10 w-10' }) {
    return (
        <span
            role="status"
            aria-label="Cargando"
            className={`inline-block rounded-full border-[3px] border-surface-3 border-t-[var(--accent)] animate-spin ${className}`}
        />
    );
}

export function PageHeader({ title, subtitle, actions }) {
    return (
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
            <div className="min-w-0">
                <h1 className="g-title">{title}</h1>
                {subtitle && <p className="g-subtitle">{subtitle}</p>}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
    );
}

const ALERT_ICONS = { error: 'error', success: 'check_circle', warning: 'warning', info: 'info' };

export function Alert({ type = 'info', children, className = '' }) {
    return (
        <div className={`g-alert-${type} ${className}`} role={type === 'error' ? 'alert' : 'status'}>
            <Icon name={ALERT_ICONS[type]} size={20} className="mt-px shrink-0" />
            <div className="min-w-0">{children}</div>
        </div>
    );
}

import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { Icon, useTheme } from './ui';

const MAIN_ITEMS = [
    { to: '/', icon: 'home', label: 'Inicio' },
    { to: '/templates', icon: 'send', label: 'Plantillas y envíos' },
    { to: '/contacts', icon: 'contacts', label: 'Contactos' },
    { to: '/executions', icon: 'history', label: 'Historial de envíos' },
];

const ACCOUNT_ITEMS = [
    { to: '/profile', icon: 'account_circle', label: 'Perfil' },
    { to: '/settings', icon: 'settings', label: 'Configuración' },
];

const THEMES = {
    system: { icon: 'brightness_auto', label: 'Tema: sistema', next: 'light' },
    light: { icon: 'light_mode', label: 'Tema: claro', next: 'dark' },
    dark: { icon: 'dark_mode', label: 'Tema: oscuro', next: 'system' },
};

function NavItem({ to, icon, label, active, collapsed }) {
    return (
        <Link
            to={to}
            title={collapsed ? label : undefined}
            aria-current={active ? 'page' : undefined}
            className={`g-nav-item ${active ? 'g-nav-item-active' : ''} ${collapsed ? 'md:w-11 md:justify-center md:px-0' : ''}`}
        >
            <Icon name={icon} filled={active} size={22} className="shrink-0" />
            <span className={`truncate ${collapsed ? 'md:hidden' : ''}`}>{label}</span>
        </Link>
    );
}

function Sidebar() {
    const { isAuthenticated, logout } = useAuth();
    const { collapsed, setCollapsed, mobileOpen, setMobileOpen } = useLayout();
    const [theme, setTheme] = useTheme();
    const location = useLocation();

    // Cierra el cajón móvil al navegar
    useEffect(() => {
        setMobileOpen(false);
    }, [location.pathname, setMobileOpen]);

    if (!isAuthenticated) return null;

    const isActive = (path) => (path === '/' ? location.pathname === '/' : location.pathname.startsWith(path));
    const themeInfo = THEMES[theme] || THEMES.system;

    return (
        <>
            {/* Fondo oscuro del cajón en móvil */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 bg-[var(--backdrop)] md:hidden" onClick={() => setMobileOpen(false)} />
            )}

            <aside
                className={`fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-surface px-3 pb-3 pt-3 transition-[transform,width] duration-200
                    md:static md:z-auto md:translate-x-0
                    ${mobileOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'}
                    ${collapsed ? 'md:w-[72px]' : 'md:w-72'}`}
            >
                <div className="flex h-12 items-center">
                    <button
                        type="button"
                        className="g-icon-btn hidden md:inline-flex"
                        onClick={() => setCollapsed(!collapsed)}
                        aria-label={collapsed ? 'Expandir menú' : 'Contraer menú'}
                    >
                        <Icon name="menu" />
                    </button>
                    <button
                        type="button"
                        className="g-icon-btn md:hidden"
                        onClick={() => setMobileOpen(false)}
                        aria-label="Cerrar menú"
                    >
                        <Icon name="close" />
                    </button>
                </div>

                <Link
                    to="/templates"
                    title={collapsed ? 'Nuevo envío' : undefined}
                    className={`mt-4 mb-6 inline-flex h-12 items-center gap-3 rounded-full bg-surface-3 px-4 text-sm font-medium text-fg-2 transition-colors hover:bg-active hover:text-on-active
                        ${collapsed ? 'md:w-12 md:justify-center md:px-0' : 'self-start pr-6'}`}
                >
                    <Icon name="edit_square" size={22} />
                    <span className={collapsed ? 'md:hidden' : ''}>Nuevo envío</span>
                </Link>

                <nav className="flex flex-1 flex-col gap-1 overflow-y-auto" aria-label="Principal">
                    {MAIN_ITEMS.map((item) => (
                        <NavItem key={item.to} {...item} active={isActive(item.to)} collapsed={collapsed} />
                    ))}

                    <p className={`mt-6 mb-1 px-3 text-xs font-medium text-muted ${collapsed ? 'md:hidden' : ''}`}>Cuenta</p>
                    {collapsed && <div className="mt-4 hidden md:block" />}
                    {ACCOUNT_ITEMS.map((item) => (
                        <NavItem key={item.to} {...item} active={isActive(item.to)} collapsed={collapsed} />
                    ))}
                </nav>

                <div className="mt-2 flex flex-col gap-1 border-t border-line pt-2">
                    <button
                        type="button"
                        onClick={() => setTheme(themeInfo.next)}
                        title={collapsed ? themeInfo.label : undefined}
                        className={`g-nav-item ${collapsed ? 'md:w-11 md:justify-center md:px-0' : ''}`}
                    >
                        <Icon name={themeInfo.icon} size={22} className="shrink-0" />
                        <span className={collapsed ? 'md:hidden' : ''}>{themeInfo.label}</span>
                    </button>
                    <button
                        type="button"
                        onClick={logout}
                        title={collapsed ? 'Cerrar sesión' : undefined}
                        className={`g-nav-item ${collapsed ? 'md:w-11 md:justify-center md:px-0' : ''}`}
                    >
                        <Icon name="logout" size={22} className="shrink-0" />
                        <span className={collapsed ? 'md:hidden' : ''}>Cerrar sesión</span>
                    </button>
                </div>
            </aside>
        </>
    );
}

export default Sidebar;

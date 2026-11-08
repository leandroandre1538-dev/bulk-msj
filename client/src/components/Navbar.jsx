import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useLayout } from '../context/LayoutContext';
import { BrandLogo, Icon, useTheme } from './ui';

const initials = (user) =>
    `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase() || user?.username?.[0]?.toUpperCase() || '?';

function Navbar() {
    const { isAuthenticated, user } = useAuth();
    const { setMobileOpen } = useLayout();
    const [theme, setTheme] = useTheme();

    return (
        <header className="flex h-16 shrink-0 items-center justify-between gap-3 px-3 sm:px-5">
            <div className="flex min-w-0 items-center gap-1">
                {isAuthenticated && (
                    <button type="button" className="g-icon-btn md:hidden" onClick={() => setMobileOpen(true)} aria-label="Abrir menú">
                        <Icon name="menu" />
                    </button>
                )}
                <Link to="/" className="flex items-center gap-3 rounded-full px-2 py-1 hover:bg-surface">
                    <BrandLogo className="h-6 sm:h-7" />
                    <span className="hidden text-lg text-fg-2 sm:inline">Envíos</span>
                </Link>
            </div>

            <div className="flex items-center gap-2">
                {isAuthenticated ? (
                    <Link to="/profile" className="flex items-center gap-3 rounded-full py-1 pl-3 pr-1 hover:bg-surface" title="Perfil">
                        <span className="hidden text-sm text-fg-2 sm:inline">{user?.firstName} {user?.lastName}</span>
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-medium text-on-primary">
                            {initials(user)}
                        </span>
                    </Link>
                ) : (
                    <>
                        <button
                            type="button"
                            className="g-icon-btn"
                            onClick={() => setTheme(theme === 'dark' ? 'light' : theme === 'light' ? 'system' : 'dark')}
                            aria-label="Cambiar tema"
                            title="Cambiar tema"
                        >
                            <Icon name={theme === 'dark' ? 'dark_mode' : theme === 'light' ? 'light_mode' : 'brightness_auto'} />
                        </button>
                        <Link to="/login" className="g-btn-text">Iniciar sesión</Link>
                        <Link to="/register" className="g-btn-primary">Crear cuenta</Link>
                    </>
                )}
            </div>
        </header>
    );
}

export default Navbar;

import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Icon } from '../components/ui';

const ACTIONS = [
    { to: '/contacts', icon: 'upload_file', title: 'Importar contactos', text: 'Sube un Excel con nombres, números y variables a un grupo.' },
    { to: '/templates', icon: 'send', title: 'Enviar una plantilla', text: 'Elige plantilla y grupo, asigna variables y envía.' },
    { to: '/executions', icon: 'history', title: 'Ver historial de envíos', text: 'Revisa cada envío realizado y el resultado por número.' },
    { to: '/profile', icon: 'verified_user', title: 'Estado de la cuenta', text: 'Comprueba si tu número es de prueba o producción.' },
];

function Dashboard({ user }) {
    return (
        <div className="flex min-h-[calc(100vh-8rem)] flex-col justify-center py-8">
            <h1 className="text-4xl font-medium leading-tight sm:text-5xl">
                <span className="g-greeting">Hola, {user?.firstName}</span>
            </h1>
            <p className="mt-2 text-2xl text-muted sm:text-4xl">¿Qué quieres hacer hoy?</p>

            <div className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {ACTIONS.map((action) => (
                    <Link
                        key={action.to}
                        to={action.to}
                        className="group flex min-h-[180px] flex-col justify-between rounded-3xl bg-surface p-5 transition-colors hover:bg-surface-2"
                    >
                        <div>
                            <p className="font-medium text-fg">{action.title}</p>
                            <p className="mt-2 text-sm text-fg-2">{action.text}</p>
                        </div>
                        <span className="mt-4 flex h-11 w-11 items-center justify-center self-end rounded-full bg-bg text-accent transition-transform group-hover:scale-105">
                            <Icon name={action.icon} />
                        </span>
                    </Link>
                ))}
            </div>
        </div>
    );
}

function Landing() {
    return (
        <div className="flex min-h-[calc(100vh-8rem)] flex-col items-center justify-center py-12 text-center">
            <span className="g-chip mb-6">
                <Icon name="bolt" size={16} /> WhatsApp Business Cloud API
            </span>
            <h1 className="max-w-3xl text-4xl font-medium leading-tight sm:text-6xl">
                <span className="g-greeting">Envíos masivos por WhatsApp,</span>
                <br />
                <span className="text-fg">simples y medibles.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-fg-2">
                Importa tus contactos desde Excel, elige una plantilla aprobada y envía con variables personalizadas.
                Revisa el resultado de cada número.
            </p>
            <div className="mt-10 flex flex-wrap justify-center gap-3">
                <Link to="/register" className="g-btn-primary h-12 px-7 text-base">Crear cuenta</Link>
                <Link to="/login" className="g-btn-tonal h-12 px-7 text-base">Iniciar sesión</Link>
            </div>
        </div>
    );
}

function HomePage() {
    const { isAuthenticated, user, loading } = useAuth();
    if (loading) return null;
    return isAuthenticated ? <Dashboard user={user} /> : <Landing />;
}

export default HomePage;

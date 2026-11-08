import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import AuthCard from "../components/AuthCard.jsx";

function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signup, isAuthenticated, errors: registerErrors } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated]);

    const onSubmit = handleSubmit(async values => {
        signup(values);
    });

    return (
        <AuthCard
            title="Crear cuenta"
            subtitle="Regístrate para empezar a enviar mensajes."
            errors={registerErrors}
            footer={
                <>
                    ¿Ya tienes cuenta?{' '}
                    <Link to="/login" className="font-medium text-accent hover:underline">Iniciar sesión</Link>
                </>
            }
        >
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                        <label className="g-label" htmlFor="firstName">Nombres</label>
                        <input id="firstName" type="text" {...register('firstName', { required: true })} className="g-input" />
                        {errors.firstName && <p className="g-field-error">Nombres requeridos</p>}
                    </div>
                    <div>
                        <label className="g-label" htmlFor="lastName">Apellidos</label>
                        <input id="lastName" type="text" {...register('lastName', { required: true })} className="g-input" />
                        {errors.lastName && <p className="g-field-error">Apellidos requeridos</p>}
                    </div>
                </div>
                <div>
                    <label className="g-label" htmlFor="username">Usuario</label>
                    <input id="username" type="text" autoComplete="username" {...register('username', { required: true })} className="g-input" />
                    {errors.username && <p className="g-field-error">Usuario requerido</p>}
                </div>
                <div>
                    <label className="g-label" htmlFor="email">Correo</label>
                    <input id="email" type="email" autoComplete="email" {...register('email', { required: true })} className="g-input" placeholder="tu@correo.com" />
                    {errors.email && <p className="g-field-error">Correo requerido</p>}
                </div>
                <div>
                    <label className="g-label" htmlFor="password">Contraseña</label>
                    <input id="password" type="password" autoComplete="new-password" {...register('password', { required: true })} className="g-input" placeholder="Mínimo 6 caracteres" />
                    {errors.password && <p className="g-field-error">Contraseña requerida</p>}
                </div>
                <button type="submit" className="g-btn-primary mt-2 h-12 text-base">Crear cuenta</button>
            </form>
        </AuthCard>
    )
}

export default RegisterPage

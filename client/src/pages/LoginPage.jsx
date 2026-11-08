import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import AuthCard from "../components/AuthCard.jsx";

function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signin, errors: signinErrors, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const onSubmit = handleSubmit(data => {
        signin(data);
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/');
        }
    }, [isAuthenticated]);

    return (
        <AuthCard
            title="Iniciar sesión"
            subtitle="Usa tu cuenta para continuar con tus envíos."
            errors={signinErrors}
            footer={
                <>
                    ¿No tienes una cuenta?{' '}
                    <Link to="/register" className="font-medium text-accent hover:underline">Crear cuenta</Link>
                </>
            }
        >
            <form onSubmit={onSubmit} className="flex flex-col gap-4">
                <div>
                    <label className="g-label" htmlFor="email">Correo</label>
                    <input id="email" type="email" autoComplete="email" {...register('email', { required: true })} className="g-input" placeholder="tu@correo.com" />
                    {errors.email && <p className="g-field-error">Correo requerido</p>}
                </div>
                <div>
                    <label className="g-label" htmlFor="password">Contraseña</label>
                    <input id="password" type="password" autoComplete="current-password" {...register('password', { required: true })} className="g-input" placeholder="••••••••" />
                    {errors.password && <p className="g-field-error">Contraseña requerida</p>}
                </div>
                <button type="submit" className="g-btn-primary mt-2 h-12 text-base">Ingresar</button>
            </form>
        </AuthCard>
    )
}

export default LoginPage

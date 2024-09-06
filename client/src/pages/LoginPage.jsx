import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { Link, useNavigate } from "react-router-dom";
import { useEffect } from "react";

function LoginPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signin, errors: signinErrors, isAuthenticated } = useAuth();
    const navigate = useNavigate();

    const onSubmit = handleSubmit(data => {
        signin(data);
    });

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/tasks');
        }
    }, [isAuthenticated]);

    return (
        <div className="flex h-full items-center justify-center">
            <div className="bg-[#141414] max-w-md w-full p-10 rounded-lg">
                {
                    signinErrors.map((error, index) => (
                        <div key={index} className="bg-red-500 text-white p-2 my-2 rounded-md text-center">
                            {error}
                        </div>
                    ))
                }
                <div className="flex items-center justify-center mb-4">
                    <img
                        src="https://i.ibb.co/chM0dMy/ventabot-isologotipo-2.png"
                        alt="Imagen"
                        className="max-w-full max-h-96 h-auto object-contain"
                    />
                </div>
                <h1 className="text-xl text-center">
                    Bienvenid@ al
                </h1>
                <h1 className="text-2xl text-center mb-4">
                    Módulo administrativo
                </h1>
                <form onSubmit={onSubmit} className="flex flex-col gap-2">
                    <input
                        type="email"
                        {...register('email', { required: true })}
                        className="w-full bg-[#FFFFFF]  text-[#333333] px-4 py-2 rounded-md my-2 placeholder-[#9CA3AF]"
                        placeholder="Correo"
                    />
                    {
                        errors.email && (<p className="text-[#F0F2BB]">Correo requerido</p>)
                    }
                    <input
                        type="password"
                        {...register('password', { required: true })}
                        className="w-full bg-[#FFFFFF]  text-[#333333] px-4 py-2 rounded-md my-2 placeholder-[#9CA3AF]"
                        placeholder="Contraseña"
                    />
                    {
                        errors.password && (<p className="text-[#F0F2BB]">Contraseña requerida</p>)
                    }
                    <button
                        type="submit"
                        className="bg-[#6D28D9] hover:bg-[#5B21B6] text-slate-100 px-4 py-2 rounded-md my-2 shadow-md focus:outline-none focus:ring-2 focus:ring-zinc-900 focus:ring-opacity-50 transition-all duration-300 ease-in-out"
                    >
                        Ingresar
                    </button>
                </form>
                <p className="flex gap-x-2 justify-between items-center my-2">
                    <span>¿No tienes una cuenta?</span>
                    <Link
                        to="/register"
                        className="text-[#322073] hover:text-[#622ADB] transition-colors duration-300 ease-in-out"
                    >
                        Regístrate
                    </Link>
                </p>
            </div>
        </div>
    )
}

export default LoginPage
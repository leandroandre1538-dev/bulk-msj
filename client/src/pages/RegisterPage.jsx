import { useForm } from "react-hook-form";
import { useAuth } from "../context/AuthContext.jsx";
import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";

function RegisterPage() {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const { signup, isAuthenticated, errors: registerErrors } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
            navigate('/tasks');
        }
    }, [isAuthenticated]);

    const onSubmit = handleSubmit(async values => {
        signup(values);
    });

    return (
        <div className="flex h-full items-center justify-center">
            <div className="bg-[#141414] max-w-md w-full p-10 rounded-lg">
                {
                    registerErrors.map((error, index) => (
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
                <form onSubmit={onSubmit} className="flex flex-col gap-2">
                    <input
                        type="text"
                        {...register('firstName', { required: true })}
                        className="w-full bg-[#FFFFFF]  text-[#333333] px-4 py-2 rounded-md my-2 placeholder-[#9CA3AF]"
                        placeholder="Nombres"
                    />
                    {
                        errors.firstName && (<p className="text-[#F0F2BB]">Nombres requeridos</p>)
                    }
                    <input
                        type="text"
                        {...register('lastName', { required: true })}
                        className="w-full bg-[#FFFFFF]  text-[#333333] px-4 py-2 rounded-md my-2 placeholder-[#9CA3AF]"
                        placeholder="Apellidos"
                    />
                    {
                        errors.lastName && (<p className="text-[#F0F2BB]">Apellidos requeridos</p>)
                    }
                    <input
                        type="text"
                        {...register('username', { required: true })}
                        className="w-full bg-[#FFFFFF]  text-[#333333] px-4 py-2 rounded-md my-2 placeholder-[#9CA3AF]"
                        placeholder="Usuario"
                    />
                    {
                        errors.username && (<p className="text-[#F0F2BB]">Usuario requerido</p>)
                    }
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
                        Registrarte
                    </button>
                    <p className="flex gap-x-2 justify-between items-center my-2">
                        <span>¿Ya tienes cuenta?</span>
                        <Link
                            to="/login"
                            className="text-[#322073] hover:text-[#622ADB] transition-colors duration-300 ease-in-out"
                        >
                            Ingresar
                        </Link>
                    </p>
                </form>
            </div>
        </div>
    )
}

export default RegisterPage
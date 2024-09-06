import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Navbar() {
    const { isAuthenticated, logout, user } = useAuth();

    return (
        <nav className="bg-[#0A0A0A] flex justify-between items-center p-4">
            <div className="flex items-center gap-x-4">
                <Link to={isAuthenticated ? '/tasks' : '/'}>
                    <img
                        src="https://ventabot.com/wp-content/uploads/2024/02/logo-rounded.png"
                        alt="Logo"
                        className="block lg:hidden md:hidden max-w-[50px] h-auto object-contain mr-4"
                    />
                    <img
                        src="https://i.ibb.co/chM0dMy/ventabot-isologotipo-2.png"
                        alt="Logo"
                        className="hidden lg:block md:block max-w-[250px] h-auto object-contain mr-4"
                    />
                </Link>
            </div>
            <div className="flex items-center gap-x-4">
                {isAuthenticated ? (
                    <>
                        <span className="text-white">Bienvenido {user.firstName} {user.lastName}</span>
                        <button className="relative">
                            <span className="material-icons text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="size-6">
                                    <path d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0" />
                                </svg>
                            </span>
                            <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center">3</span>
                        </button>
                        <button>
                            <span className="material-icons text-white">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="size-6">
                                    <path d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                                </svg>
                            </span>
                        </button>
                    </>
                ) : (
                    <>
                        <nav className='flex justify-center space-x-4'>
                            <Link
                                to='/login'
                                className='bg-[#141414] px-6 py-2 text-white rounded-md hover:bg-gray-600 transition-colors duration-300 text-sm md:text-base flex items-center justify-center'
                            >
                                Iniciar sesión
                            </Link>
                            <Link
                                to='/register'
                                className='bg-[#141414] px-6 py-2 text-white rounded-md hover:bg-gray-600 transition-colors duration-300 text-sm md:text-base flex items-center justify-center'
                            >
                                Registrarse
                            </Link>
                        </nav>
                    </>
                )}
            </div>
        </nav >
    );
}

export default Navbar;

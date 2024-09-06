import { createContext, useState, useContext, useEffect } from 'react'
import { registerRequest, loginRequest, verifyTokenRequest } from '../api/auth.js'
import Cookies from 'js-cookie'

export const AuthContext = createContext();

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [errors, setErrors] = useState([]);
    const [loading, setLoading] = useState(true);

    const signup = async (user) => {
        try {
            const res = await registerRequest(user);
            console.log(res.data);
            setUser(res.data);
            setIsAuthenticated(true);
        } catch (error) {
            console.log(error.response);
            setErrors(error.response.data);
        }

    };

    const signin = async (user) => {
        try {
            const res = await loginRequest(user);
            console.log(res);
            setIsAuthenticated(true);
            setUser(res.data);
        } catch (error) {
            if (Array.isArray(error.response.data)) {
                return setErrors(error.response.data);
            }
            setErrors([error.response.data.message]);
        }
    };

    useEffect(() => {
        if (errors.length > 0) {
            // Se pone un timeout para que el mensaje de error se desaparezca
            // después de 5 segundos.
            // setTimeout es un timer propio que trae javascript para los 
            // navegadores, pero tiene un peligro de consumir muchos 
            // recursos en React si no se elimina.
            const timer = setTimeout(() => {
                setErrors([]);
            }, 5000);
            // Para eso se guardo el timer en una constante y si el componente 
            // llega a cambiar o ya no se usa, este se destruye.
            return () => clearTimeout(timer);
        }
        // Se maneja el cambio de longitud de errors 
        // para regresar a vacío (hacer desaparecer el mensaje).
    }, [errors]);

    const logout = () => {
        Cookies.remove('token');
        setIsAuthenticated(false);
        setUser(null);
        localStorage.removeItem('templates');
        localStorage.removeItem('selectedGroup');
        sessionStorage.removeItem('templates');
    }

    // Use effect para cuando cargue la aplicación (guardar token)
    // Se encarga de verificar la existencia de un token
    useEffect(() => {
        async function checkLogin() {
            const cookies = Cookies.get();
            // A través de las cookies del navegador y las validaciones de nuestro BackEnd
            // se puede verificar si el usuario ya está autenticado (existe un token).
            // En caso no haya un token
            // se establece que el usuario no está autenticado, la carga en falso y el usuario en nulo.
            if (!cookies.token) {
                setIsAuthenticated(false);
                setLoading(false);
                return setUser(null);
            }
            try {
                // Se verifica si el token es válido (con el BackEnd).
                const res = await verifyTokenRequest(cookies.token);
                // Si el BackEnd no te responde ningún dato, el autenticado y la carga se establecen en falso.
                if (!res.data) {
                    setIsAuthenticated(false);
                    setLoading(false);
                    return;
                }
                // Por el contrario si el token es válido, se establece que el usuario está autenticado
                // y se establece el usuario en el objeto de usuario y 
                // se libera la pagina de carga para ahora sí ser redirigido.
                setIsAuthenticated(true);
                setUser(res.data);
                setLoading(false);
            } catch (error) {
                // Manejo de errores
                console.log(error);
                setIsAuthenticated(false);
                setUser(null);
                setLoading(false);
            }
        }
        checkLogin();
    }, []);


    return (
        <AuthContext.Provider
            value={{
                user,
                signup,
                signin,
                logout,
                loading,
                isAuthenticated,
                errors,
            }}
        >
            {children}
        </AuthContext.Provider>
    )
};
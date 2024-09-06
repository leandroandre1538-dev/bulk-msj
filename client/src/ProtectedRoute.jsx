import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx"

function ProtectedRoute() {
    const { loading, isAuthenticated } = useAuth();
    console.log(loading, isAuthenticated);

    if (loading) {
        return <div>Loading...</div>;
    }
    // Si no esta cargando ni esta autenticado muéstrame nulo.
    if (!loading && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;
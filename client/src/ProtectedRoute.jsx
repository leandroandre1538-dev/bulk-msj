import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx"
import { Spinner } from "./components/ui.jsx";

function ProtectedRoute() {
    const { loading, isAuthenticated } = useAuth();

    if (loading) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <Spinner />
            </div>
        );
    }
    // Si no esta cargando ni esta autenticado, redirige al login.
    if (!loading && !isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}

export default ProtectedRoute;

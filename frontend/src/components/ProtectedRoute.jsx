// Protege las vistas internas: sin sesión, manda al login.
import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../context/AuthContext";

export function ProtectedRoute() {
    const { user, checking } = useAuth();

    if (checking) {
        return <div className="page-loading">Cargando…</div>;
    }

    return user ? <Outlet /> : <Navigate to="/login" replace />;
}

// Login y registro: si ya hay sesión, manda directo al mapa
export function PublicOnlyRoute() {
    const { user, checking } = useAuth();

    if (checking) {
        return <div className="page-loading">Cargando…</div>;
    }

    return user ? <Navigate to="/mapa" replace /> : <Outlet />;
}

// Estructura de las vistas internas: barra superior + contenido.
import { NavLink, Outlet } from "react-router-dom";

import Logo from "./Logo";
import { useAuth } from "../context/AuthContext";

const LINKS = [
    { to: "/mapa", label: "Mapa" },
    { to: "/repartidores", label: "Repartidores" },
    { to: "/categorias", label: "Categorías" }
];

export default function Layout() {
    const { user, logout } = useAuth();

    return (
        <div className="app">
            <header className="topbar">
                <div className="topbar__brand">
                    <Logo />
                    <span>Cuadrante</span>
                </div>

                <nav className="topbar__nav">
                    {LINKS.map((link) => (
                        <NavLink key={link.to} to={link.to} className="topbar__link">
                            {link.label}
                        </NavLink>
                    ))}
                </nav>

                <div className="topbar__user">
                    <span className="topbar__name" title={user.email}>{user.name}</span>
                    <button type="button" className="btn btn--ghost btn--sm" onClick={() => logout()}>
                        Cerrar sesión
                    </button>
                </div>
            </header>

            <main className="content">
                <Outlet />
            </main>
        </div>
    );
}

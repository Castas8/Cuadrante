// Rutas de la aplicación.
//   Públicas: /login y /registro
//   Protegidas (requieren sesión): /mapa, /repartidores, /categorias
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout";
import { ProtectedRoute, PublicOnlyRoute } from "./components/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import MapPage from "./pages/MapPage";
import CouriersPage from "./pages/CouriersPage";
import CategoriesPage from "./pages/CategoriesPage";

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<PublicOnlyRoute />}>
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/registro" element={<RegisterPage />} />
                </Route>

                <Route element={<ProtectedRoute />}>
                    <Route element={<Layout />}>
                        <Route path="/mapa" element={<MapPage />} />
                        <Route path="/repartidores" element={<CouriersPage />} />
                        <Route path="/categorias" element={<CategoriesPage />} />
                    </Route>
                </Route>

                <Route path="*" element={<Navigate to="/mapa" replace />} />
            </Routes>
        </BrowserRouter>
    );
}

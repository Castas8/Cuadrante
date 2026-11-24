import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "./AuthLayout";
import ErrorBox from "../components/ErrorBox";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
    const { login, sessionMessage } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: "", password: "" });
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError(null);

        try {
            await login(form);
            navigate("/mapa");
        } catch (err) {
            setError(err);
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthLayout title="Iniciar sesión" subtitle="Entra para administrar tus zonas y entregas.">
            {sessionMessage && <div className="info-box">{sessionMessage}</div>}

            <form className="form" onSubmit={handleSubmit}>
                <label className="field">
                    <span>Correo</span>
                    <input type="email" value={form.email} onChange={update("email")} autoComplete="email" required />
                </label>

                <label className="field">
                    <span>Contraseña</span>
                    <input type="password" value={form.password} onChange={update("password")} autoComplete="current-password" required />
                </label>

                <ErrorBox error={error} />

                <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
                    {busy ? "Entrando…" : "Entrar"}
                </button>
            </form>

            <p className="auth__switch">
                ¿No tienes cuenta? <Link to="/registro">Regístrate</Link>
            </p>

            <div className="demo-hint">
                <strong>Usuario de prueba</strong>
                <span>demo@cuadrante.mx · Cuadrante2026</span>
            </div>
        </AuthLayout>
    );
}

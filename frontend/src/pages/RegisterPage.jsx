import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import AuthLayout from "./AuthLayout";
import ErrorBox from "../components/ErrorBox";
import { useAuth } from "../context/AuthContext";

export default function RegisterPage() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ name: "", email: "", password: "", confirm: "" });
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setError(null);

        // Esta revisión solo existe en el frontend: el backend no recibe "confirm"
        if (form.password !== form.confirm) {
            setError({ message: "Las contraseñas no coinciden." });
            return;
        }

        setBusy(true);

        try {
            await register({ name: form.name, email: form.email, password: form.password });
            navigate("/mapa");
        } catch (err) {
            setError(err);
        } finally {
            setBusy(false);
        }
    };

    return (
        <AuthLayout title="Crear cuenta" subtitle="Registra tu empresa para empezar a organizar tus repartos.">
            <form className="form" onSubmit={handleSubmit}>
                <label className="field">
                    <span>Nombre de la empresa o encargado</span>
                    <input value={form.name} onChange={update("name")} autoComplete="name" required />
                </label>

                <label className="field">
                    <span>Correo</span>
                    <input type="email" value={form.email} onChange={update("email")} autoComplete="email" required />
                </label>

                <label className="field">
                    <span>Contraseña</span>
                    <input type="password" value={form.password} onChange={update("password")} autoComplete="new-password" minLength={8} required />
                    <small className="muted">Mínimo 8 caracteres.</small>
                </label>

                <label className="field">
                    <span>Confirmar contraseña</span>
                    <input type="password" value={form.confirm} onChange={update("confirm")} autoComplete="new-password" required />
                </label>

                <ErrorBox error={error} />

                <button type="submit" className="btn btn--primary btn--block" disabled={busy}>
                    {busy ? "Creando cuenta…" : "Crear cuenta"}
                </button>
            </form>

            <p className="auth__switch">
                ¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link>
            </p>
        </AuthLayout>
    );
}

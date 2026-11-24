import { useState } from "react";

import ErrorBox from "../ErrorBox";

export default function CategoryForm({ initial, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        name: initial?.name || "",
        description: initial?.description || "",
        color: initial?.color || "#0ea5e9"
    });
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await onSubmit(form);
        } catch (err) {
            setError(err);
            setBusy(false);
        }
    };

    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="form__row form__row--color">
                <label className="field">
                    <span>Nombre</span>
                    <input value={form.name} onChange={update("name")} maxLength={60} required autoFocus />
                </label>

                <label className="field">
                    <span>Color en el mapa</span>
                    <input type="color" value={form.color} onChange={update("color")} />
                </label>
            </div>

            <label className="field">
                <span>Descripción</span>
                <textarea value={form.description} onChange={update("description")} maxLength={200} rows={2} />
            </label>

            <ErrorBox error={error} />

            <div className="form__actions">
                <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button>
            </div>
        </form>
    );
}

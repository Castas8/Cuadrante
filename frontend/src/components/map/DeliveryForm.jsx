// Formulario de una entrega: se usa para crear (clic en el mapa) y para editar (desde el popup).
import { useState } from "react";

import ErrorBox from "../ErrorBox";
import { DELIVERY_STATUSES } from "../../utils/labels";
import { formatCoords } from "../../utils/geo";

export default function DeliveryForm({ initial, location, categories, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        name: initial?.name || "",
        description: initial?.description || "",
        category: initial?.category?.id || categories[0]?.id || "",
        status: initial?.status || "pendiente"
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

    if (categories.length === 0) {
        return (
            <div className="info-box">
                Primero crea al menos una categoría en la vista <strong>Categorías</strong>.
            </div>
        );
    }

    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="coords-pill">📍 {formatCoords(location)}</div>

            <label className="field">
                <span>Nombre del cliente o lugar</span>
                <input value={form.name} onChange={update("name")} maxLength={80} required autoFocus />
            </label>

            <label className="field">
                <span>Descripción</span>
                <textarea value={form.description} onChange={update("description")} maxLength={250} rows={3} required />
            </label>

            <div className="form__row">
                <label className="field">
                    <span>Categoría</span>
                    <select value={form.category} onChange={update("category")}>
                        {categories.map((category) => (
                            <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                    </select>
                </label>

                <label className="field">
                    <span>Estado</span>
                    <select value={form.status} onChange={update("status")}>
                        {DELIVERY_STATUSES.map((status) => (
                            <option key={status.value} value={status.value}>{status.label}</option>
                        ))}
                    </select>
                </label>
            </div>

            {!initial && (
                <p className="muted small">
                    La zona y el repartidor se asignan solos según dónde cae el punto.
                </p>
            )}

            <ErrorBox error={error} />

            <div className="form__actions">
                <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={busy}>
                    {busy ? "Guardando…" : initial ? "Guardar cambios" : "Registrar entrega"}
                </button>
            </div>
        </form>
    );
}

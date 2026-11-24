// Formulario de una zona: nombre, color y repartidor responsable.
import { useState } from "react";

import ErrorBox from "../ErrorBox";
import { ZONE_COLORS } from "../../utils/labels";

export default function ZoneForm({ initial, couriers, defaultColor, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        name: initial?.name || "",
        color: initial?.color || defaultColor || ZONE_COLORS[0],
        courier: initial?.courier?.id || ""
    });
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError(null);

        try {
            await onSubmit({ ...form, courier: form.courier || null });
        } catch (err) {
            setError(err);
            setBusy(false);
        }
    };

    return (
        <form className="form" onSubmit={handleSubmit}>
            <label className="field">
                <span>Nombre de la zona</span>
                <input
                    value={form.name}
                    onChange={(event) => setForm({ ...form, name: event.target.value })}
                    maxLength={60}
                    placeholder="Ej. Zona Oriente"
                    required
                    autoFocus
                />
            </label>

            <div className="field">
                <span>Color</span>
                <div className="swatches">
                    {ZONE_COLORS.map((color) => (
                        <button
                            key={color}
                            type="button"
                            className={`swatch ${form.color === color ? "is-active" : ""}`}
                            style={{ background: color }}
                            onClick={() => setForm({ ...form, color })}
                            aria-label={`Color ${color}`}
                        />
                    ))}
                </div>
            </div>

            <label className="field">
                <span>Repartidor responsable</span>
                <select value={form.courier} onChange={(event) => setForm({ ...form, courier: event.target.value })}>
                    <option value="">Sin asignar</option>
                    {couriers.map((courier) => (
                        <option key={courier.id} value={courier.id}>
                            {courier.name}{courier.status === "inactivo" ? " (inactivo)" : ""}
                        </option>
                    ))}
                </select>
            </label>

            <ErrorBox error={error} />

            <div className="form__actions">
                <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={busy}>
                    {busy ? "Guardando…" : initial ? "Guardar cambios" : "Guardar zona"}
                </button>
            </div>
        </form>
    );
}

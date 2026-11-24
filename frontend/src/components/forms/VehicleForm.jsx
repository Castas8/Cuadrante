import { useState } from "react";

import ErrorBox from "../ErrorBox";
import { VEHICLE_STATUSES, VEHICLE_TYPES } from "../../utils/labels";

export default function VehicleForm({ initial, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        plate: initial?.plate || "",
        type: initial?.type || "motocicleta",
        model: initial?.model || "",
        capacityKg: initial?.capacityKg || "",
        status: initial?.status || "disponible"
    });
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError(null);
        try {
            // El input da texto: el backend espera un número entero
            await onSubmit({ ...form, capacityKg: Number(form.capacityKg) });
        } catch (err) {
            setError(err);
            setBusy(false);
        }
    };

    return (
        <form className="form" onSubmit={handleSubmit}>
            <div className="form__row">
                <label className="field">
                    <span>Placas</span>
                    <input value={form.plate} onChange={update("plate")} maxLength={12} placeholder="GTO-123-A" required autoFocus />
                </label>

                <label className="field">
                    <span>Tipo</span>
                    <select value={form.type} onChange={update("type")}>
                        {VEHICLE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                    </select>
                </label>
            </div>

            <label className="field">
                <span>Modelo</span>
                <input value={form.model} onChange={update("model")} maxLength={60} placeholder="Nissan NP300" required />
            </label>

            <div className="form__row">
                <label className="field">
                    <span>Capacidad (kg)</span>
                    <input type="number" min={1} max={5000} step={1} value={form.capacityKg} onChange={update("capacityKg")} required />
                </label>

                <label className="field">
                    <span>Estado</span>
                    <select value={form.status} onChange={update("status")}>
                        {VEHICLE_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </label>
            </div>

            <ErrorBox error={error} />

            <div className="form__actions">
                <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button>
            </div>
        </form>
    );
}

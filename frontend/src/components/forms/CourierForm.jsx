import { useState } from "react";

import ErrorBox from "../ErrorBox";
import { COURIER_STATUSES, labelOf, VEHICLE_TYPES } from "../../utils/labels";

export default function CourierForm({ initial, vehicles, onSubmit, onCancel }) {
    const [form, setForm] = useState({
        name: initial?.name || "",
        phone: initial?.phone || "",
        status: initial?.status || "activo",
        vehicle: initial?.vehicle?.id || ""
    });
    const [error, setError] = useState(null);
    const [busy, setBusy] = useState(false);

    const update = (field) => (event) => setForm({ ...form, [field]: event.target.value });

    const handleSubmit = async (event) => {
        event.preventDefault();
        setBusy(true);
        setError(null);
        try {
            await onSubmit({ ...form, vehicle: form.vehicle || null });
        } catch (err) {
            setError(err);
            setBusy(false);
        }
    };

    return (
        <form className="form" onSubmit={handleSubmit}>
            <label className="field">
                <span>Nombre</span>
                <input value={form.name} onChange={update("name")} maxLength={80} required autoFocus />
            </label>

            <div className="form__row">
                <label className="field">
                    <span>Teléfono (10 dígitos)</span>
                    <input value={form.phone} onChange={update("phone")} inputMode="numeric" pattern="\d{10}" required />
                </label>

                <label className="field">
                    <span>Estado</span>
                    <select value={form.status} onChange={update("status")}>
                        {COURIER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </select>
                </label>
            </div>

            <label className="field">
                <span>Vehículo</span>
                <select value={form.vehicle} onChange={update("vehicle")}>
                    <option value="">Sin vehículo</option>
                    {vehicles.map((vehicle) => (
                        <option key={vehicle.id} value={vehicle.id}>
                            {vehicle.plate} · {labelOf(VEHICLE_TYPES, vehicle.type)} {vehicle.model}
                        </option>
                    ))}
                </select>
            </label>

            <ErrorBox error={error} />

            <div className="form__actions">
                <button type="button" className="btn btn--ghost" onClick={onCancel}>Cancelar</button>
                <button type="submit" className="btn btn--primary" disabled={busy}>{busy ? "Guardando…" : "Guardar"}</button>
            </div>
        </form>
    );
}

// Botón de eliminar con confirmación en dos pasos (sin ventanas del navegador).
import { useState } from "react";

export default function ConfirmDelete({ onConfirm, label = "Eliminar", busy = false }) {
    const [asking, setAsking] = useState(false);

    if (!asking) {
        return (
            <button type="button" className="btn btn--danger-ghost btn--sm" onClick={() => setAsking(true)}>
                {label}
            </button>
        );
    }

    return (
        <span className="confirm">
            <span>¿Seguro?</span>
            <button type="button" className="btn btn--danger btn--sm" disabled={busy} onClick={onConfirm}>
                Sí, eliminar
            </button>
            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setAsking(false)}>
                No
            </button>
        </span>
    );
}

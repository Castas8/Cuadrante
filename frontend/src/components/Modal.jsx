// Ventana emergente genérica. Se cierra con Esc o con el botón ×.
import { useEffect } from "react";

export default function Modal({ title, children, onClose, width = 480 }) {
    useEffect(() => {
        const onKey = (event) => event.key === "Escape" && onClose();
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [onClose]);

    return (
        <div className="modal-backdrop" onMouseDown={onClose}>
            <div
                className="modal"
                style={{ maxWidth: width }}
                role="dialog"
                aria-modal="true"
                aria-label={title}
                onMouseDown={(event) => event.stopPropagation()}
            >
                <div className="modal__header">
                    <h2>{title}</h2>
                    <button type="button" className="icon-btn" onClick={onClose} aria-label="Cerrar">×</button>
                </div>
                <div className="modal__body">{children}</div>
            </div>
        </div>
    );
}

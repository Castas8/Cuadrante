// Contenido del popup de una entrega: datos, cambio rápido de estado, editar y eliminar.
import ConfirmDelete from "../ConfirmDelete";
import { formatCoords } from "../../utils/geo";
import { DELIVERY_STATUSES, statusInfo } from "../../utils/labels";

export default function DeliveryPopup({ delivery, onStatusChange, onEdit, onDelete }) {
    const status = statusInfo(delivery.status);

    return (
        <div className="popup">
            <div className="popup__title">{delivery.name}</div>
            <div className="popup__meta">
                <span className="chip">
                    <i className="dot" style={{ background: delivery.category?.color }} />
                    {delivery.category?.name}
                </span>
                <span className="badge" style={{ "--badge": status.color }}>{status.label}</span>
            </div>

            <p className="popup__desc">{delivery.description}</p>

            <dl className="popup__facts">
                <dt>Zona</dt>
                <dd>{delivery.zone ? delivery.zone.name : "Fuera de toda zona"}</dd>
                <dt>Repartidor</dt>
                <dd>{delivery.zone?.courier?.name || "Sin asignar"}</dd>
                <dt>Coordenadas</dt>
                <dd className="mono">{formatCoords(delivery.location)}</dd>
            </dl>

            <label className="field field--inline">
                <span>Estado</span>
                <select value={delivery.status} onChange={(event) => onStatusChange(delivery, event.target.value)}>
                    {DELIVERY_STATUSES.map((option) => (
                        <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                </select>
            </label>

            <div className="popup__actions">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => onEdit(delivery)}>
                    Editar
                </button>
                <ConfirmDelete onConfirm={() => onDelete(delivery)} />
            </div>
        </div>
    );
}

// Contenido del popup de una zona: repartidor, entregas y acciones.
import ConfirmDelete from "../ConfirmDelete";

export default function ZonePopup({ zone, deliveriesCount, onEdit, onEditShape, onDelete }) {
    return (
        <div className="popup">
            <div className="popup__title">
                <i className="dot dot--square" style={{ background: zone.color }} /> {zone.name}
            </div>

            <dl className="popup__facts">
                <dt>Repartidor</dt>
                <dd>{zone.courier ? `${zone.courier.name} · ${zone.courier.phone}` : "Sin asignar"}</dd>
                <dt>Entregas</dt>
                <dd>{deliveriesCount} en la vista actual</dd>
                <dt>Vértices</dt>
                <dd>{zone.area.coordinates[0].length - 1}</dd>
            </dl>

            <div className="popup__actions">
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => onEdit(zone)}>Editar datos</button>
                <button type="button" className="btn btn--secondary btn--sm" onClick={() => onEditShape(zone)}>Editar forma</button>
                <ConfirmDelete onConfirm={() => onDelete(zone)} />
            </div>
        </div>
    );
}

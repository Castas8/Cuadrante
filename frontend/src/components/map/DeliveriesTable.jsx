// Tabla de entregas. Se vuelve a dibujar en cuanto cambia la lista,
// así que refleja al instante lo que se agrega, edita o elimina en el mapa.
import { formatCoords } from "../../utils/geo";
import { formatDate, statusInfo } from "../../utils/labels";

export default function DeliveriesTable({ deliveries, loading, onLocate }) {
    return (
        <div className="card table-card">
            <div className="table-card__header">
                <h3>Entregas</h3>
                <span className="muted">{loading ? "Actualizando…" : `${deliveries.length} resultado(s)`}</span>
            </div>

            <div className="table-wrap">
                <table className="table">
                    <thead>
                        <tr>
                            <th>Nombre</th>
                            <th>Descripción</th>
                            <th>Categoría</th>
                            <th>Estado</th>
                            <th>Zona</th>
                            <th>Repartidor</th>
                            <th>Coordenadas (lat, lng)</th>
                            <th>Registrada</th>
                        </tr>
                    </thead>
                    <tbody>
                        {deliveries.length === 0 && (
                            <tr>
                                <td colSpan={8} className="table__empty">
                                    No hay entregas con esos filtros. Activa “Nueva entrega” y haz clic en el mapa.
                                </td>
                            </tr>
                        )}

                        {deliveries.map((delivery) => {
                            const status = statusInfo(delivery.status);

                            return (
                                <tr key={delivery.id} onClick={() => onLocate(delivery)} title="Ver en el mapa">
                                    <td className="strong">{delivery.name}</td>
                                    <td className="table__desc">{delivery.description}</td>
                                    <td>
                                        <span className="chip">
                                            <i className="dot" style={{ background: delivery.category?.color }} />
                                            {delivery.category?.name}
                                        </span>
                                    </td>
                                    <td>
                                        <span className="badge" style={{ "--badge": status.color }}>{status.label}</span>
                                    </td>
                                    <td>
                                        {delivery.zone ? (
                                            <span className="chip">
                                                <i className="dot dot--square" style={{ background: delivery.zone.color }} />
                                                {delivery.zone.name}
                                            </span>
                                        ) : (
                                            <span className="muted">Sin zona</span>
                                        )}
                                    </td>
                                    <td>{delivery.zone?.courier?.name || <span className="muted">—</span>}</td>
                                    <td className="mono">{formatCoords(delivery.location)}</td>
                                    <td className="muted nowrap">{formatDate(delivery.createdAt)}</td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

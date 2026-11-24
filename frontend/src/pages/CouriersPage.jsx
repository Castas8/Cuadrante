// Vista de repartidores: resumen de cada uno (zonas y entregas) + CRUD de repartidores y vehículos.
import { useCallback, useEffect, useState } from "react";

import Modal from "../components/Modal";
import ConfirmDelete from "../components/ConfirmDelete";
import CourierForm from "../components/forms/CourierForm";
import VehicleForm from "../components/forms/VehicleForm";
import { couriersApi, vehiclesApi } from "../api/endpoints";
import { useToast } from "../context/ToastContext";
import { COURIER_STATUSES, DELIVERY_STATUSES, labelOf, VEHICLE_STATUSES, VEHICLE_TYPES } from "../utils/labels";

export default function CouriersPage() {
    const notify = useToast();
    const [summary, setSummary] = useState([]);
    const [couriers, setCouriers] = useState([]);
    const [vehicles, setVehicles] = useState([]);
    const [allVehicles, setAllVehicles] = useState([]);
    const [courierFilters, setCourierFilters] = useState({ search: "", status: "all" });
    const [vehicleFilters, setVehicleFilters] = useState({ search: "", type: "all" });
    const [courierModal, setCourierModal] = useState(null); // null | {} (nuevo) | courier (editar)
    const [vehicleModal, setVehicleModal] = useState(null);

    const loadSummary = useCallback(async () => {
        const [summaryResponse, vehiclesResponse] = await Promise.all([couriersApi.summary(), vehiclesApi.list()]);
        setSummary(summaryResponse.data);
        setAllVehicles(vehiclesResponse.data);
    }, []);

    const loadCouriers = useCallback(async () => {
        const response = await couriersApi.list(courierFilters);
        setCouriers(response.data);
    }, [courierFilters]);

    const loadVehicles = useCallback(async () => {
        const response = await vehiclesApi.list(vehicleFilters);
        setVehicles(response.data);
    }, [vehicleFilters]);

    useEffect(() => { loadSummary().catch((e) => notify(e.message, "error")); }, [loadSummary, notify]);
    useEffect(() => { loadCouriers().catch((e) => notify(e.message, "error")); }, [loadCouriers, notify]);
    useEffect(() => { loadVehicles().catch((e) => notify(e.message, "error")); }, [loadVehicles, notify]);

    const reloadAll = () => Promise.all([loadSummary(), loadCouriers(), loadVehicles()]);

    const saveCourier = async (form) => {
        if (courierModal.id) {
            await couriersApi.update(courierModal.id, form);
            notify("Repartidor actualizado");
        } else {
            await couriersApi.create(form);
            notify("Repartidor creado");
        }
        setCourierModal(null);
        await reloadAll();
    };

    const saveVehicle = async (form) => {
        if (vehicleModal.id) {
            await vehiclesApi.update(vehicleModal.id, form);
            notify("Vehículo actualizado");
        } else {
            await vehiclesApi.create(form);
            notify("Vehículo creado");
        }
        setVehicleModal(null);
        await reloadAll();
    };

    const removeCourier = async (courier) => {
        try {
            await couriersApi.remove(courier.id);
            notify(`${courier.name} eliminado; sus zonas quedaron sin repartidor`);
            await reloadAll();
        } catch (error) {
            notify(error.message, "error");
        }
    };

    const removeVehicle = async (vehicle) => {
        try {
            await vehiclesApi.remove(vehicle.id);
            notify(`Vehículo ${vehicle.plate} eliminado`);
            await reloadAll();
        } catch (error) {
            notify(error.message, "error");
        }
    };

    return (
        <div className="page">
            <div className="page-header">
                <div>
                    <h1>Repartidores</h1>
                    <p className="muted">Quién cubre cada zona, con qué vehículo y cuántas entregas trae.</p>
                </div>
            </div>

            <section className="summary-grid">
                {summary.map((courier) => (
                    <article key={courier.id} className={`card courier-card ${courier.status === "inactivo" ? "is-inactive" : ""}`}>
                        <header>
                            <div className="avatar">{courier.name.split(" ").map((p) => p[0]).slice(0, 2).join("")}</div>
                            <div>
                                <h3>{courier.name}</h3>
                                <p className="muted small">
                                    {courier.vehicle ? `${courier.vehicle.plate} · ${courier.vehicle.model}` : "Sin vehículo"}
                                </p>
                            </div>
                            <span className="badge" style={{ "--badge": courier.status === "activo" ? "#16a34a" : "#6b7280" }}>
                                {labelOf(COURIER_STATUSES, courier.status)}
                            </span>
                        </header>

                        <div className="courier-card__zones">
                            {courier.zones.length === 0 && <span className="muted small">Sin zonas asignadas</span>}
                            {courier.zones.map((zone) => (
                                <span key={zone.id} className="chip">
                                    <i className="dot dot--square" style={{ background: zone.color }} />{zone.name}
                                </span>
                            ))}
                        </div>

                        <div className="courier-card__total">
                            <strong>{courier.deliveries.total}</strong> {courier.deliveries.total === 1 ? "entrega" : "entregas"}
                        </div>

                        {/* Barra apilada: cuántas entregas en cada estado */}
                        <div className="stack-bar" aria-hidden="true">
                            {DELIVERY_STATUSES.map((status) => (
                                courier.deliveries[status.value] > 0 && (
                                    <span
                                        key={status.value}
                                        style={{ flex: courier.deliveries[status.value], background: status.color }}
                                    />
                                )
                            ))}
                        </div>

                        <ul className="courier-card__counts">
                            {DELIVERY_STATUSES.map((status) => (
                                <li key={status.value}>
                                    <i className="dot" style={{ background: status.color }} />
                                    {status.label} <strong>{courier.deliveries[status.value]}</strong>
                                </li>
                            ))}
                        </ul>
                    </article>
                ))}
            </section>

            <div className="two-col">
                <section className="card">
                    <div className="section-header">
                        <h3>Repartidores</h3>
                        <button type="button" className="btn btn--primary btn--sm" onClick={() => setCourierModal({})}>+ Nuevo</button>
                    </div>

                    <div className="filters filters--compact">
                        <input
                            type="search"
                            placeholder="Buscar por nombre…"
                            value={courierFilters.search}
                            onChange={(e) => setCourierFilters({ ...courierFilters, search: e.target.value })}
                        />
                        <select
                            value={courierFilters.status}
                            onChange={(e) => setCourierFilters({ ...courierFilters, status: e.target.value })}
                            aria-label="Filtrar por estado"
                        >
                            <option value="all">Todos</option>
                            {COURIER_STATUSES.map((s) => <option key={s.value} value={s.value}>{s.label}</option>)}
                        </select>
                    </div>

                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr><th>Nombre</th><th>Teléfono</th><th>Vehículo</th><th>Estado</th><th /></tr>
                            </thead>
                            <tbody>
                                {couriers.length === 0 && <tr><td colSpan={5} className="table__empty">Sin resultados.</td></tr>}
                                {couriers.map((courier) => (
                                    <tr key={courier.id}>
                                        <td className="strong">{courier.name}</td>
                                        <td className="mono">{courier.phone}</td>
                                        <td>{courier.vehicle ? courier.vehicle.plate : <span className="muted">—</span>}</td>
                                        <td>{labelOf(COURIER_STATUSES, courier.status)}</td>
                                        <td className="table__actions">
                                            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setCourierModal(courier)}>Editar</button>
                                            <ConfirmDelete onConfirm={() => removeCourier(courier)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section className="card">
                    <div className="section-header">
                        <h3>Vehículos</h3>
                        <button type="button" className="btn btn--primary btn--sm" onClick={() => setVehicleModal({})}>+ Nuevo</button>
                    </div>

                    <div className="filters filters--compact">
                        <input
                            type="search"
                            placeholder="Buscar por placas o modelo…"
                            value={vehicleFilters.search}
                            onChange={(e) => setVehicleFilters({ ...vehicleFilters, search: e.target.value })}
                        />
                        <select
                            value={vehicleFilters.type}
                            onChange={(e) => setVehicleFilters({ ...vehicleFilters, type: e.target.value })}
                            aria-label="Filtrar por tipo"
                        >
                            <option value="all">Todos los tipos</option>
                            {VEHICLE_TYPES.map((t) => <option key={t.value} value={t.value}>{t.label}</option>)}
                        </select>
                    </div>

                    <div className="table-wrap">
                        <table className="table">
                            <thead>
                                <tr><th>Placas</th><th>Tipo</th><th>Modelo</th><th>Capacidad</th><th>Estado</th><th /></tr>
                            </thead>
                            <tbody>
                                {vehicles.length === 0 && <tr><td colSpan={6} className="table__empty">Sin resultados.</td></tr>}
                                {vehicles.map((vehicle) => (
                                    <tr key={vehicle.id}>
                                        <td className="strong mono">{vehicle.plate}</td>
                                        <td>{labelOf(VEHICLE_TYPES, vehicle.type)}</td>
                                        <td>{vehicle.model}</td>
                                        <td>{vehicle.capacityKg} kg</td>
                                        <td>{labelOf(VEHICLE_STATUSES, vehicle.status)}</td>
                                        <td className="table__actions">
                                            <button type="button" className="btn btn--ghost btn--sm" onClick={() => setVehicleModal(vehicle)}>Editar</button>
                                            <ConfirmDelete onConfirm={() => removeVehicle(vehicle)} />
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </section>
            </div>

            {courierModal && (
                <Modal title={courierModal.id ? "Editar repartidor" : "Nuevo repartidor"} onClose={() => setCourierModal(null)}>
                    <CourierForm
                        initial={courierModal.id ? courierModal : null}
                        vehicles={allVehicles}
                        onSubmit={saveCourier}
                        onCancel={() => setCourierModal(null)}
                    />
                </Modal>
            )}

            {vehicleModal && (
                <Modal title={vehicleModal.id ? "Editar vehículo" : "Nuevo vehículo"} onClose={() => setVehicleModal(null)}>
                    <VehicleForm
                        initial={vehicleModal.id ? vehicleModal : null}
                        onSubmit={saveVehicle}
                        onCancel={() => setVehicleModal(null)}
                    />
                </Modal>
            )}
        </div>
    );
}

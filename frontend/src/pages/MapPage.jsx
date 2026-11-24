// Vista principal: mapa + filtros + tabla de entregas.
// Aquí vive el estado (listas, filtros, modo del mapa) y las llamadas a la API.
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import Modal from "../components/Modal";
import CuadranteMap from "../components/map/CuadranteMap";
import DeliveryForm from "../components/map/DeliveryForm";
import ZoneForm from "../components/map/ZoneForm";
import FiltersBar from "../components/map/FiltersBar";
import DeliveriesTable from "../components/map/DeliveriesTable";
import { categoriesApi, couriersApi, deliveriesApi, zonesApi } from "../api/endpoints";
import { useToast } from "../context/ToastContext";
import { layerToPolygon, latLngToPoint, pointToLatLng } from "../utils/geo";
import { DELIVERY_STATUSES, ZONE_COLORS } from "../utils/labels";

const EMPTY_FILTERS = { search: "", category: "all", status: "all", zone: "all" };

export default function MapPage() {
    const notify = useToast();

    // Datos
    const [deliveries, setDeliveries] = useState([]);
    const [zones, setZones] = useState([]);
    const [categories, setCategories] = useState([]);
    const [couriers, setCouriers] = useState([]);
    const [loading, setLoading] = useState(true);

    // Filtros (la búsqueda espera 300 ms para no pedir en cada tecla)
    const [filters, setFilters] = useState(EMPTY_FILTERS);
    const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);

    // Modo del mapa: "view" | "delivery" (clic = nueva entrega) | "drawing" | "shape" (editando forma)
    const [mode, setMode] = useState("view");
    const [newPoint, setNewPoint] = useState(null);
    const [editingDelivery, setEditingDelivery] = useState(null);
    const [newZoneArea, setNewZoneArea] = useState(null);
    const [editingZone, setEditingZone] = useState(null);
    const [shapeZone, setShapeZone] = useState(null);
    const [zonesVersion, setZonesVersion] = useState(0);

    const mapRef = useRef(null);
    const zoneLayers = useRef({});
    const markerRefs = useRef({});

    // ---------- Carga de datos ----------

    const loadDeliveries = useCallback(async (activeFilters) => {
        setLoading(true);
        try {
            const response = await deliveriesApi.list(activeFilters);
            setDeliveries(response.data);
        } catch (error) {
            notify(error.message, "error");
        } finally {
            setLoading(false);
        }
    }, [notify]);

    const loadZones = useCallback(async () => {
        const response = await zonesApi.list();
        setZones(response.data);
        setZonesVersion((version) => version + 1);
    }, []);

    useEffect(() => {
        Promise.all([categoriesApi.list(), couriersApi.list(), loadZones()])
            .then(([categoriesResponse, couriersResponse]) => {
                setCategories(categoriesResponse.data);
                setCouriers(couriersResponse.data);
            })
            .catch((error) => notify(error.message, "error"));
    }, [loadZones, notify]);

    useEffect(() => {
        const timer = setTimeout(() => setAppliedFilters(filters), filters.search === appliedFilters.search ? 0 : 300);
        return () => clearTimeout(timer);
    }, [filters, appliedFilters.search]);

    useEffect(() => {
        loadDeliveries(appliedFilters);
    }, [appliedFilters, loadDeliveries]);

    const refreshDeliveries = () => loadDeliveries(appliedFilters);

    // ---------- Entregas ----------

    const handleMapClick = (latlng) => {
        setNewPoint(latLngToPoint(latlng));
    };

    const createDelivery = async (form) => {
        const response = await deliveriesApi.create({ ...form, location: newPoint });
        const zone = response.data.zone;

        notify(zone
            ? `Entrega registrada en ${zone.name}${zone.courier ? ` · ${zone.courier.name}` : ""}`
            : "Entrega registrada fuera de toda zona");

        setNewPoint(null);
        setMode("view");
        await refreshDeliveries();
    };

    const updateDelivery = async (form) => {
        await deliveriesApi.update(editingDelivery.id, form);
        notify("Entrega actualizada");
        setEditingDelivery(null);
        await refreshDeliveries();
    };

    const deliveryHandlers = {
        onStatusChange: async (delivery, status) => {
            try {
                await deliveriesApi.update(delivery.id, { status });
                notify(`Estado: ${DELIVERY_STATUSES.find((s) => s.value === status).label}`);
                await refreshDeliveries();
            } catch (error) {
                notify(error.message, "error");
            }
        },
        onEdit: (delivery) => {
            mapRef.current?.closePopup();
            setEditingDelivery(delivery);
        },
        onDelete: async (delivery) => {
            try {
                await deliveriesApi.remove(delivery.id);
                mapRef.current?.closePopup();
                notify("Entrega eliminada");
                await refreshDeliveries();
            } catch (error) {
                notify(error.message, "error");
            }
        }
    };

    // Desde la tabla: volar al punto y abrir su popup
    const locateDelivery = (delivery) => {
        const map = mapRef.current;
        if (!map) return;

        map.flyTo(pointToLatLng(delivery.location), 16, { duration: 0.6 });
        map.once("moveend", () => markerRefs.current[delivery.id]?.openPopup());
        document.querySelector(".map")?.scrollIntoView({ behavior: "smooth", block: "center" });
    };

    // ---------- Zonas ----------

    const startDrawing = () => {
        const map = mapRef.current;
        map.closePopup();
        setMode("drawing");

        map.pm.enableDraw("Polygon", {
            pathOptions: { color: "#0f172a", fillOpacity: 0.1 },
            templineStyle: { color: "#0f172a" },
            hintlineStyle: { color: "#0f172a", dashArray: [5, 5] }
        });

        // Cuando el usuario cierra el polígono: lo convertimos a GeoJSON y pedimos sus datos
        map.once("pm:create", ({ layer }) => {
            const area = layerToPolygon(layer);
            map.removeLayer(layer);
            setNewZoneArea(area);
            setMode("view");
        });
    };

    const cancelDrawing = () => {
        mapRef.current.pm.disableDraw();
        mapRef.current.off("pm:create");
        setMode("view");
    };

    const createZone = async (form) => {
        const response = await zonesApi.create({ ...form, area: newZoneArea });
        notify(`Zona "${response.data.name}" creada`);
        setNewZoneArea(null);
        await Promise.all([loadZones(), refreshDeliveries()]);
    };

    const updateZone = async (form) => {
        await zonesApi.update(editingZone.id, form);
        notify("Zona actualizada");
        setEditingZone(null);
        await Promise.all([loadZones(), refreshDeliveries()]);
    };

    const zoneHandlers = {
        onEdit: (zone) => {
            mapRef.current?.closePopup();
            setEditingZone(zone);
        },
        onEditShape: (zone) => {
            mapRef.current?.closePopup();
            const layer = zoneLayers.current[zone.id];
            layer.pm.enable({ allowSelfIntersection: false });
            setShapeZone(zone);
            setMode("shape");
        },
        onDelete: async (zone) => {
            try {
                await zonesApi.remove(zone.id);
                mapRef.current?.closePopup();
                notify(`Zona "${zone.name}" eliminada; sus entregas quedaron sin zona`);
                await Promise.all([loadZones(), refreshDeliveries()]);
            } catch (error) {
                notify(error.message, "error");
            }
        }
    };

    const saveShape = async () => {
        const layer = zoneLayers.current[shapeZone.id];

        try {
            await zonesApi.update(shapeZone.id, { area: layerToPolygon(layer) });
            notify("Forma de la zona actualizada; entregas reasignadas");
            layer.pm.disable();
            setShapeZone(null);
            setMode("view");
            await Promise.all([loadZones(), refreshDeliveries()]);
        } catch (error) {
            // Por ejemplo, si la nueva forma se encima con otra zona
            notify(error.message, "error");
        }
    };

    const cancelShape = () => {
        zoneLayers.current[shapeZone.id]?.pm.disable();
        setShapeZone(null);
        setMode("view");
        setZonesVersion((version) => version + 1); // regresa el polígono a su forma guardada
    };

    // ---------- Resumen ----------

    const zoneCounts = useMemo(() => {
        const counts = {};
        deliveries.forEach((delivery) => {
            const key = delivery.zone ? delivery.zone.id : "none";
            counts[key] = (counts[key] || 0) + 1;
        });
        return counts;
    }, [deliveries]);

    const statusCounts = useMemo(() => {
        return DELIVERY_STATUSES.map((status) => ({
            ...status,
            total: deliveries.filter((delivery) => delivery.status === status.value).length
        }));
    }, [deliveries]);

    const focusZone = (zone) => {
        const layer = zoneLayers.current[zone.id];
        if (layer) mapRef.current.fitBounds(layer.getBounds(), { padding: [30, 30] });
    };

    const onMapReady = useCallback((map) => {
        mapRef.current = map;
    }, []);

    return (
        <div className="map-page">
            <div className="page-header">
                <div>
                    <h1>Mapa de entregas</h1>
                    <p className="muted">Dibuja zonas, registra entregas con un clic y revisa a quién le toca cada pedido.</p>
                </div>

                <div className="toolbar">
                    {mode === "view" && (
                        <>
                            <button type="button" className="btn btn--primary" onClick={() => setMode("delivery")}>
                                + Nueva entrega
                            </button>
                            <button type="button" className="btn btn--secondary" onClick={startDrawing}>
                                ✎ Dibujar zona
                            </button>
                        </>
                    )}
                    {mode === "delivery" && (
                        <button type="button" className="btn btn--ghost" onClick={() => setMode("view")}>Cancelar</button>
                    )}
                    {mode === "drawing" && (
                        <button type="button" className="btn btn--ghost" onClick={cancelDrawing}>Cancelar dibujo</button>
                    )}
                    {mode === "shape" && (
                        <>
                            <button type="button" className="btn btn--primary" onClick={saveShape}>Guardar forma</button>
                            <button type="button" className="btn btn--ghost" onClick={cancelShape}>Cancelar</button>
                        </>
                    )}
                </div>
            </div>

            <FiltersBar filters={filters} onChange={setFilters} categories={categories} zones={zones} />

            <div className="map-layout">
                <div className="card map-card">
                    {mode !== "view" && (
                        <div className="map-hint">
                            {mode === "delivery" && "Haz clic en el mapa donde va la entrega."}
                            {mode === "drawing" && "Haz clic para poner cada vértice. Cierra la zona haciendo clic en el primer punto."}
                            {mode === "shape" && `Arrastra los vértices de "${shapeZone?.name}" y luego presiona Guardar forma.`}
                        </div>
                    )}

                    <CuadranteMap
                        mode={mode}
                        zones={zones}
                        deliveries={deliveries}
                        zoneCounts={zoneCounts}
                        zonesVersion={zonesVersion}
                        zoneLayers={zoneLayers}
                        markerRefs={markerRefs}
                        onReady={onMapReady}
                        onMapClick={handleMapClick}
                        deliveryHandlers={deliveryHandlers}
                        zoneHandlers={zoneHandlers}
                    />
                </div>

                <aside className="side">
                    <div className="card">
                        <h3>Estados</h3>
                        <ul className="stat-list">
                            {statusCounts.map((status) => (
                                <li key={status.value}>
                                    <span className="badge" style={{ "--badge": status.color }}>{status.label}</span>
                                    <strong>{status.total}</strong>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="card">
                        <h3>Zonas</h3>
                        <ul className="zone-list">
                            {zones.length === 0 && <li className="muted">Aún no hay zonas. Usa “Dibujar zona”.</li>}
                            {zones.map((zone) => (
                                <li key={zone.id}>
                                    <button type="button" onClick={() => focusZone(zone)}>
                                        <i className="dot dot--square" style={{ background: zone.color }} />
                                        <span className="zone-list__name">
                                            {zone.name}
                                            <small>{zone.courier ? zone.courier.name : "Sin repartidor"}</small>
                                        </span>
                                        <strong>{zoneCounts[zone.id] || 0}</strong>
                                    </button>
                                </li>
                            ))}
                            <li className="zone-list__none">
                                <span>Sin zona</span>
                                <strong>{zoneCounts.none || 0}</strong>
                            </li>
                        </ul>
                    </div>

                    <div className="card legend">
                        <h3>Categorías</h3>
                        {categories.map((category) => (
                            <span key={category.id} className="chip">
                                <i className="dot" style={{ background: category.color }} />
                                {category.name}
                            </span>
                        ))}
                    </div>
                </aside>
            </div>

            <DeliveriesTable deliveries={deliveries} loading={loading} onLocate={locateDelivery} />

            {newPoint && (
                <Modal title="Nueva entrega" onClose={() => setNewPoint(null)}>
                    <DeliveryForm
                        location={newPoint}
                        categories={categories}
                        onSubmit={createDelivery}
                        onCancel={() => setNewPoint(null)}
                    />
                </Modal>
            )}

            {editingDelivery && (
                <Modal title="Editar entrega" onClose={() => setEditingDelivery(null)}>
                    <DeliveryForm
                        initial={editingDelivery}
                        location={editingDelivery.location}
                        categories={categories}
                        onSubmit={updateDelivery}
                        onCancel={() => setEditingDelivery(null)}
                    />
                </Modal>
            )}

            {newZoneArea && (
                <Modal title="Nueva zona" onClose={() => setNewZoneArea(null)}>
                    <ZoneForm
                        couriers={couriers}
                        defaultColor={ZONE_COLORS[zones.length % ZONE_COLORS.length]}
                        onSubmit={createZone}
                        onCancel={() => setNewZoneArea(null)}
                    />
                </Modal>
            )}

            {editingZone && (
                <Modal title="Editar zona" onClose={() => setEditingZone(null)}>
                    <ZoneForm
                        initial={editingZone}
                        couriers={couriers}
                        onSubmit={updateZone}
                        onCancel={() => setEditingZone(null)}
                    />
                </Modal>
            )}
        </div>
    );
}

// El mapa: pinta las zonas (Polygon) y las entregas (Point) y escucha los clics.
import { useEffect } from "react";
import { CircleMarker, MapContainer, Polygon, Popup, TileLayer, Tooltip, useMap, useMapEvents } from "react-leaflet";
import "@geoman-io/leaflet-geoman-free";

import DeliveryPopup from "./DeliveryPopup";
import ZonePopup from "./ZonePopup";
import { LEON_CENTER, pointToLatLng, polygonToLatLngs } from "../../utils/geo";

// Le pasa a la página el objeto "map" de Leaflet (para dibujar, volar a un punto, etc.)
function MapReady({ onReady }) {
    const map = useMap();

    useEffect(() => {
        // Geoman: solo usamos sus herramientas desde nuestros botones, sin su barra
        map.pm.setLang("es");
        map.pm.setGlobalOptions({ allowSelfIntersection: false, snappable: true });
        onReady(map);
    }, [map, onReady]);

    return null;
}

// Clic en el mapa -> nueva entrega (solo en modo "delivery")
function ClickHandler({ enabled, onMapClick }) {
    useMapEvents({
        click(event) {
            if (enabled) {
                onMapClick(event.latlng);
            }
        }
    });

    return null;
}

export default function CuadranteMap({
    mode,
    zones,
    deliveries,
    zoneCounts,
    zonesVersion,
    zoneLayers,
    markerRefs,
    onReady,
    onMapClick,
    deliveryHandlers,
    zoneHandlers
}) {
    const addingDelivery = mode === "delivery";
    // Mientras se agrega una entrega o se dibuja una zona, las capas dejan pasar el clic al mapa
    const passThrough = mode === "delivery" || mode === "drawing";
    const drawing = mode === "drawing";

    return (
        <MapContainer center={LEON_CENTER} zoom={13} className={`map ${addingDelivery ? "map--crosshair" : ""}`}>
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />

            <MapReady onReady={onReady} />
            <ClickHandler enabled={addingDelivery} onMapClick={onMapClick} />

            {zones.map((zone) => (
                <Polygon
                    // La key cambia con el modo: así Leaflet vuelve a crear la capa con "interactive" actualizado
                    key={`${zone.id}-${passThrough}-${zonesVersion}`}
                    ref={(layer) => {
                        if (layer) zoneLayers.current[zone.id] = layer;
                    }}
                    positions={polygonToLatLngs(zone.area)}
                    pathOptions={{ color: zone.color, weight: 2, fillOpacity: 0.12 }}
                    interactive={!passThrough}
                    bubblingMouseEvents={false}
                >
                    <Tooltip sticky>{zone.name}{zone.courier ? ` · ${zone.courier.name}` : ""}</Tooltip>
                    <Popup>
                        <ZonePopup zone={zone} deliveriesCount={zoneCounts[zone.id] || 0} {...zoneHandlers} />
                    </Popup>
                </Polygon>
            ))}

            {deliveries.map((delivery) => (
                <CircleMarker
                    key={`${delivery.id}-${drawing}`}
                    ref={(layer) => {
                        if (layer) markerRefs.current[delivery.id] = layer;
                    }}
                    center={pointToLatLng(delivery.location)}
                    radius={8}
                    interactive={!drawing}
                    bubblingMouseEvents={false}
                    pathOptions={{
                        color: "#ffffff",
                        weight: 2,
                        fillColor: delivery.category?.color || "#334155",
                        fillOpacity: delivery.status === "cancelado" ? 0.35 : 0.95
                    }}
                >
                    <Popup>
                        <DeliveryPopup delivery={delivery} {...deliveryHandlers} />
                    </Popup>
                </CircleMarker>
            ))}
        </MapContainer>
    );
}

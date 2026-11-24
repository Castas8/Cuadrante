// Conversión de coordenadas entre Leaflet y GeoJSON.
//   Leaflet usa  [latitud, longitud]
//   GeoJSON (MongoDB) usa [longitud, latitud]
// Todo el volteo se hace aquí, en un solo lugar.

export const LEON_CENTER = [21.1250, -101.6860];

// GeoJSON Point -> [lat, lng] para Leaflet
export function pointToLatLng(point) {
    const [lng, lat] = point.coordinates;
    return [lat, lng];
}

// Clic de Leaflet ({ lat, lng }) -> GeoJSON Point
export function latLngToPoint({ lat, lng }) {
    return { type: "Point", coordinates: [round(lng), round(lat)] };
}

// GeoJSON Polygon -> lista de [lat, lng] (sin repetir el último punto)
export function polygonToLatLngs(area) {
    const ring = area.coordinates[0];
    return ring.slice(0, -1).map(([lng, lat]) => [lat, lng]);
}

// Capa de Leaflet (polígono dibujado o editado) -> GeoJSON Polygon cerrado
export function layerToPolygon(layer) {
    const latLngs = layer.getLatLngs()[0];
    const ring = latLngs.map(({ lat, lng }) => [round(lng), round(lat)]);
    ring.push([...ring[0]]);
    return { type: "Polygon", coordinates: [ring] };
}

export function formatCoords(point) {
    const [lng, lat] = point.coordinates;
    return `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
}

function round(value) {
    return Math.round(value * 1e6) / 1e6;
}

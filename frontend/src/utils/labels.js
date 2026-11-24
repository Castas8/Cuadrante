// Etiquetas en español y colores para los valores del backend.

export const DELIVERY_STATUSES = [
    { value: "pendiente", label: "Pendiente", color: "#d97706" },
    { value: "en_ruta", label: "En ruta", color: "#2563eb" },
    { value: "entregado", label: "Entregado", color: "#16a34a" },
    { value: "cancelado", label: "Cancelado", color: "#6b7280" }
];

export const VEHICLE_TYPES = [
    { value: "motocicleta", label: "Motocicleta" },
    { value: "automovil", label: "Automóvil" },
    { value: "camioneta", label: "Camioneta" },
    { value: "bicicleta", label: "Bicicleta" }
];

export const VEHICLE_STATUSES = [
    { value: "disponible", label: "Disponible" },
    { value: "en_mantenimiento", label: "En mantenimiento" }
];

export const COURIER_STATUSES = [
    { value: "activo", label: "Activo" },
    { value: "inactivo", label: "Inactivo" }
];

export const ZONE_COLORS = ["#ef4444", "#2563eb", "#16a34a", "#a855f7", "#f97316", "#0891b2", "#db2777", "#65a30d"];

export function labelOf(list, value) {
    const item = list.find((option) => option.value === value);
    return item ? item.label : value;
}

export function statusInfo(value) {
    return DELIVERY_STATUSES.find((status) => status.value === value) || { label: value, color: "#6b7280" };
}

export function formatDate(value) {
    return new Date(value).toLocaleString("es-MX", {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit"
    });
}

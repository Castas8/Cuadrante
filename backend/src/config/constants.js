"use strict";

// Valores permitidos del dominio. Los usan los modelos (enum) y los validadores,
// así las reglas viven en un solo lugar.

const VEHICLE_TYPES = ["motocicleta", "automovil", "camioneta", "bicicleta"];
const VEHICLE_STATUSES = ["disponible", "en_mantenimiento"];

const COURIER_STATUSES = ["activo", "inactivo"];

const DELIVERY_STATUSES = ["pendiente", "en_ruta", "entregado", "cancelado"];

module.exports = {
    VEHICLE_TYPES,
    VEHICLE_STATUSES,
    COURIER_STATUSES,
    DELIVERY_STATUSES
};

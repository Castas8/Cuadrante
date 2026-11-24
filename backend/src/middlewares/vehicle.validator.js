"use strict";

const { buildBodyValidators, buildQueryValidator } = require("./validatorFactory");
const { isNonEmptyString } = require("../utils/validation");
const { VEHICLE_TYPES, VEHICLE_STATUSES } = require("../config/constants");

function validateFields(body, errors) {
    if (body.plate !== undefined && (!isNonEmptyString(body.plate) || !/^[A-Za-z0-9-]{5,12}$/.test(body.plate.trim()))) {
        errors.push("plate debe tener de 5 a 12 letras, números o guiones.");
    }

    if (body.type !== undefined && !VEHICLE_TYPES.includes(body.type)) {
        errors.push(`type debe ser uno de: ${VEHICLE_TYPES.join(", ")}.`);
    }

    if (body.model !== undefined && (!isNonEmptyString(body.model) || body.model.trim().length > 60)) {
        errors.push("model debe ser un texto de 1 a 60 caracteres.");
    }

    if (body.capacityKg !== undefined && (!Number.isInteger(body.capacityKg) || body.capacityKg < 1 || body.capacityKg > 5000)) {
        errors.push("capacityKg debe ser un número entero entre 1 y 5000.");
    }

    if (body.status !== undefined && !VEHICLE_STATUSES.includes(body.status)) {
        errors.push(`status debe ser uno de: ${VEHICLE_STATUSES.join(", ")}.`);
    }
}

const { validateCreate, validateUpdate } = buildBodyValidators({
    required: ["plate", "type", "model", "capacityKg"],
    allowed: ["plate", "type", "model", "capacityKg", "status"],
    validateFields
});

const validateVehicleQuery = buildQueryValidator({
    search: () => null,
    type: (value) => (VEHICLE_TYPES.includes(value) ? null : "El type de filtrado no es válido."),
    status: (value) => (VEHICLE_STATUSES.includes(value) ? null : "El status de filtrado no es válido.")
});

module.exports = {
    validateCreateVehicle: validateCreate,
    validateUpdateVehicle: validateUpdate,
    validateVehicleQuery
};

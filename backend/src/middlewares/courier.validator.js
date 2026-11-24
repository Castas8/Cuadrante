"use strict";

const { buildBodyValidators, buildQueryValidator } = require("./validatorFactory");
const { isNonEmptyString, isObjectId } = require("../utils/validation");
const { COURIER_STATUSES } = require("../config/constants");

function validateFields(body, errors) {
    if (body.name !== undefined && (!isNonEmptyString(body.name) || body.name.trim().length < 2 || body.name.trim().length > 80)) {
        errors.push("name debe ser un texto de 2 a 80 caracteres.");
    }

    if (body.phone !== undefined && (typeof body.phone !== "string" || !/^\d{10}$/.test(body.phone))) {
        errors.push("phone debe tener exactamente 10 dígitos.");
    }

    if (body.status !== undefined && !COURIER_STATUSES.includes(body.status)) {
        errors.push(`status debe ser uno de: ${COURIER_STATUSES.join(", ")}.`);
    }

    // vehicle puede ser null para quitar el vehículo asignado
    if (body.vehicle !== undefined && body.vehicle !== null && !isObjectId(body.vehicle)) {
        errors.push("vehicle debe ser el id de un vehículo o null.");
    }
}

const { validateCreate, validateUpdate } = buildBodyValidators({
    required: ["name", "phone"],
    allowed: ["name", "phone", "status", "vehicle"],
    validateFields
});

const validateCourierQuery = buildQueryValidator({
    search: () => null,
    status: (value) => (COURIER_STATUSES.includes(value) ? null : "El status de filtrado no es válido.")
});

module.exports = {
    validateCreateCourier: validateCreate,
    validateUpdateCourier: validateUpdate,
    validateCourierQuery
};

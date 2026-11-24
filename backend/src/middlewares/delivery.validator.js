"use strict";

const { buildBodyValidators, buildQueryValidator } = require("./validatorFactory");
const { isNonEmptyString, isObjectId, validatePoint } = require("../utils/validation");
const { DELIVERY_STATUSES } = require("../config/constants");

function validateFields(body, errors) {
    if (body.name !== undefined && (!isNonEmptyString(body.name) || body.name.trim().length > 80)) {
        errors.push("name debe ser un texto de 1 a 80 caracteres.");
    }

    if (body.description !== undefined && (!isNonEmptyString(body.description) || body.description.trim().length > 250)) {
        errors.push("description debe ser un texto de 1 a 250 caracteres.");
    }

    if (body.status !== undefined && !DELIVERY_STATUSES.includes(body.status)) {
        errors.push(`status debe ser uno de: ${DELIVERY_STATUSES.join(", ")}.`);
    }

    if (body.category !== undefined && !isObjectId(body.category)) {
        errors.push("category debe ser el id de una categoría.");
    }

    if (body.location !== undefined) {
        validatePoint(body.location, errors);
    }
}

const { validateCreate, validateUpdate } = buildBodyValidators({
    required: ["name", "description", "category", "location"],
    allowed: ["name", "description", "status", "category", "location"],
    validateFields
});

// ?search=&category=&status=&zone=
const validateDeliveryQuery = buildQueryValidator({
    search: () => null,
    category: (value) => (isObjectId(value) ? null : "La categoría de filtrado no es válida."),
    status: (value) => (DELIVERY_STATUSES.includes(value) ? null : "El status de filtrado no es válido."),
    zone: (value) => (value === "none" || isObjectId(value) ? null : "La zona de filtrado no es válida.")
});

module.exports = {
    validateCreateDelivery: validateCreate,
    validateUpdateDelivery: validateUpdate,
    validateDeliveryQuery
};

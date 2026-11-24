"use strict";

const { buildBodyValidators, buildQueryValidator } = require("./validatorFactory");
const { isNonEmptyString, isHexColor, isObjectId, validatePolygon } = require("../utils/validation");

function validateFields(body, errors) {
    if (body.name !== undefined && (!isNonEmptyString(body.name) || body.name.trim().length > 60)) {
        errors.push("name debe ser un texto de 1 a 60 caracteres.");
    }

    if (body.color !== undefined && !isHexColor(body.color)) {
        errors.push("color debe ser un color hexadecimal, por ejemplo #16a34a.");
    }

    if (body.courier !== undefined && body.courier !== null && !isObjectId(body.courier)) {
        errors.push("courier debe ser el id de un repartidor o null.");
    }

    if (body.area !== undefined) {
        validatePolygon(body.area, errors);
    }
}

const { validateCreate, validateUpdate } = buildBodyValidators({
    required: ["name", "color", "area"],
    allowed: ["name", "color", "courier", "area"],
    validateFields
});

const validateZoneQuery = buildQueryValidator({
    search: () => null
});

module.exports = {
    validateCreateZone: validateCreate,
    validateUpdateZone: validateUpdate,
    validateZoneQuery
};

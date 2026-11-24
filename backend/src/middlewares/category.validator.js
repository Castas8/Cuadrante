"use strict";

const { buildBodyValidators, buildQueryValidator } = require("./validatorFactory");
const { isNonEmptyString, isHexColor } = require("../utils/validation");

function validateFields(body, errors) {
    if (body.name !== undefined && (!isNonEmptyString(body.name) || body.name.trim().length > 60)) {
        errors.push("name debe ser un texto de 1 a 60 caracteres.");
    }

    if (body.description !== undefined && (typeof body.description !== "string" || body.description.length > 200)) {
        errors.push("description debe ser un texto de máximo 200 caracteres.");
    }

    if (body.color !== undefined && !isHexColor(body.color)) {
        errors.push("color debe ser un color hexadecimal, por ejemplo #2563eb.");
    }
}

const { validateCreate, validateUpdate } = buildBodyValidators({
    required: ["name", "color"],
    allowed: ["name", "description", "color"],
    validateFields
});

const validateCategoryQuery = buildQueryValidator({
    search: () => null
});

module.exports = {
    validateCreateCategory: validateCreate,
    validateUpdateCategory: validateUpdate,
    validateCategoryQuery
};

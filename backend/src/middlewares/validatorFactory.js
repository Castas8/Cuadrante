"use strict";

const AppError = require("../utils/appError");
const {
    INVALID_DATA_MESSAGE,
    isPlainObject,
    checkFields
} = require("../utils/validation");

// Arma los dos middlewares de validación del body de una entidad:
// - validateCreate (POST): exige los campos obligatorios
// - validateUpdate (PATCH): pide al menos un campo y valida solo los que vienen
// Cada entidad solo define sus campos y su función validateFields.
function buildBodyValidators({ required, allowed, validateFields }) {
    function validateCreate(req, res, next) {
        const body = req.body;
        const errors = [];

        if (!isPlainObject(body)) {
            return next(new AppError(400, INVALID_DATA_MESSAGE, ["El body debe ser un objeto JSON."]));
        }

        required.forEach((field) => {
            if (body[field] === undefined || body[field] === null || body[field] === "") {
                errors.push(`El campo ${field} es obligatorio.`);
            }
        });

        checkFields(body, allowed, errors);
        validateFields(body, errors);

        if (errors.length > 0) {
            return next(new AppError(400, INVALID_DATA_MESSAGE, errors));
        }

        next();
    }

    function validateUpdate(req, res, next) {
        const body = req.body;
        const errors = [];

        if (!isPlainObject(body)) {
            return next(new AppError(400, INVALID_DATA_MESSAGE, ["El body debe ser un objeto JSON."]));
        }

        const provided = allowed.filter((field) => body[field] !== undefined);

        if (provided.length === 0) {
            errors.push("Debes enviar al menos un campo para actualizar.");
        }

        checkFields(body, allowed, errors);
        validateFields(body, errors);

        if (errors.length > 0) {
            return next(new AppError(400, INVALID_DATA_MESSAGE, errors));
        }

        next();
    }

    return { validateCreate, validateUpdate };
}

// Arma el validador de los filtros del GET (?search=&status=...)
// rules: { nombreDelFiltro: (valor) => mensaje de error o null }
function buildQueryValidator(rules) {
    return function validateQuery(req, res, next) {
        const errors = [];

        Object.entries(rules).forEach(([param, check]) => {
            const value = req.query[param];

            if (value === undefined || value === "" || value === "all") {
                return;
            }

            const error = typeof value === "string" ? check(value) : `El parámetro ${param} no es válido.`;

            if (error) {
                errors.push(error);
            }
        });

        if (errors.length > 0) {
            return next(new AppError(400, "Los parámetros de consulta no son válidos.", errors));
        }

        next();
    };
}

module.exports = { buildBodyValidators, buildQueryValidator };

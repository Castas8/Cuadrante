"use strict";

const AppError = require("../utils/appError");
const {
    isPlainObject,
    isNonEmptyString,
    isValidEmail,
    INVALID_DATA_MESSAGE
} = require("../utils/validation");

const MIN_PASSWORD = 8;

function validateRegister(req, res, next) {
    const body = req.body;
    const errors = [];

    if (!isPlainObject(body)) {
        return next(new AppError(400, INVALID_DATA_MESSAGE, ["El body debe ser un objeto JSON."]));
    }

    if (!isNonEmptyString(body.name)) {
        errors.push("El nombre es obligatorio.");
    } else if (body.name.trim().length < 2) {
        errors.push("El nombre debe tener al menos 2 caracteres.");
    }

    if (!isNonEmptyString(body.email)) {
        errors.push("El correo es obligatorio.");
    } else if (!isValidEmail(body.email)) {
        errors.push("El correo no tiene un formato válido.");
    }

    if (typeof body.password !== "string" || body.password.length === 0) {
        errors.push("La contraseña es obligatoria.");
    } else if (body.password.length < MIN_PASSWORD) {
        errors.push(`La contraseña debe tener al menos ${MIN_PASSWORD} caracteres.`);
    }

    if (errors.length > 0) {
        return next(new AppError(400, INVALID_DATA_MESSAGE, errors));
    }

    next();
}

function validateLogin(req, res, next) {
    const body = req.body;
    const errors = [];

    if (!isPlainObject(body)) {
        return next(new AppError(400, INVALID_DATA_MESSAGE, ["El body debe ser un objeto JSON."]));
    }

    if (!isNonEmptyString(body.email)) {
        errors.push("El correo es obligatorio.");
    }

    if (typeof body.password !== "string" || body.password.length === 0) {
        errors.push("La contraseña es obligatoria.");
    }

    if (errors.length > 0) {
        return next(new AppError(400, INVALID_DATA_MESSAGE, errors));
    }

    next();
}

module.exports = { validateRegister, validateLogin };

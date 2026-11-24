"use strict";

const AppError = require("../utils/appError");

// 404: ninguna ruta coincidió
function notFoundHandler(req, res, next) {
    next(new AppError(404, `No existe la ruta ${req.method} ${req.originalUrl}.`));
}

// Imprime el error en consola (solo los inesperados, para no llenar el log)
function logErrors(err, req, res, next) {
    const statusCode = err.statusCode || err.status || 500;

    if (statusCode >= 500) {
        console.error(err);
    }

    next(err);
}

// Respuesta final de error: siempre con el mismo formato JSON
function errorHandler(err, req, res, next) {
    let statusCode = err.statusCode || err.status || 500;
    let message = err.message;
    let details = err.details || null;

    // JSON mal escrito en el body
    if (err.type === "entity.parse.failed") {
        statusCode = 400;
        message = "El cuerpo JSON contiene un error de sintaxis.";
    }

    // Reglas del schema de Mongoose que no se cumplieron
    if (err.name === "ValidationError") {
        statusCode = 400;
        message = "Los datos no cumplen con el modelo de la base de datos.";
        details = Object.values(err.errors).map((item) => item.message);
    }

    // Llave única repetida (por ejemplo, correo duplicado)
    if (err.code === 11000) {
        statusCode = 400;
        message = "Ya existe un registro con ese valor.";
        details = Object.keys(err.keyValue || {});
    }

    // Polígono inválido para MongoDB (por ejemplo, sus lados se cruzan entre sí)
    if (err.code === 16755 || /Loop is not valid|Edges \d+ and \d+ cross|Duplicate vertices/i.test(err.message || "")) {
        statusCode = 400;
        message = "El polígono no es válido: sus lados no deben cruzarse entre sí.";
        details = null;
    }

    // Nunca mostramos detalles internos de un 500
    if (statusCode >= 500) {
        message = "Ocurrió un error interno en el servidor.";
        details = null;
    }

    res.status(statusCode).json({
        error: statusCode,
        message,
        details,
        path: req.originalUrl,
        timestamp: new Date().toISOString()
    });
}

module.exports = { notFoundHandler, logErrors, errorHandler };

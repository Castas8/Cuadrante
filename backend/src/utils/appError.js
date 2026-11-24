"use strict";

// Error con código HTTP. Los services lo lanzan y el errorHandler lo responde.
class AppError extends Error {
    constructor(statusCode, message, details = null) {
        super(message);
        this.name = "AppError";
        this.statusCode = statusCode;
        this.details = details;
    }
}

module.exports = AppError;

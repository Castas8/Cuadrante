"use strict";

const AppError = require("../utils/appError");
const { verifyToken } = require("../utils/token");
const AuthService = require("../services/auth.service");

const authService = new AuthService();

// Protege rutas: sin un token válido responde 401.
// El frontend manda el token en el header:  Authorization: Bearer <token>
async function requireAuth(req, res, next) {
    const header = req.headers.authorization || "";
    const [scheme, token] = header.split(" ");

    if (scheme !== "Bearer" || !token) {
        return next(new AppError(401, "Debes iniciar sesión para acceder."));
    }

    let payload;

    try {
        payload = verifyToken(token);
    } catch (error) {
        const message = error.name === "TokenExpiredError"
            ? "Tu sesión expiró. Inicia sesión de nuevo."
            : "El token no es válido.";

        return next(new AppError(401, message));
    }

    // Deja al usuario disponible para los siguientes handlers
    req.user = await authService.getById(payload.sub);

    next();
}

module.exports = { requireAuth };

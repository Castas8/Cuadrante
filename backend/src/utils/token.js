"use strict";

const jwt = require("jsonwebtoken");

// Crea el token de sesión con el id del usuario adentro
function signToken(user) {
    return jwt.sign(
        { sub: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || "8h" }
    );
}

// Revisa que el token sea válido y no haya expirado; regresa su contenido
function verifyToken(token) {
    return jwt.verify(token, process.env.JWT_SECRET);
}

module.exports = { signToken, verifyToken };

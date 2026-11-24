"use strict";

const express = require("express");

const AuthService = require("../services/auth.service");
const { validateRegister, validateLogin } = require("../middlewares/auth.validator");
const { requireAuth } = require("../middlewares/auth.middleware");

const router = express.Router();
const service = new AuthService();

// Crear cuenta
router.post("/register", validateRegister, async (req, res) => {
    const result = await service.register(req.body);

    res.status(201).json({
        message: "Cuenta creada correctamente",
        data: result
    });
});

// Iniciar sesión
router.post("/login", validateLogin, async (req, res) => {
    const result = await service.login(req.body);

    res.status(200).json({
        message: "Sesión iniciada correctamente",
        data: result
    });
});

// Usuario de la sesión actual (el frontend lo usa para saber si sigue logueado)
router.get("/me", requireAuth, async (req, res) => {
    res.status(200).json({ data: req.user });
});

module.exports = router;

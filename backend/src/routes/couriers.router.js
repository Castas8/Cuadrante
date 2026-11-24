"use strict";

const express = require("express");

const CouriersService = require("../services/couriers.service");
const {
    validateCreateCourier,
    validateUpdateCourier,
    validateCourierQuery
} = require("../middlewares/courier.validator");

const router = express.Router();
const service = new CouriersService();

// Todas las rutas de este archivo ya pasaron por requireAuth (ver routes/index.js),
// así que req.user es el usuario de la sesión: cada cuenta solo ve sus propios datos.

function getFilters(req) {
    return {
        search: req.query.search,
        status: req.query.status
    };
}

router.get("/", validateCourierQuery, async (req, res) => {
    const items = await service.getAll(req.user.id, getFilters(req));

    res.status(200).json({ count: items.length, data: items });
});

// Resumen para el panel de repartidores (zonas y entregas por estado)
router.get("/summary", async (req, res) => {
    const summary = await service.getSummary(req.user.id);

    res.status(200).json({ count: summary.length, data: summary });
});

router.get("/:id", async (req, res) => {
    const item = await service.getById(req.user.id, req.params.id);

    res.status(200).json({ data: item });
});

router.post("/", validateCreateCourier, async (req, res) => {
    const item = await service.create(req.user.id, req.body);

    res.status(201).json({ message: "Repartidor creado correctamente", data: item });
});

router.patch("/:id", validateUpdateCourier, async (req, res) => {
    const item = await service.update(req.user.id, req.params.id, req.body);

    res.status(200).json({ message: "Repartidor actualizado correctamente", data: item });
});

router.delete("/:id", async (req, res) => {
    const item = await service.delete(req.user.id, req.params.id);

    res.status(200).json({ message: "Repartidor eliminado correctamente", data: item });
});

module.exports = router;

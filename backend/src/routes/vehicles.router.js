"use strict";

const express = require("express");

const VehiclesService = require("../services/vehicles.service");
const {
    validateCreateVehicle,
    validateUpdateVehicle,
    validateVehicleQuery
} = require("../middlewares/vehicle.validator");

const router = express.Router();
const service = new VehiclesService();

// Todas las rutas de este archivo ya pasaron por requireAuth (ver routes/index.js),
// así que req.user es el usuario de la sesión: cada cuenta solo ve sus propios datos.

function getFilters(req) {
    return {
        search: req.query.search,
        type: req.query.type,
        status: req.query.status
    };
}

router.get("/", validateVehicleQuery, async (req, res) => {
    const items = await service.getAll(req.user.id, getFilters(req));

    res.status(200).json({ count: items.length, data: items });
});

router.get("/:id", async (req, res) => {
    const item = await service.getById(req.user.id, req.params.id);

    res.status(200).json({ data: item });
});

router.post("/", validateCreateVehicle, async (req, res) => {
    const item = await service.create(req.user.id, req.body);

    res.status(201).json({ message: "Vehículo creado correctamente", data: item });
});

router.patch("/:id", validateUpdateVehicle, async (req, res) => {
    const item = await service.update(req.user.id, req.params.id, req.body);

    res.status(200).json({ message: "Vehículo actualizado correctamente", data: item });
});

router.delete("/:id", async (req, res) => {
    const item = await service.delete(req.user.id, req.params.id);

    res.status(200).json({ message: "Vehículo eliminado correctamente", data: item });
});

module.exports = router;

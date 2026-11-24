"use strict";

const express = require("express");

const DeliveriesService = require("../services/deliveries.service");
const {
    validateCreateDelivery,
    validateUpdateDelivery,
    validateDeliveryQuery
} = require("../middlewares/delivery.validator");

const router = express.Router();
const service = new DeliveriesService();

// Todas las rutas de este archivo ya pasaron por requireAuth (ver routes/index.js),
// así que req.user es el usuario de la sesión: cada cuenta solo ve sus propios datos.

function getFilters(req) {
    return {
        search: req.query.search,
        category: req.query.category,
        status: req.query.status,
        zone: req.query.zone
    };
}

router.get("/", validateDeliveryQuery, async (req, res) => {
    const items = await service.getAll(req.user.id, getFilters(req));

    res.status(200).json({ count: items.length, data: items });
});

// GeoJSON para pintar en el mapa (va antes de /:id para que "geojson" no se tome como id)
router.get("/geojson", validateDeliveryQuery, async (req, res) => {
    const geoJSON = await service.getGeoJSON(req.user.id, getFilters(req));

    res.status(200).json(geoJSON);
});

router.get("/:id", async (req, res) => {
    const item = await service.getById(req.user.id, req.params.id);

    res.status(200).json({ data: item });
});

router.post("/", validateCreateDelivery, async (req, res) => {
    const item = await service.create(req.user.id, req.body);

    res.status(201).json({ message: "Entrega registrada correctamente", data: item });
});

router.patch("/:id", validateUpdateDelivery, async (req, res) => {
    const item = await service.update(req.user.id, req.params.id, req.body);

    res.status(200).json({ message: "Entrega actualizada correctamente", data: item });
});

router.delete("/:id", async (req, res) => {
    const item = await service.delete(req.user.id, req.params.id);

    res.status(200).json({ message: "Entrega eliminada correctamente", data: item });
});

module.exports = router;

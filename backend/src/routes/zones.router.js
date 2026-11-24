"use strict";

const express = require("express");

const ZonesService = require("../services/zones.service");
const {
    validateCreateZone,
    validateUpdateZone,
    validateZoneQuery
} = require("../middlewares/zone.validator");

const router = express.Router();
const service = new ZonesService();

// Todas las rutas de este archivo ya pasaron por requireAuth (ver routes/index.js),
// así que req.user es el usuario de la sesión: cada cuenta solo ve sus propios datos.

function getFilters(req) {
    return {
        search: req.query.search
    };
}

router.get("/", validateZoneQuery, async (req, res) => {
    const items = await service.getAll(req.user.id, getFilters(req));

    res.status(200).json({ count: items.length, data: items });
});

// GeoJSON para pintar en el mapa (va antes de /:id para que "geojson" no se tome como id)
router.get("/geojson", validateZoneQuery, async (req, res) => {
    const geoJSON = await service.getGeoJSON(req.user.id, getFilters(req));

    res.status(200).json(geoJSON);
});

router.get("/:id", async (req, res) => {
    const item = await service.getById(req.user.id, req.params.id);

    res.status(200).json({ data: item });
});

router.post("/", validateCreateZone, async (req, res) => {
    const item = await service.create(req.user.id, req.body);

    res.status(201).json({ message: "Zona creada correctamente", data: item });
});

router.patch("/:id", validateUpdateZone, async (req, res) => {
    const item = await service.update(req.user.id, req.params.id, req.body);

    res.status(200).json({ message: "Zona actualizada correctamente", data: item });
});

router.delete("/:id", async (req, res) => {
    const item = await service.delete(req.user.id, req.params.id);

    res.status(200).json({ message: "Zona eliminada correctamente", data: item });
});

module.exports = router;

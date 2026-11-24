"use strict";

const express = require("express");

const CategoriesService = require("../services/categories.service");
const {
    validateCreateCategory,
    validateUpdateCategory,
    validateCategoryQuery
} = require("../middlewares/category.validator");

const router = express.Router();
const service = new CategoriesService();

// Todas las rutas de este archivo ya pasaron por requireAuth (ver routes/index.js),
// así que req.user es el usuario de la sesión: cada cuenta solo ve sus propios datos.

function getFilters(req) {
    return {
        search: req.query.search
    };
}

router.get("/", validateCategoryQuery, async (req, res) => {
    const items = await service.getAll(req.user.id, getFilters(req));

    res.status(200).json({ count: items.length, data: items });
});

router.get("/:id", async (req, res) => {
    const item = await service.getById(req.user.id, req.params.id);

    res.status(200).json({ data: item });
});

router.post("/", validateCreateCategory, async (req, res) => {
    const item = await service.create(req.user.id, req.body);

    res.status(201).json({ message: "Categoría creada correctamente", data: item });
});

router.patch("/:id", validateUpdateCategory, async (req, res) => {
    const item = await service.update(req.user.id, req.params.id, req.body);

    res.status(200).json({ message: "Categoría actualizada correctamente", data: item });
});

router.delete("/:id", async (req, res) => {
    const item = await service.delete(req.user.id, req.params.id);

    res.status(200).json({ message: "Categoría eliminada correctamente", data: item });
});

module.exports = router;

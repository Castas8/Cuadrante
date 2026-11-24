"use strict";

const mongoose = require("mongoose");

const AppError = require("../utils/appError");
const { buildSearchRegex } = require("../utils/search");
const CategoryModel = require("../models/category.model");
const DeliveryModel = require("../models/delivery.model");

class CategoriesService {
    async getAll(owner, filters = {}) {
        const query = { owner };

        if (filters.search && filters.search.trim()) {
            query.name = buildSearchRegex(filters.search);
        }

        return CategoryModel.find(query).sort({ name: 1 });
    }

    async getById(owner, id) {
        if (!mongoose.isValidObjectId(id)) {
            throw new AppError(400, `El id ${id} no es válido.`);
        }

        const category = await CategoryModel.findOne({ _id: id, owner });

        if (!category) {
            throw new AppError(404, `No existe la categoría con id ${id}.`);
        }

        return category;
    }

    async create(owner, data) {
        await this.assertUniqueName(owner, data.name);

        return CategoryModel.create({
            name: data.name.trim(),
            description: (data.description || "").trim(),
            color: data.color,
            owner
        });
    }

    async update(owner, id, changes) {
        const category = await this.getById(owner, id);

        if (changes.name !== undefined) {
            await this.assertUniqueName(owner, changes.name, category._id);
            category.name = changes.name.trim();
        }

        if (changes.description !== undefined) {
            category.description = changes.description.trim();
        }

        if (changes.color !== undefined) {
            category.color = changes.color;
        }

        await category.save();
        return category;
    }

    async delete(owner, id) {
        const category = await this.getById(owner, id);

        // No se puede borrar una categoría que usan entregas: se quedarían sin categoría
        const inUse = await DeliveryModel.countDocuments({ owner, category: category._id });

        if (inUse > 0) {
            throw new AppError(400, `No se puede eliminar: ${inUse} entrega(s) usan la categoría "${category.name}".`);
        }

        await category.deleteOne();
        return category;
    }

    async assertUniqueName(owner, name, excludeId = null) {
        const query = { owner, name: name.trim() };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        if (await CategoryModel.exists(query)) {
            throw new AppError(400, `Ya existe una categoría llamada "${name.trim()}".`);
        }
    }
}

module.exports = CategoriesService;

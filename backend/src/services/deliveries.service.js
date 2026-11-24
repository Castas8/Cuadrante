"use strict";

const mongoose = require("mongoose");

const AppError = require("../utils/appError");
const { buildSearchRegex } = require("../utils/search");
const { assertOwned } = require("../utils/ownership");
const DeliveryModel = require("../models/delivery.model");
const CategoryModel = require("../models/category.model");
const ZoneModel = require("../models/zone.model");

// populate anidado: entrega -> categoría, y entrega -> zona -> repartidor
const DELIVERY_POPULATE = [
    { path: "category", select: "name color" },
    {
        path: "zone",
        select: "name color courier",
        populate: { path: "courier", select: "name phone" }
    }
];

class DeliveriesService {
    // Filtros que resuelve el backend: ?search=&category=&status=&zone=
    async getAll(owner, filters = {}) {
        const query = { owner };

        if (filters.category && filters.category !== "all") {
            query.category = filters.category;
        }

        if (filters.status && filters.status !== "all") {
            query.status = filters.status;
        }

        // zone=none -> entregas que no cayeron en ninguna zona
        if (filters.zone && filters.zone !== "all") {
            query.zone = filters.zone === "none" ? null : filters.zone;
        }

        if (filters.search && filters.search.trim()) {
            const regex = buildSearchRegex(filters.search);
            query.$or = [{ name: regex }, { description: regex }];
        }

        return DeliveryModel.find(query).populate(DELIVERY_POPULATE).sort({ createdAt: -1 });
    }

    async getById(owner, id) {
        if (!mongoose.isValidObjectId(id)) {
            throw new AppError(400, `El id ${id} no es válido.`);
        }

        const delivery = await DeliveryModel.findOne({ _id: id, owner }).populate(DELIVERY_POPULATE);

        if (!delivery) {
            throw new AppError(404, `No existe la entrega con id ${id}.`);
        }

        return delivery;
    }

    async create(owner, data) {
        await assertOwned(CategoryModel, data.category, owner, "la categoría");

        const location = {
            type: "Point",
            coordinates: data.location.coordinates
        };

        const delivery = await DeliveryModel.create({
            name: data.name.trim(),
            description: data.description.trim(),
            status: data.status || "pendiente",
            category: data.category,
            location,
            // La zona la decide el mapa, no el usuario
            zone: await this.findZoneFor(owner, location),
            owner
        });

        return delivery.populate(DELIVERY_POPULATE);
    }

    async update(owner, id, changes) {
        const delivery = await this.getById(owner, id);

        if (changes.category !== undefined) {
            await assertOwned(CategoryModel, changes.category, owner, "la categoría");
            delivery.category = changes.category;
        }

        if (changes.name !== undefined) {
            delivery.name = changes.name.trim();
        }

        if (changes.description !== undefined) {
            delivery.description = changes.description.trim();
        }

        if (changes.status !== undefined) {
            delivery.status = changes.status;
        }

        // Si se mueve el punto, se vuelve a calcular su zona
        if (changes.location !== undefined) {
            delivery.location = { type: "Point", coordinates: changes.location.coordinates };
            delivery.zone = await this.findZoneFor(owner, delivery.location);
        }

        await delivery.save();
        return delivery.populate(DELIVERY_POPULATE);
    }

    async delete(owner, id) {
        const delivery = await this.getById(owner, id);

        await delivery.deleteOne();
        return delivery;
    }

    async getGeoJSON(owner, filters = {}) {
        const deliveries = await this.getAll(owner, filters);

        return {
            type: "FeatureCollection",
            features: deliveries.map((delivery) => ({
                type: "Feature",
                geometry: delivery.location,
                properties: {
                    id: delivery.id,
                    name: delivery.name,
                    description: delivery.description,
                    status: delivery.status,
                    category: delivery.category ? delivery.category.name : null,
                    color: delivery.category ? delivery.category.color : null,
                    zone: delivery.zone ? delivery.zone.name : null,
                    courier: delivery.zone && delivery.zone.courier ? delivery.zone.courier.name : null,
                    createdAt: delivery.createdAt,
                    updatedAt: delivery.updatedAt
                }
            }))
        };
    }

    // $geoIntersects: ¿qué zona de esta cuenta contiene este punto?
    async findZoneFor(owner, location) {
        const zone = await ZoneModel.findOne({
            owner,
            area: { $geoIntersects: { $geometry: location } }
        }).select("_id");

        return zone ? zone._id : null;
    }
}

module.exports = DeliveriesService;

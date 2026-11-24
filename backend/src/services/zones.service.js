"use strict";

const mongoose = require("mongoose");

const AppError = require("../utils/appError");
const { buildSearchRegex } = require("../utils/search");
const { assertOwned } = require("../utils/ownership");
const { closeRing } = require("../utils/validation");
const ZoneModel = require("../models/zone.model");
const CourierModel = require("../models/courier.model");
const DeliveryModel = require("../models/delivery.model");

const ZONE_POPULATE = { path: "courier", select: "name phone status" };

class ZonesService {
    async getAll(owner, filters = {}) {
        const query = { owner };

        if (filters.search && filters.search.trim()) {
            query.name = buildSearchRegex(filters.search);
        }

        return ZoneModel.find(query).populate(ZONE_POPULATE).sort({ name: 1 });
    }

    async getById(owner, id) {
        if (!mongoose.isValidObjectId(id)) {
            throw new AppError(400, `El id ${id} no es válido.`);
        }

        const zone = await ZoneModel.findOne({ _id: id, owner }).populate(ZONE_POPULATE);

        if (!zone) {
            throw new AppError(404, `No existe la zona con id ${id}.`);
        }

        return zone;
    }

    async create(owner, data) {
        await this.assertUniqueName(owner, data.name);

        if (data.courier) {
            await assertOwned(CourierModel, data.courier, owner, "el repartidor");
        }

        const area = this.normalizeArea(data.area);
        await this.assertNoOverlap(owner, area);

        const zone = await ZoneModel.create({
            name: data.name.trim(),
            color: data.color,
            courier: data.courier || null,
            area,
            owner
        });

        // Las entregas que ya existían dentro del polígono ahora pertenecen a esta zona
        await this.syncDeliveries(owner, zone);

        return zone.populate(ZONE_POPULATE);
    }

    async update(owner, id, changes) {
        const zone = await this.getById(owner, id);

        if (changes.name !== undefined) {
            await this.assertUniqueName(owner, changes.name, zone._id);
            zone.name = changes.name.trim();
        }

        if (changes.color !== undefined) {
            zone.color = changes.color;
        }

        if (changes.courier !== undefined) {
            if (changes.courier !== null) {
                await assertOwned(CourierModel, changes.courier, owner, "el repartidor");
            }

            zone.courier = changes.courier;
        }

        const areaChanged = changes.area !== undefined;

        if (areaChanged) {
            const area = this.normalizeArea(changes.area);
            await this.assertNoOverlap(owner, area, zone._id);
            zone.area = area;
        }

        await zone.save();

        // Si se movieron los vértices, se recalcula qué entregas quedan dentro
        if (areaChanged) {
            await this.syncDeliveries(owner, zone);
        }

        return zone.populate(ZONE_POPULATE);
    }

    async delete(owner, id) {
        const zone = await this.getById(owner, id);

        // Las entregas de esta zona se quedan "sin zona" (no se borran)
        await DeliveryModel.updateMany({ owner, zone: zone._id }, { $set: { zone: null } });

        await zone.deleteOne();
        return zone;
    }

    async getGeoJSON(owner, filters = {}) {
        const zones = await this.getAll(owner, filters);

        return {
            type: "FeatureCollection",
            features: zones.map((zone) => ({
                type: "Feature",
                geometry: zone.area,
                properties: {
                    id: zone.id,
                    name: zone.name,
                    color: zone.color,
                    courier: zone.courier ? zone.courier.name : null
                }
            }))
        };
    }

    // ---------- Reglas geoespaciales ----------

    normalizeArea(area) {
        return {
            type: "Polygon",
            coordinates: [closeRing(area.coordinates[0])]
        };
    }

    // $geoIntersects: ¿existe otra zona de esta cuenta que toque o se cruce con el polígono nuevo?
    async assertNoOverlap(owner, area, excludeId = null) {
        const query = {
            owner,
            area: { $geoIntersects: { $geometry: area } }
        };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        const overlapping = await ZoneModel.findOne(query).select("name");

        if (overlapping) {
            throw new AppError(400, `La zona se cruza con "${overlapping.name}". Dibuja el área sin encimarla con otra zona.`);
        }
    }

    // $geoWithin: asigna a la zona todas las entregas cuyo punto cae dentro del polígono
    async syncDeliveries(owner, zone) {
        // 1. Las que estaban en la zona pero ya quedaron fuera
        await DeliveryModel.updateMany(
            { owner, zone: zone._id, location: { $not: { $geoWithin: { $geometry: zone.area } } } },
            { $set: { zone: null } }
        );

        // 2. Las que están dentro del polígono
        await DeliveryModel.updateMany(
            { owner, location: { $geoWithin: { $geometry: zone.area } } },
            { $set: { zone: zone._id } }
        );
    }

    async assertUniqueName(owner, name, excludeId = null) {
        const query = { owner, name: name.trim() };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        if (await ZoneModel.exists(query)) {
            throw new AppError(400, `Ya existe una zona llamada "${name.trim()}".`);
        }
    }
}

module.exports = ZonesService;

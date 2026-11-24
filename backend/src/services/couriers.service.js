"use strict";

const mongoose = require("mongoose");

const AppError = require("../utils/appError");
const { buildSearchRegex } = require("../utils/search");
const { assertOwned } = require("../utils/ownership");
const { DELIVERY_STATUSES } = require("../config/constants");
const CourierModel = require("../models/courier.model");
const VehicleModel = require("../models/vehicle.model");
const ZoneModel = require("../models/zone.model");
const DeliveryModel = require("../models/delivery.model");

// populate: en lugar del ObjectId del vehículo, trae sus datos
const COURIER_POPULATE = { path: "vehicle", select: "plate type model" };

class CouriersService {
    async getAll(owner, filters = {}) {
        const query = { owner };

        if (filters.status && filters.status !== "all") {
            query.status = filters.status;
        }

        if (filters.search && filters.search.trim()) {
            query.name = buildSearchRegex(filters.search);
        }

        return CourierModel.find(query).populate(COURIER_POPULATE).sort({ name: 1 });
    }

    async getById(owner, id) {
        if (!mongoose.isValidObjectId(id)) {
            throw new AppError(400, `El id ${id} no es válido.`);
        }

        const courier = await CourierModel.findOne({ _id: id, owner }).populate(COURIER_POPULATE);

        if (!courier) {
            throw new AppError(404, `No existe el repartidor con id ${id}.`);
        }

        return courier;
    }

    async create(owner, data) {
        if (data.vehicle) {
            await assertOwned(VehicleModel, data.vehicle, owner, "el vehículo");
        }

        const courier = await CourierModel.create({
            name: data.name.trim(),
            phone: data.phone,
            status: data.status || "activo",
            vehicle: data.vehicle || null,
            owner
        });

        return courier.populate(COURIER_POPULATE);
    }

    async update(owner, id, changes) {
        const courier = await this.getById(owner, id);

        if (changes.vehicle !== undefined && changes.vehicle !== null) {
            await assertOwned(VehicleModel, changes.vehicle, owner, "el vehículo");
        }

        if (changes.name !== undefined) {
            courier.name = changes.name.trim();
        }

        ["phone", "status", "vehicle"].forEach((field) => {
            if (changes[field] !== undefined) {
                courier[field] = changes[field];
            }
        });

        await courier.save();
        return courier.populate(COURIER_POPULATE);
    }

    async delete(owner, id) {
        const courier = await this.getById(owner, id);

        // Sus zonas se quedan sin repartidor asignado (las entregas no se pierden)
        await ZoneModel.updateMany({ owner, courier: courier._id }, { $set: { courier: null } });

        await courier.deleteOne();
        return courier;
    }

    // Resumen para el panel de repartidores: sus zonas y cuántas entregas tiene en cada estado
    async getSummary(owner) {
        const ownerId = new mongoose.Types.ObjectId(String(owner));

        const [couriers, zones, counts] = await Promise.all([
            CourierModel.find({ owner }).populate(COURIER_POPULATE).sort({ name: 1 }),
            ZoneModel.find({ owner }).select("name color courier"),
            // Agrupa las entregas por zona y estado
            DeliveryModel.aggregate([
                { $match: { owner: ownerId, zone: { $ne: null } } },
                { $group: { _id: { zone: "$zone", status: "$status" }, total: { $sum: 1 } } }
            ])
        ]);

        const emptyCounts = () => Object.fromEntries(DELIVERY_STATUSES.map((status) => [status, 0]));

        return couriers.map((courier) => {
            const courierZones = zones.filter((zone) => String(zone.courier) === courier.id);
            const zoneIds = courierZones.map((zone) => zone.id);
            const deliveries = emptyCounts();

            counts
                .filter((row) => zoneIds.includes(String(row._id.zone)))
                .forEach((row) => {
                    deliveries[row._id.status] += row.total;
                });

            return {
                ...courier.toJSON(),
                zones: courierZones.map((zone) => ({ id: zone.id, name: zone.name, color: zone.color })),
                deliveries: {
                    ...deliveries,
                    total: Object.values(deliveries).reduce((sum, n) => sum + n, 0)
                }
            };
        });
    }
}

module.exports = CouriersService;

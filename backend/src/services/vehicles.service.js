"use strict";

const mongoose = require("mongoose");

const AppError = require("../utils/appError");
const { buildSearchRegex } = require("../utils/search");
const VehicleModel = require("../models/vehicle.model");
const CourierModel = require("../models/courier.model");

class VehiclesService {
    async getAll(owner, filters = {}) {
        const query = { owner };

        if (filters.type && filters.type !== "all") {
            query.type = filters.type;
        }

        if (filters.status && filters.status !== "all") {
            query.status = filters.status;
        }

        if (filters.search && filters.search.trim()) {
            const regex = buildSearchRegex(filters.search);
            query.$or = [{ plate: regex }, { model: regex }];
        }

        return VehicleModel.find(query).sort({ plate: 1 });
    }

    async getById(owner, id) {
        if (!mongoose.isValidObjectId(id)) {
            throw new AppError(400, `El id ${id} no es válido.`);
        }

        const vehicle = await VehicleModel.findOne({ _id: id, owner });

        if (!vehicle) {
            throw new AppError(404, `No existe el vehículo con id ${id}.`);
        }

        return vehicle;
    }

    async create(owner, data) {
        await this.assertUniquePlate(owner, data.plate);

        return VehicleModel.create({
            plate: data.plate.trim().toUpperCase(),
            type: data.type,
            model: data.model.trim(),
            capacityKg: data.capacityKg,
            status: data.status || "disponible",
            owner
        });
    }

    async update(owner, id, changes) {
        const vehicle = await this.getById(owner, id);

        if (changes.plate !== undefined) {
            await this.assertUniquePlate(owner, changes.plate, vehicle._id);
            vehicle.plate = changes.plate.trim().toUpperCase();
        }

        ["type", "capacityKg", "status"].forEach((field) => {
            if (changes[field] !== undefined) {
                vehicle[field] = changes[field];
            }
        });

        if (changes.model !== undefined) {
            vehicle.model = changes.model.trim();
        }

        await vehicle.save();
        return vehicle;
    }

    async delete(owner, id) {
        const vehicle = await this.getById(owner, id);

        // Los repartidores que usaban este vehículo se quedan sin vehículo asignado
        await CourierModel.updateMany({ owner, vehicle: vehicle._id }, { $set: { vehicle: null } });

        await vehicle.deleteOne();
        return vehicle;
    }

    async assertUniquePlate(owner, plate, excludeId = null) {
        const query = { owner, plate: plate.trim().toUpperCase() };

        if (excludeId) {
            query._id = { $ne: excludeId };
        }

        if (await VehicleModel.exists(query)) {
            throw new AppError(400, `Ya existe un vehículo con placas ${query.plate}.`);
        }
    }
}

module.exports = VehiclesService;

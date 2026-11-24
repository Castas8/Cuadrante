"use strict";

const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./schemaOptions");
const { VEHICLE_TYPES, VEHICLE_STATUSES } = require("../config/constants");

const vehicleSchema = new mongoose.Schema(
    {
        plate: { type: String, required: true, trim: true, uppercase: true, maxlength: 12 },
        type: { type: String, required: true, enum: VEHICLE_TYPES },
        model: { type: String, required: true, trim: true, maxlength: 60 },
        capacityKg: { type: Number, required: true, min: 1, max: 5000 },
        status: { type: String, required: true, enum: VEHICLE_STATUSES, default: "disponible" },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    baseSchemaOptions
);

// Las placas no se repiten dentro de la misma cuenta
vehicleSchema.index({ owner: 1, plate: 1 }, { unique: true });

module.exports = mongoose.model("Vehicle", vehicleSchema);

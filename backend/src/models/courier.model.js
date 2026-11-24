"use strict";

const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./schemaOptions");
const { COURIER_STATUSES } = require("../config/constants");

// Repartidor
const courierSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 80 },
        phone: { type: String, required: true, trim: true, match: /^\d{10}$/ },
        status: { type: String, required: true, enum: COURIER_STATUSES, default: "activo" },
        // RELACIÓN: repartidor -> vehículo (ObjectId + populate)
        vehicle: { type: mongoose.Schema.Types.ObjectId, ref: "Vehicle", default: null },
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    baseSchemaOptions
);

module.exports = mongoose.model("Courier", courierSchema);

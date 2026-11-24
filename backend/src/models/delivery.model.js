"use strict";

const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./schemaOptions");
const { DELIVERY_STATUSES } = require("../config/constants");

// Punto de entrega: la ubicación exacta que se registra con un clic en el mapa
const deliverySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 80 },
        description: { type: String, required: true, trim: true, maxlength: 250 },
        status: { type: String, required: true, enum: DELIVERY_STATUSES, default: "pendiente" },

        // RELACIÓN: entrega -> categoría (ObjectId + populate)
        category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },

        // RELACIÓN: entrega -> zona. NO la elige el usuario:
        // el backend la calcula con $geoIntersects al guardar.
        // A través de la zona se llega al repartidor.
        zone: { type: mongoose.Schema.Types.ObjectId, ref: "Zone", default: null },

        // GeoJSON Point: [longitud, latitud]
        location: {
            type: { type: String, enum: ["Point"], required: true },
            coordinates: { type: [Number], required: true }
        },

        // RELACIÓN: entrega -> usuario que la registró
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    baseSchemaOptions
);

deliverySchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Delivery", deliverySchema);

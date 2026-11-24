"use strict";

const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./schemaOptions");

// Zona de reparto dibujada en el mapa
const zoneSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 60 },
        color: { type: String, required: true, match: /^#[0-9a-f]{6}$/i },

        // RELACIÓN: zona -> repartidor responsable (ObjectId + populate)
        courier: { type: mongoose.Schema.Types.ObjectId, ref: "Courier", default: null },

        // GeoJSON Polygon: [ [ [lng, lat], [lng, lat], ..., [lng, lat] ] ]
        // El primer y el último vértice son iguales (anillo cerrado)
        area: {
            type: { type: String, enum: ["Polygon"], required: true },
            coordinates: { type: [[[Number]]], required: true }
        },

        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    baseSchemaOptions
);

// Índice geoespacial: permite preguntar "¿en qué zona cae este punto?"
// y "¿esta zona se cruza con otra?"
zoneSchema.index({ area: "2dsphere" });
zoneSchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Zone", zoneSchema);

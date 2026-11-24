"use strict";

const mongoose = require("mongoose");
const { baseSchemaOptions } = require("./schemaOptions");

// Categoría de producto que se entrega (Garrafón 20L, Paquete chico, Documentos...)
const categorySchema = new mongoose.Schema(
    {
        name: { type: String, required: true, trim: true, maxlength: 60 },
        description: { type: String, trim: true, maxlength: 200, default: "" },
        // Color del marcador en el mapa
        color: { type: String, required: true, match: /^#[0-9a-f]{6}$/i },
        // Usuario (empresa) dueño del registro
        owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }
    },
    baseSchemaOptions
);

// Una misma cuenta no puede repetir el nombre de categoría
categorySchema.index({ owner: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Category", categorySchema);

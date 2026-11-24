"use strict";

const mongoose = require("mongoose");

// Funciones de validación que comparten todos los validadores

const INVALID_DATA_MESSAGE = "Los datos enviados no son válidos.";

function isPlainObject(value) {
    return value !== null && typeof value === "object" && !Array.isArray(value);
}

function isNonEmptyString(value) {
    return typeof value === "string" && value.trim().length > 0;
}

function isValidEmail(value) {
    return typeof value === "string" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());
}

// Un ObjectId de MongoDB: 24 caracteres hexadecimales
function isObjectId(value) {
    return typeof value === "string" && mongoose.isValidObjectId(value) && /^[a-f\d]{24}$/i.test(value);
}

function isHexColor(value) {
    return typeof value === "string" && /^#[0-9a-f]{6}$/i.test(value);
}

function isValidCoordinate(pair) {
    return Array.isArray(pair)
        && pair.length === 2
        && pair.every((n) => typeof n === "number" && Number.isFinite(n))
        && pair[0] >= -180 && pair[0] <= 180 // longitud
        && pair[1] >= -90 && pair[1] <= 90; // latitud
}

// GeoJSON Point: { type: "Point", coordinates: [longitud, latitud] }
function validatePoint(location, errors, field = "location") {
    if (!isPlainObject(location)) {
        errors.push(`${field} debe ser un objeto GeoJSON.`);
        return;
    }

    if (location.type !== "Point") {
        errors.push(`${field}.type debe ser "Point".`);
    }

    if (!isValidCoordinate(location.coordinates)) {
        errors.push(`${field}.coordinates debe ser [longitud, latitud] con longitud entre -180 y 180 y latitud entre -90 y 90.`);
    }
}

// GeoJSON Polygon: { type: "Polygon", coordinates: [ [ [lng, lat], ... ] ] }
// Un solo anillo exterior con al menos 3 vértices distintos.
function validatePolygon(area, errors, field = "area") {
    if (!isPlainObject(area)) {
        errors.push(`${field} debe ser un objeto GeoJSON.`);
        return;
    }

    if (area.type !== "Polygon") {
        errors.push(`${field}.type debe ser "Polygon".`);
    }

    const rings = area.coordinates;

    if (!Array.isArray(rings) || rings.length !== 1 || !Array.isArray(rings[0])) {
        errors.push(`${field}.coordinates debe tener un solo anillo: [[[lng, lat], ...]].`);
        return;
    }

    const ring = rings[0];

    if (!ring.every(isValidCoordinate)) {
        errors.push(`Cada vértice de ${field} debe ser [longitud, latitud] dentro de rango.`);
        return;
    }

    const distinct = new Set(ring.map((pair) => pair.join(",")));

    if (distinct.size < 3) {
        errors.push(`${field} necesita al menos 3 vértices distintos.`);
    }
}

// Cierra el anillo si hace falta: MongoDB exige que el primer y el último punto sean iguales
function closeRing(ring) {
    const first = ring[0];
    const last = ring[ring.length - 1];

    if (first[0] === last[0] && first[1] === last[1]) {
        return ring;
    }

    return [...ring, [...first]];
}

// Revisa que solo vengan campos permitidos y que nadie intente mandar los protegidos
function checkFields(body, allowedFields, errors) {
    const protectedFields = ["id", "_id", "owner", "createdAt", "updatedAt"];

    Object.keys(body).forEach((field) => {
        if (protectedFields.includes(field)) {
            errors.push(`El campo ${field} no se puede modificar.`);
        } else if (!allowedFields.includes(field)) {
            errors.push(`El campo ${field} no está permitido.`);
        }
    });
}

module.exports = {
    INVALID_DATA_MESSAGE,
    isPlainObject,
    isNonEmptyString,
    isValidEmail,
    isObjectId,
    isHexColor,
    validatePoint,
    validatePolygon,
    closeRing,
    checkFields
};

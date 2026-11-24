"use strict";

const mongoose = require("mongoose");

async function connectDatabase() {
    const uri = process.env.MONGODB_URI;

    if (!uri) {
        throw new Error("Falta la variable MONGODB_URI en el archivo .env");
    }

    await mongoose.connect(uri);
    console.log("Conexión a la base de datos establecida");
}

async function disconnectDatabase() {
    await mongoose.disconnect();
    console.log("Conexión a la base de datos cerrada");
}

module.exports = { connectDatabase, disconnectDatabase };

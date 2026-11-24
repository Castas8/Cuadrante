"use strict";

require("dotenv").config({ quiet: true });

const express = require("express");
const cors = require("cors");

const routerApi = require("./routes");
const {
    notFoundHandler,
    logErrors,
    errorHandler
} = require("./middlewares/error.handler");

const app = express();

// CORS: solo el frontend autorizado puede consumir la API
const allowedOrigins = (process.env.FRONTEND_ORIGINS || "")
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);

app.use(cors({
    origin(origin, callback) {
        // Postman, REST Client y curl no mandan Origin
        if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
            return callback(null, true);
        }

        callback(new Error(`El origen ${origin} no está permitido.`));
    }
}));

app.use(express.json({ limit: "1mb" }));

// Log de cada petición: método, ruta, código y tiempo
app.use((req, res, next) => {
    const start = Date.now();

    res.on("finish", () => {
        console.log(`${req.method} ${req.originalUrl} ${res.statusCode} - ${Date.now() - start}ms`);
    });

    next();
});

// Ruta principal
app.get("/", (req, res) => {
    res.status(200).json({
        name: "Cuadrante API",
        version: "1.0.0",
        description: "Gestión de zonas de reparto y puntos de entrega",
        endpoints: {
            health: "/api/health",
            register: "/api/auth/register",
            login: "/api/auth/login",
            me: "/api/auth/me",
            categories: "/api/categories",
            vehicles: "/api/vehicles",
            couriers: "/api/couriers",
            couriersSummary: "/api/couriers/summary",
            zones: "/api/zones",
            zonesGeoJSON: "/api/zones/geojson",
            deliveries: "/api/deliveries",
            deliveriesGeoJSON: "/api/deliveries/geojson"
        }
    });
});

// Health check
app.get("/api/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        message: "El servidor funciona correctamente.",
        timestamp: new Date().toISOString()
    });
});

// Rutas de la API
routerApi(app);

// Manejo de errores (siempre después de las rutas y en este orden)
app.use(notFoundHandler);
app.use(logErrors);
app.use(errorHandler);

module.exports = app;

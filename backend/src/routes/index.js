"use strict";

const express = require("express");

const { requireAuth } = require("../middlewares/auth.middleware");

const authRouter = require("./auth.router");
const categoriesRouter = require("./categories.router");
const vehiclesRouter = require("./vehicles.router");
const couriersRouter = require("./couriers.router");
const zonesRouter = require("./zones.router");
const deliveriesRouter = require("./deliveries.router");

function routerApi(app) {
    const apiRouter = express.Router();

    app.use("/api", apiRouter);

    // Pública: registro e inicio de sesión
    apiRouter.use("/auth", authRouter);

    // Protegidas: sin token válido responden 401
    apiRouter.use("/categories", requireAuth, categoriesRouter);
    apiRouter.use("/vehicles", requireAuth, vehiclesRouter);
    apiRouter.use("/couriers", requireAuth, couriersRouter);
    apiRouter.use("/zones", requireAuth, zonesRouter);
    apiRouter.use("/deliveries", requireAuth, deliveriesRouter);
}

module.exports = routerApi;

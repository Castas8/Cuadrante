"use strict";

require("dotenv").config({ quiet: true });

const { connectDatabase, disconnectDatabase } = require("../config/database");

const UserModel = require("../models/user.model");
const CategoryModel = require("../models/category.model");
const VehicleModel = require("../models/vehicle.model");
const CourierModel = require("../models/courier.model");
const ZoneModel = require("../models/zone.model");
const DeliveryModel = require("../models/delivery.model");

const CategoriesService = require("../services/categories.service");
const VehiclesService = require("../services/vehicles.service");
const CouriersService = require("../services/couriers.service");
const ZonesService = require("../services/zones.service");
const DeliveriesService = require("../services/deliveries.service");

const data = require("./seed.data");

// El seed usa los mismos services que la API: así los datos de prueba pasan por
// las mismas reglas (zonas sin encimarse, asignación automática de zona, etc.)
const categories = new CategoriesService();
const vehicles = new VehiclesService();
const couriers = new CouriersService();
const zones = new ZonesService();
const deliveries = new DeliveriesService();

async function getDemoUser() {
    let user = await UserModel.findOne({ email: data.demoUser.email });

    if (!user) {
        user = await UserModel.create(data.demoUser);
    }

    return user;
}

async function clearData(owner) {
    await Promise.all([
        DeliveryModel.deleteMany({ owner }),
        ZoneModel.deleteMany({ owner }),
        CourierModel.deleteMany({ owner }),
        VehicleModel.deleteMany({ owner }),
        CategoryModel.deleteMany({ owner })
    ]);
}

async function runSeed() {
    try {
        await connectDatabase();

        // Asegura que existan los índices 2dsphere antes de las consultas geoespaciales
        await Promise.all([ZoneModel.init(), DeliveryModel.init()]);

        const user = await getDemoUser();
        const owner = user.id;

        // Solo se borran los datos del usuario de prueba, nunca los de otras cuentas
        await clearData(owner);

        const categoryIds = {};
        for (const item of data.categories) {
            const created = await categories.create(owner, item);
            categoryIds[item.key] = created.id;
        }

        const vehicleIds = {};
        for (const item of data.vehicles) {
            const { key, ...body } = item;
            const created = await vehicles.create(owner, body);
            vehicleIds[key] = created.id;
        }

        const courierIds = {};
        for (const item of data.couriers) {
            const { key, vehicle, ...body } = item;
            const created = await couriers.create(owner, { ...body, vehicle: vehicle ? vehicleIds[vehicle] : null });
            courierIds[key] = created.id;
        }

        for (const item of data.zones) {
            const { courier, ...body } = item;
            await zones.create(owner, { ...body, courier: courier ? courierIds[courier] : null });
        }

        let withoutZone = 0;
        for (const item of data.deliveries) {
            const { category, ...body } = item;
            const created = await deliveries.create(owner, { ...body, category: categoryIds[category] });

            if (!created.zone) {
                withoutZone += 1;
            }
        }

        console.log(`Usuario de prueba: ${data.demoUser.email} / ${data.demoUser.password}`);
        console.log(`Se insertaron ${data.categories.length} categorías.`);
        console.log(`Se insertaron ${data.vehicles.length} vehículos.`);
        console.log(`Se insertaron ${data.couriers.length} repartidores.`);
        console.log(`Se insertaron ${data.zones.length} zonas.`);
        console.log(`Se insertaron ${data.deliveries.length} entregas (${withoutZone} fuera de toda zona).`);
    } catch (error) {
        console.error("Error al ejecutar el seed:", error.message, error.details || "");
        process.exitCode = 1;
    } finally {
        await disconnectDatabase();
    }
}

runSeed();

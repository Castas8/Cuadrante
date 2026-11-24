"use strict";

const app = require("./app");
const { connectDatabase, disconnectDatabase } = require("./config/database");

const PORT = Number(process.env.PORT || 3000);

async function start() {
    try {
        // Primero la base de datos; si falla, el servidor no arranca
        await connectDatabase();

        const server = app.listen(PORT, () => {
            console.log("==================================");
            console.log("        CUADRANTE API");
            console.log("==================================");
            console.log(`Servidor: http://localhost:${PORT}`);
            console.log(`Health:   http://localhost:${PORT}/api/health`);
            console.log(`Auth:     http://localhost:${PORT}/api/auth`);
            console.log(`Entregas: http://localhost:${PORT}/api/deliveries`);
            console.log(`Zonas:    http://localhost:${PORT}/api/zones`);
            console.log("==================================");
        });

        // Cierre controlado (Ctrl + C o cuando el servidor de hosting detiene el proceso)
        async function shutdown(signal) {
            console.log(`\nSe recibió ${signal}. Cerrando servidor...`);

            server.close(async () => {
                await disconnectDatabase();
                console.log("Servidor cerrado correctamente.");
                process.exit(0);
            });
        }

        process.on("SIGINT", () => shutdown("SIGINT"));
        process.on("SIGTERM", () => shutdown("SIGTERM"));
    } catch (error) {
        console.error("Error al iniciar el servidor:", error.message);
        process.exit(1);
    }
}

start();

"use strict";

// Datos de prueba: una purificadora de agua en León, Gto.
// Coordenadas en orden GeoJSON: [longitud, latitud]

module.exports = {
    demoUser: {
        name: "Purificadora Manantial (demo)",
        email: "demo@cuadrante.mx",
        password: "Cuadrante2026"
    },

    categories: [
        { key: "garrafon", name: "Garrafón 20L", description: "Garrafón de agua purificada", color: "#0ea5e9" },
        { key: "chico", name: "Paquete chico", description: "Hasta 5 kg", color: "#f59e0b" },
        { key: "grande", name: "Paquete grande", description: "Más de 5 kg", color: "#8b5cf6" },
        { key: "documentos", name: "Documentos", description: "Sobres y papelería", color: "#10b981" }
    ],

    vehicles: [
        { key: "moto1", plate: "GTO-123-A", type: "motocicleta", model: "Italika FT150", capacityKg: 150, status: "disponible" },
        { key: "np300", plate: "GTO-456-B", type: "camioneta", model: "Nissan NP300", capacityKg: 1200, status: "disponible" },
        { key: "tornado", plate: "GTO-789-C", type: "camioneta", model: "Chevrolet Tornado", capacityKg: 700, status: "disponible" },
        { key: "moto2", plate: "GTO-321-D", type: "motocicleta", model: "Honda Cargo 150", capacityKg: 120, status: "en_mantenimiento" }
    ],

    couriers: [
        { key: "luis", name: "Luis Mendoza", phone: "4771234567", status: "activo", vehicle: "moto1" },
        { key: "ana", name: "Ana García", phone: "4772345678", status: "activo", vehicle: "np300" },
        { key: "pedro", name: "Pedro Sánchez", phone: "4773456789", status: "activo", vehicle: "tornado" },
        { key: "sofia", name: "Sofía Ruiz", phone: "4774567890", status: "inactivo", vehicle: null }
    ],

    zones: [
        {
            name: "Zona Centro",
            color: "#ef4444",
            courier: "luis",
            area: {
                type: "Polygon",
                coordinates: [[
                    [-101.6960, 21.1150], [-101.6830, 21.1135], [-101.6700, 21.1150],
                    [-101.6700, 21.1340], [-101.6960, 21.1340], [-101.6960, 21.1150]
                ]]
            }
        },
        {
            name: "Zona Norte",
            color: "#2563eb",
            courier: "ana",
            area: {
                type: "Polygon",
                coordinates: [[
                    [-101.7000, 21.1400], [-101.6600, 21.1400], [-101.6550, 21.1550],
                    [-101.6600, 21.1700], [-101.7000, 21.1700], [-101.7000, 21.1400]
                ]]
            }
        },
        {
            name: "Zona Sur",
            color: "#16a34a",
            courier: "pedro",
            area: {
                type: "Polygon",
                coordinates: [[
                    [-101.6900, 21.0850], [-101.6500, 21.0850], [-101.6500, 21.1100],
                    [-101.6700, 21.1110], [-101.6900, 21.1100], [-101.6900, 21.0850]
                ]]
            }
        }
    ],

    deliveries: [
        // Zona Centro
        { name: "Martha López", description: "2 garrafones, casa azul junto a la farmacia", category: "garrafon", status: "pendiente", location: { type: "Point", coordinates: [-101.6826, 21.1222] } },
        { name: "Papelería El Estudiante", description: "Sobre con facturas del mes", category: "documentos", status: "entregado", location: { type: "Point", coordinates: [-101.6795, 21.1197] } },
        { name: "Café La Parroquia", description: "4 garrafones, entrada por la calle lateral", category: "garrafon", status: "en_ruta", location: { type: "Point", coordinates: [-101.6855, 21.1260] } },
        { name: "Jorge Ramírez", description: "Paquete de filtros de repuesto", category: "chico", status: "pendiente", location: { type: "Point", coordinates: [-101.6740, 21.1180] } },
        { name: "Clínica Dental Sonrisa", description: "Caja con 2 dispensadores", category: "grande", status: "entregado", location: { type: "Point", coordinates: [-101.6900, 21.1300] } },

        // Zona Norte
        { name: "Ana Torres", description: "1 garrafón, departamento 3B", category: "garrafon", status: "pendiente", location: { type: "Point", coordinates: [-101.6880, 21.1600] } },
        { name: "Gimnasio Fuerza Norte", description: "Despachador de agua para recepción", category: "grande", status: "en_ruta", location: { type: "Point", coordinates: [-101.6750, 21.1520] } },
        { name: "Luis Hernández", description: "Kit de limpieza para garrafón", category: "chico", status: "entregado", location: { type: "Point", coordinates: [-101.6950, 21.1450] } },
        { name: "Oficinas Grupo Bajío", description: "Contrato de servicio mensual", category: "documentos", status: "pendiente", location: { type: "Point", coordinates: [-101.6700, 21.1650] } },

        // Zona Sur
        { name: "Tortillería La Esperanza", description: "6 garrafones, pago contra entrega", category: "garrafon", status: "pendiente", location: { type: "Point", coordinates: [-101.6700, 21.0950] } },
        { name: "Rosa Medina", description: "Paquete de vasos desechables", category: "chico", status: "entregado", location: { type: "Point", coordinates: [-101.6800, 21.1000] } },
        { name: "Taller Mecánico Hilamas", description: "Enfriador de agua", category: "grande", status: "cancelado", location: { type: "Point", coordinates: [-101.6600, 21.0900] } },

        // Fuera de todas las zonas (quedan "sin zona" para mostrar la regla)
        { name: "Fraccionamiento El Molino", description: "Pedido nuevo fuera de cobertura", category: "chico", status: "pendiente", location: { type: "Point", coordinates: [-101.7300, 21.1250] } },
        { name: "Plaza Outlet Mulza", description: "Documentos para firma de contrato", category: "documentos", status: "pendiente", location: { type: "Point", coordinates: [-101.6300, 21.1050] } }
    ]
};

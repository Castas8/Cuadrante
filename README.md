# Cuadrante

**Cada pedido en su zona, cada zona con su repartidor.**

Aplicación web para gestionar zonas de reparto y puntos de entrega sobre un mapa.
El encargado dibuja las zonas, asigna un repartidor a cada una y registra las entregas
con un clic en el mapa: el sistema detecta en qué zona cae cada entrega y a qué repartidor le toca.

## Problemática

Las empresas de reparto pequeñas (purificadoras, paqueterías, farmacias) suelen asignar los pedidos "a ojo":
no saben con precisión qué repartidor cubre qué colonia, las rutas se cruzan y no hay control de cuántas
entregas trae cada quien. Cuadrante convierte el mapa de la ciudad en la herramienta de asignación.

## Tecnologías

| Capa | Tecnología |
|---|---|
| Frontend | React 19 + Vite, React Router, Leaflet, React Leaflet, Leaflet-Geoman |
| Backend | Node.js + Express 5, Mongoose |
| Base de datos | MongoDB Atlas (GeoJSON Point y Polygon, índices 2dsphere) |
| Autenticación | bcrypt (contraseñas) + JWT (sesión) |

## Estructura

```
cuadrante/
├── backend/            API REST
│   ├── src/
│   │   ├── config/        conexión a MongoDB y valores permitidos
│   │   ├── models/        schemas de Mongoose y relaciones
│   │   ├── routes/        endpoints
│   │   ├── services/      lógica de negocio y consultas geoespaciales
│   │   ├── middlewares/   autenticación, validaciones y manejo de errores
│   │   ├── utils/         utilidades compartidas
│   │   └── data/          datos de prueba (seed)
│   └── requests/       pruebas de la API (REST Client)
└── frontend/           aplicación web
    └── src/
        ├── api/           cliente HTTP y funciones por endpoint
        ├── context/       sesión y avisos
        ├── components/    componentes (mapa, formularios, tablas)
        ├── pages/         vistas: login, registro, mapa, repartidores, categorías
        └── utils/         conversión de coordenadas y etiquetas
```

## Ejecutar localmente

**Backend**
```bash
cd backend
cp .env.example .env      # llena MONGODB_URI y JWT_SECRET
npm install
npm run seed              # crea el usuario de prueba con datos de León
npm run dev               # http://localhost:3000
```

**Frontend** (en otra terminal)
```bash
cd frontend
cp .env.example .env      # VITE_API_URL=http://localhost:3000/api
npm install
npm run dev               # http://localhost:5173
```

## Usuario de prueba

`demo@cuadrante.mx` / `Cuadrante2026` — Purificadora Manantial (demo), con 4 categorías,
4 vehículos, 4 repartidores, 3 zonas y 14 entregas en León, Gto.

## Funcionalidades

- Registro e inicio de sesión (contraseñas cifradas con bcrypt, sesión con JWT; sin sesión la API responde 401).
- Mapa con las zonas (Polygon) y las entregas (Point) de la cuenta.
- **Nueva entrega con clic en el mapa:** la zona y el repartidor se asignan solos (`$geoIntersects`).
- Editar, cambiar de estado y eliminar entregas desde su popup.
- **Dibujar zonas** con el mouse, editar su forma arrastrando vértices y eliminarlas.
  - Una zona no puede encimarse con otra (`$geoIntersects`).
  - Al dibujar, mover o borrar una zona, las entregas se reasignan (`$geoWithin`).
- Tabla de entregas que se actualiza al instante; clic en una fila para verla en el mapa.
- Búsqueda (parcial y sin acentos) y filtros por categoría, estado y zona, resueltos en el backend.
- Vista de repartidores: zonas y entregas por estado de cada uno, CRUD de repartidores y vehículos.
- Vista de categorías: CRUD con color de marcador.

## Endpoints

Todas las rutas, excepto `/api/auth/register` y `/api/auth/login`, requieren
`Authorization: Bearer <token>`.

| Recurso | Endpoints |
|---|---|
| Auth | `POST /api/auth/register` · `POST /api/auth/login` · `GET /api/auth/me` |
| Categorías | `GET/POST /api/categories` · `GET/PATCH/DELETE /api/categories/:id` |
| Vehículos | `GET/POST /api/vehicles` · `GET/PATCH/DELETE /api/vehicles/:id` |
| Repartidores | `GET/POST /api/couriers` · `GET /api/couriers/summary` · `GET/PATCH/DELETE /api/couriers/:id` |
| Zonas | `GET/POST /api/zones` · `GET /api/zones/geojson` · `GET/PATCH/DELETE /api/zones/:id` |
| Entregas | `GET/POST /api/deliveries` · `GET /api/deliveries/geojson` · `GET/PATCH/DELETE /api/deliveries/:id` |

Filtros de entregas: `?search=&category=&status=&zone=` (`zone=none` = entregas fuera de toda zona).

## Despliegue

- **Base de datos:** MongoDB Atlas.
- **Backend:** Railway (`npm start`). Variables: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `FRONTEND_ORIGINS`.
- **Frontend:** Vercel (carpeta `frontend`). Variable: `VITE_API_URL`.

| | URL |
|---|---|
| Aplicación | _pendiente_ |
| API | _pendiente_ |

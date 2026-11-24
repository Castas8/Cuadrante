// Una función por endpoint del backend, agrupadas por recurso.
import { apiRequest } from "./client";

// Crea las 5 funciones de un CRUD a partir de su ruta base
function crud(base) {
    return {
        list: (params) => apiRequest(base, { params }),
        get: (id) => apiRequest(`${base}/${id}`),
        create: (body) => apiRequest(base, { method: "POST", body }),
        update: (id, body) => apiRequest(`${base}/${id}`, { method: "PATCH", body }),
        remove: (id) => apiRequest(`${base}/${id}`, { method: "DELETE" })
    };
}

export const authApi = {
    login: (body) => apiRequest("/auth/login", { method: "POST", body }),
    register: (body) => apiRequest("/auth/register", { method: "POST", body }),
    me: () => apiRequest("/auth/me")
};

export const categoriesApi = crud("/categories");
export const vehiclesApi = crud("/vehicles");
export const couriersApi = {
    ...crud("/couriers"),
    summary: () => apiRequest("/couriers/summary")
};
export const zonesApi = crud("/zones");
export const deliveriesApi = crud("/deliveries");

// Cliente HTTP: todas las peticiones al backend pasan por aquí.
// Agrega el token de sesión, convierte la respuesta a JSON y
// transforma los errores en un ApiError con su código y detalles.

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api";
const TOKEN_KEY = "cuadrante.token";

export class ApiError extends Error {
    constructor(status, message, details = null) {
        super(message);
        this.status = status;
        this.details = details;
    }
}

export const tokenStorage = {
    get: () => localStorage.getItem(TOKEN_KEY),
    set: (token) => localStorage.setItem(TOKEN_KEY, token),
    clear: () => localStorage.removeItem(TOKEN_KEY)
};

// Quita los filtros vacíos o "all" y arma ?search=...&status=...
function toQueryString(params = {}) {
    const query = new URLSearchParams();

    Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== "" && value !== "all") {
            query.set(key, value);
        }
    });

    const text = query.toString();
    return text ? `?${text}` : "";
}

export async function apiRequest(path, { method = "GET", body, params } = {}) {
    const headers = { "Content-Type": "application/json" };
    const token = tokenStorage.get();

    if (token) {
        headers.Authorization = `Bearer ${token}`;
    }

    let response;

    try {
        response = await fetch(`${API_URL}${path}${toQueryString(params)}`, {
            method,
            headers,
            body: body === undefined ? undefined : JSON.stringify(body)
        });
    } catch {
        throw new ApiError(0, "No se pudo conectar con el servidor. Revisa tu conexión.");
    }

    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
        // Token vencido o inválido: avisamos a la app para cerrar la sesión
        if (response.status === 401 && token) {
            window.dispatchEvent(new CustomEvent("auth:expired"));
        }

        throw new ApiError(response.status, data.message || "Ocurrió un error.", data.details || null);
    }

    return data;
}

// Estado global de la sesión: quién está logueado y las funciones
// login, register y logout. Cualquier componente lo lee con useAuth().
import { createContext, useCallback, useContext, useEffect, useState } from "react";

import { authApi } from "../api/endpoints";
import { tokenStorage } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    // true mientras revisamos si el token guardado sigue siendo válido
    const [checking, setChecking] = useState(Boolean(tokenStorage.get()));
    const [sessionMessage, setSessionMessage] = useState("");

    const startSession = useCallback(({ user: sessionUser, token }) => {
        tokenStorage.set(token);
        setUser(sessionUser);
        setSessionMessage("");
    }, []);

    const logout = useCallback((message = "") => {
        tokenStorage.clear();
        setUser(null);
        setSessionMessage(message);
    }, []);

    // Al abrir la app: si hay token guardado, preguntamos al backend quién es
    useEffect(() => {
        if (!tokenStorage.get()) {
            return;
        }

        authApi.me()
            .then((response) => setUser(response.data))
            .catch(() => tokenStorage.clear())
            .finally(() => setChecking(false));
    }, []);

    // Si cualquier petición responde 401, cerramos la sesión
    useEffect(() => {
        const onExpired = () => logout("Tu sesión expiró. Inicia sesión de nuevo.");
        window.addEventListener("auth:expired", onExpired);
        return () => window.removeEventListener("auth:expired", onExpired);
    }, [logout]);

    const login = async (credentials) => {
        const response = await authApi.login(credentials);
        startSession(response.data);
    };

    const register = async (data) => {
        const response = await authApi.register(data);
        startSession(response.data);
    };

    return (
        <AuthContext.Provider value={{ user, checking, sessionMessage, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    return useContext(AuthContext);
}

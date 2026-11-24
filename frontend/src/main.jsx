import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "leaflet/dist/leaflet.css";
import "@geoman-io/leaflet-geoman-free/dist/leaflet-geoman.css";
import "./styles/index.css";

import App from "./App";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "./context/ToastContext";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <ToastProvider>
            <AuthProvider>
                <App />
            </AuthProvider>
        </ToastProvider>
    </StrictMode>
);

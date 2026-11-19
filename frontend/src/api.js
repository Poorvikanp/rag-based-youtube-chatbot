// Centralized backend URL configuration.
// Set VITE_API_BASE_URL in the frontend hosting environment for production.
const configuredApiUrl = import.meta.env.VITE_API_BASE_URL?.trim();

export const API_BASE_URL = (configuredApiUrl || "http://localhost:8000").replace(/\/+$/, "");

// Base URL for the Flask backend.
// Defaults to localhost for local dev; override by setting VITE_API_URL
// in a .env file (see .env.example) when deploying frontend/backend separately.
export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

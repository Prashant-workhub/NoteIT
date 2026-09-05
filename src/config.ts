/**
 * Centralized API configuration.
 * Uses an explicitly configured API origin.  When no origin is configured in
 * production, requests use same-origin /api routes so the React app can still
 * render while a backend URL is being configured.
 */

const isProd = import.meta.env.PROD;
const apiEnvUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;

if (isProd && !apiEnvUrl) {
  console.warn('VITE_API_URL is not configured; API requests will use this deployment\'s /api routes.');
}

export const API_BASE_URL = apiEnvUrl?.replace(/\/$/, '') ?? (isProd ? '' : 'http://localhost:3003');

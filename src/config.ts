/**
 * Centralized API configuration.
 * Uses an explicitly configured API origin.  When no origin is configured in
 * production, requests use same-origin /api routes so the React app can still
 * render while a backend URL is being configured.
 */

import { Capacitor } from '@capacitor/core';

const isProd = import.meta.env.PROD;
const apiEnvUrl = import.meta.env.VITE_API_URL || import.meta.env.VITE_BACKEND_URL;

if (isProd && !apiEnvUrl) {
  console.warn("VITE_API_URL is not configured; API requests will use this deployment's /api routes.");
}

let defaultApiUrl = 'http://localhost:3002';
if (Capacitor.isNativePlatform()) {
  // If running in Android emulator, use 10.0.2.2 to point to host machine's localhost
  defaultApiUrl = Capacitor.getPlatform() === 'android' ? 'http://10.0.2.2:3002' : 'http://localhost:3002';
}

export const API_BASE_URL = apiEnvUrl?.replace(/\/$/, '') ?? (Capacitor.isNativePlatform() ? defaultApiUrl : (isProd ? '' : defaultApiUrl));

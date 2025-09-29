/**
 * Configuración de URL del backend con override forzado para producción
 */

// TEMPORAL: Forzar uso de backend de producción
const FORCE_PRODUCTION = true;

// Detectar entorno automáticamente - versión mejorada
const isProduction = FORCE_PRODUCTION || 
    process.env.NODE_ENV === 'production' ||  // Variable de entorno de Next.js
    process.env.VERCEL_ENV === 'production' || // En Vercel
    (typeof window !== 'undefined' && (
        window.location.hostname === 'routeragent.onrender.com' ||
        window.location.hostname === 'routeragent.vercel.app' ||
        window.location.hostname.includes('vercel.app') ||
        window.location.hostname.includes('onrender.com') ||
        window.location.hostname !== 'localhost'
    ));

export const BACKEND_URL = isProduction
    ? 'https://routeragent.onrender.com'  // Producción
    : 'http://localhost:3003';             // Desarrollo local

console.log(`🔧 Backend URL Config:`, {
    FORCE_PRODUCTION,
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    hostname: typeof window !== 'undefined' ? window.location.hostname : 'server-side',
    isProduction,
    BACKEND_URL
});
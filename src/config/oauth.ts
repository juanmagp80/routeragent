// Configuración de URLs para OAuth según el entorno
export const getBaseUrl = () => {
    // Si estamos en el navegador (client-side)
    if (typeof window !== 'undefined') {
        return window.location.origin;
    }

    // Si estamos en desarrollo local
    if (process.env.NODE_ENV === 'development') {
        return 'http://localhost:3000';
    }

    // En producción, usa la URL de Vercel o la configurada
    return process.env.NEXTAUTH_URL || process.env.NEXT_PUBLIC_APP_URL || 'https://your-app-domain.com';
};

export const getOAuthRedirectUrl = (path: string = '/auth/callback') => {
    const baseUrl = getBaseUrl();
    return `${baseUrl}${path}`;
};

export const OAUTH_CONFIG = {
    redirectTo: (nextPath: string = '/admin') => `${getOAuthRedirectUrl()}?next=${encodeURIComponent(nextPath)}`,
    queryParams: {
        access_type: 'offline',
        prompt: 'consent',
    }
} as const;
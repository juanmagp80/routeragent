import { authenticateUser } from '@/middleware/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Rutas protegidas que requieren autenticación
const protectedRoutes = [
    '/admin',
    '/admin/',
    '/admin/keys',
    '/admin/analytics',
    '/admin/users',
    '/admin/billing',
    '/admin/notifications',
    '/admin/settings',
    '/admin/help'
];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Verificar si la ruta es protegida
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname === route || pathname.startsWith(route)
    );

    // Permitir acceso a rutas públicas
    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    // Verificar autenticación para rutas protegidas
    try {
        const user = await authenticateUser(request);

        if (!user) {
            // Redirigir a login si no está autenticado
            const loginUrl = new URL('/login', request.url);
            loginUrl.searchParams.set('redirect', pathname);
            return NextResponse.redirect(loginUrl);
        }

        // Usuario autenticado, permitir acceso
        return NextResponse.next();

    } catch (error) {
        console.error('Authentication error:', error);
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }
}

// Configurar matcher para aplicar el middleware solo a ciertas rutas
export const config = {
    matcher: [
        /*
         * Coincidir con:
         * - /admin/:path* (todas las rutas bajo /admin)
         */
        '/admin/:path*',
    ],
};
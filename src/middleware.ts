import { authenticateUser } from '@/middleware/auth';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// MIDDLEWARE TEMPORALMENTE DESACTIVADO PARA DEBUGGING
// Rutas protegidas que requieren autenticación
const protectedRoutes: string[] = [
    // DESACTIVADO TEMPORALMENTE - TODO: Reactivar una vez que funcione el dashboard
    // '/admin',
    // '/admin/',
    // '/admin/keys',
    // '/admin/analytics',
    // '/admin/users',
    // '/admin/billing',
    // '/admin/notifications',
    // '/admin/settings',
    // '/admin/help',
    // '/user', // Comentado temporalmente - manejo client-side con Supabase
    // '/dashboard'
];

// Rutas que solo usuarios no autenticados pueden acceder
const authRoutes = ['/login', '/register'];

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Verificar si la ruta es protegida
    const isProtectedRoute = protectedRoutes.some(route =>
        pathname === route || pathname.startsWith(route)
    );
    
    // Verificar si es una ruta de autenticación
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

    // Verificar autenticación
    let user = null;
    try {
        user = await authenticateUser(request);
    } catch (error) {
        console.error('Authentication error:', error);
    }

    // Si es una ruta de auth y el usuario ya está autenticado, redirigir al dashboard
    if (isAuthRoute && user) {
        return NextResponse.redirect(new URL('/admin', request.url));
    }

    // Permitir acceso a rutas públicas y de auth
    if (!isProtectedRoute) {
        return NextResponse.next();
    }

    // Verificar autenticación para rutas protegidas
    if (!user) {
        // Redirigir a login si no está autenticado
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirect', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // Usuario autenticado, permitir acceso
    return NextResponse.next();
}

// Configurar matcher para aplicar el middleware solo a ciertas rutas
export const config = {
    matcher: [
        /*
         * Coincidir con:
         * - /admin/:path* (todas las rutas bajo /admin)
         * - /dashboard/:path* (todas las rutas bajo /dashboard)
         * - /login (página de login)
         * - /register (página de registro)
         * 
         * Nota: /user/:path* comentado temporalmente para usar protección client-side con Supabase
         */
        '/admin/:path*',
        // '/user/:path*', // Comentado - manejo client-side
        '/dashboard/:path*',
        '/login',
        '/register'
    ],
};
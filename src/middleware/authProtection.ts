// Middleware de verificación de autenticación para rutas protegidas

import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-minimum-32-characters-long';

// Rutas que requieren autenticación
const protectedRoutes = ['/user', '/admin', '/dashboard'];

// Rutas que solo usuarios no autenticados pueden acceder
const authRoutes = ['/login', '/register'];

export function authMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Obtener token de las cookies o headers
  const token = request.cookies.get('authToken')?.value || 
                request.headers.get('Authorization')?.replace('Bearer ', '');

  // Verificar si el usuario está autenticado
  let isAuthenticated = false;
  let user = null;

  if (token) {
    try {
      user = jwt.verify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch (error) {
      // Token inválido o expirado
      isAuthenticated = false;
    }
  }

  // Verificar si la ruta está protegida
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  // Si es una ruta protegida y el usuario no está autenticado
  if (isProtectedRoute && !isAuthenticated) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Si es una ruta de auth y el usuario ya está autenticado
  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/admin', request.url));
  }

  // Agregar información del usuario a los headers para usar en los componentes
  const response = NextResponse.next();
  
  if (isAuthenticated && user) {
    response.headers.set('x-user-data', JSON.stringify(user));
  }

  return response;
}

// Configuración del matcher para definir qué rutas usar el middleware
export const config = {
  matcher: [
    // Rutas protegidas
    '/user/:path*',
    '/admin/:path*',
    '/dashboard/:path*',
    // Rutas de autenticación
    '/login',
    '/register',
  ]
};

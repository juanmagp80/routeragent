// Middleware de autenticación JWT para AgentRouter

import jwt from 'jsonwebtoken';
import { NextRequest, NextResponse } from 'next/server';

// Clave secreta para JWT (en producción, usar variable de entorno)
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-minimum-32-characters-long';

// Extender el tipo NextRequest para incluir user
declare module 'next/server' {
    interface NextRequest {
        user?: {
            userId: string;
            email: string;
            plan: string;
        };
    }
}

export async function authJwt(req: NextRequest) {
    try {
        // Obtener token del header de autorización
        const authHeader = req.headers.get('authorization');

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return NextResponse.json(
                {
                    error: 'Missing or invalid Authorization header. Use: Authorization: Bearer your-jwt-token',
                    success: false
                },
                { status: 401 }
            );
        }

        const token = authHeader.substring(7); // Remover "Bearer "

        // Verificar token JWT
        const decoded: any = jwt.verify(token, JWT_SECRET);

        // En una implementación real, aquí se verificaría el usuario en la base de datos
        // Por ahora, solo verificamos que el token sea válido

        // Adjuntar información del usuario al request
        req.user = {
            userId: decoded.userId,
            email: decoded.email,
            plan: decoded.plan
        };

        // Continuar con la solicitud
        return null; // Indicar que la autenticación fue exitosa

    } catch (error) {
        console.error('JWT authentication error:', error);

        if (error instanceof jwt.JsonWebTokenError) {
            return NextResponse.json(
                {
                    error: 'Invalid or expired token',
                    success: false
                },
                { status: 401 }
            );
        }

        return NextResponse.json(
            {
                error: 'Authentication failed',
                success: false
            },
            { status: 500 }
        );
    }
}

// Middleware para verificar permisos de administrador
export async function requireAdmin(req: NextRequest) {
    // Primero verificar autenticación
    const authResult = await authJwt(req);
    if (authResult) {
        return authResult; // Retornar error de autenticación si existe
    }

    // Verificar que el usuario tenga rol de administrador
    // En una implementación real, esto verificaría los roles del usuario
    if (!req.user || req.user.email !== 'admin@example.com') {
        return NextResponse.json(
            {
                error: 'Admin access required',
                success: false
            },
            { status: 403 }
        );
    }

    // Continuar con la solicitud
    return null; // Indicar que la verificación fue exitosa
}

// Middleware para verificar permisos de usuario
export async function requireUser(req: NextRequest) {
    // Primero verificar autenticación
    const authResult = await authJwt(req);
    if (authResult) {
        return authResult; // Retornar error de autenticación si existe
    }

    // Verificar que el usuario exista
    if (!req.user) {
        return NextResponse.json(
            {
                error: 'User access required',
                success: false
            },
            { status: 403 }
        );
    }

    // Continuar con la solicitud
    return null; // Indicar que la verificación fue exitosa
}
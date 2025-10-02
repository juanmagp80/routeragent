import { createClient } from '@supabase/supabase-js';
import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3003';

export async function GET(request: NextRequest) {
    try {
        // Para SSR, necesitamos usar una estrategia diferente para manejar la sesión
        // Vamos a usar el cliente directamente sin manejo de cookies en el servidor
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        // En lugar de usar la sesión del cliente, necesitamos extraer el token de autorización
        // del encabezado de la solicitud si se proporciona, o manejarlo de otra manera
        const authHeader = request.headers.get('Authorization');
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            // Si no hay token de autorización, intentamos obtenerlo de la sesión de Supabase
            // pero en SSR esto es más complejo, así que dejamos que el backend maneje la autenticación
        }

        // Hacer request al backend, pasando cualquier token de autorización que haya
        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        const response = await fetch(`${BACKEND_URL}/v1/api-keys`, {
            method: 'GET',
            headers: headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in /api/v1/api-keys GET:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const authHeader = request.headers.get('Authorization');
        const body = await request.json();

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        // Hacer request al backend
        const response = await fetch(`${BACKEND_URL}/v1/api-keys`, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(body),
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in /api/v1/api-keys POST:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}

export async function DELETE(request: NextRequest) {
    try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
        const supabase = createClient(supabaseUrl, supabaseKey);

        const authHeader = request.headers.get('Authorization');

        // Extraer el keyId de la URL
        const url = new URL(request.url);
        const pathParts = url.pathname.split('/');
        const keyId = pathParts[pathParts.length - 1];

        if (!keyId) {
            return NextResponse.json(
                { error: 'Key ID is required' },
                { status: 400 }
            );
        }

        const headers: Record<string, string> = {
            'Content-Type': 'application/json',
        };

        if (authHeader) {
            headers['Authorization'] = authHeader;
        }

        // Hacer request al backend
        const response = await fetch(`${BACKEND_URL}/v1/api-keys/${keyId}`, {
            method: 'DELETE',
            headers: headers,
        });

        const data = await response.json();

        if (!response.ok) {
            return NextResponse.json(data, { status: response.status });
        }

        return NextResponse.json(data);
    } catch (error) {
        console.error('Error in /api/v1/api-keys DELETE:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}
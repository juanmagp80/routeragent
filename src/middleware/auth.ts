import { jwtVerify } from "jose";
import { NextRequest } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Clave secreta para firmar JWT (en producción, usar variable de entorno)
const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-super-secret-jwt-key-minimum-32-characters-long"
);

// Cliente Supabase para verificación de sesiones
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function verifyToken(token: string) {
    try {
        const verified = await jwtVerify(token, SECRET_KEY);
        return verified.payload;
    } catch (error) {
        console.error("Token verification failed:", error);
        return null;
    }
}
export async function authenticateUser(request: NextRequest) {
    console.log('🔍 Middleware: Verificando autenticación...');
    
    // Primero intentar con Supabase Auth token
    const supabaseToken = request.cookies.get('sb-jmfegokyvaflwegtyaun-auth-token')?.value;
    if (supabaseToken) {
        try {
            console.log('🔍 Middleware: Token de Supabase encontrado');
            // Verificar el token con Supabase
            const { data: { user }, error } = await supabase.auth.getUser(supabaseToken);
            if (user && !error) {
                console.log('✅ Middleware: Usuario autenticado con Supabase:', user.email);
                return {
                    id: user.id,
                    email: user.email,
                    supabaseUser: true
                };
            } else {
                console.log('❌ Middleware: Token de Supabase inválido:', error?.message);
            }
        } catch (error) {
            console.log('❌ Middleware: Error verificando token de Supabase:', error);
        }
    }

    // Fallback: Intentar obtener token JWT tradicional
    let token = null;
    
    // 1. Header Authorization
    const authHeader = request.headers.get("authorization");
    if (authHeader && authHeader.startsWith("Bearer ")) {
        token = authHeader.substring(7);
    }
    
    // 2. Cookie authToken
    if (!token) {
        token = request.cookies.get("authToken")?.value;
    }
    
    // 3. Header X-Auth-Token (para requests desde el frontend)
    if (!token) {
        token = request.headers.get("x-auth-token");
    }

    if (!token) {
        console.log('❌ Middleware: No se encontró token de autenticación');
        return null;
    }

    console.log('🔍 Middleware: Verificando token JWT tradicional');
    const result = await verifyToken(token);
    if (result) {
        console.log('✅ Middleware: Usuario autenticado con JWT');
    } else {
        console.log('❌ Middleware: Token JWT inválido');
    }
    return result;
}

export function createToken(payload: any) {
    // En una implementación real, aquí se crearía un JWT con jose
    // Por ahora, retornamos un token simulado
    return "simulated-jwt-token";
}
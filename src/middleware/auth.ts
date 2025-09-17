import { jwtVerify } from "jose";
import { NextRequest } from "next/server";

// Clave secreta para firmar JWT (en producción, usar variable de entorno)
const SECRET_KEY = new TextEncoder().encode(
    process.env.JWT_SECRET || "your-super-secret-jwt-key-minimum-32-characters-long"
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
    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return null;
    }

    const token = authHeader.substring(7); // Remove "Bearer "
    return await verifyToken(token);
}

export function createToken(payload: any) {
    // En una implementación real, aquí se crearía un JWT con jose
    // Por ahora, retornamos un token simulado
    return "simulated-jwt-token";
}
import { NextFunction, Request, Response } from 'express';
import { jwtVerify } from 'jose';

// Usamos la extensión de Request definida en authJWT.ts

export const authenticateJwt = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({ error: 'Missing or invalid Authorization header', success: false });
        }
        const token = authHeader.substring(7);

        // Valida el JWT con la clave secreta de Supabase
        const secret = process.env.JWT_SECRET;
        if (!secret) {
            return res.status(500).json({ error: 'JWT secret not configured', success: false });
        }

        const { payload } = await jwtVerify(token, new TextEncoder().encode(secret));
        req.user = {
            id: (payload.sub as string) || '',
            email: (payload.email as string) || '',
            ...payload
        };
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token', success: false });
    }
};

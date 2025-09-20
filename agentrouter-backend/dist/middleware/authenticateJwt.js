"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJwt = void 0;
const jose_1 = require("jose");
const authenticateJwt = async (req, res, next) => {
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
        const { payload } = await (0, jose_1.jwtVerify)(token, new TextEncoder().encode(secret));
        req.user = {
            id: payload.sub || '',
            email: payload.email || '',
            ...payload
        };
        next();
    }
    catch (error) {
        return res.status(401).json({ error: 'Invalid or expired token', success: false });
    }
};
exports.authenticateJwt = authenticateJwt;

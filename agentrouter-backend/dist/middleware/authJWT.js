"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticateJWT = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const authenticateJWT = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Missing or invalid Authorization header. Use: Authorization: Bearer <jwt_token>',
                success: false
            });
        }
        const token = authHeader.substring(7); // Remover "Bearer "
        // Verificar el JWT usando el secret de Supabase
        const supabaseJwtSecret = process.env.SUPABASE_JWT_SECRET;
        if (!supabaseJwtSecret) {
            console.error('SUPABASE_JWT_SECRET not set');
            return res.status(500).json({
                error: 'Authentication configuration error',
                success: false
            });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, supabaseJwtSecret);
            // Verificar que el token tiene la información necesaria
            if (!decoded.sub || !decoded.email) {
                return res.status(401).json({
                    error: 'Invalid token payload',
                    success: false
                });
            }
            // Agregar información del usuario al request
            req.user = {
                id: decoded.sub,
                email: decoded.email,
                role: decoded.role || 'user'
            };
            next();
        }
        catch (jwtError) {
            console.error('JWT verification failed:', jwtError);
            return res.status(401).json({
                error: 'Invalid or expired token',
                success: false
            });
        }
    }
    catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(500).json({
            error: 'Authentication error',
            success: false
        });
    }
};
exports.authenticateJWT = authenticateJWT;

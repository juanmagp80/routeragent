import { NextFunction, Response } from 'express';
import { supabase } from '../config/database';
import { AuthenticatedRequest } from '../types/request';

export const authenticateSupabase = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Missing or invalid Authorization header. Use: Authorization: Bearer <access_token>',
                success: false
            });
        }

        const token = authHeader.substring(7); // Remover "Bearer "

        try {
            // Verificar el token usando Supabase
            const { data: { user }, error } = await supabase.auth.getUser(token);

            if (error || !user) {
                console.error('Supabase auth error:', error);
                return res.status(401).json({
                    error: 'Invalid or expired token',
                    success: false
                });
            }

            // Agregar información del usuario al request
            req.user = {
                id: user.id,
                email: user.email || '',
                role: user.user_metadata?.role || 'user'
            };

            console.log(`✅ Authenticated user: ${user.email} (${user.id})`);
            next();

        } catch (supabaseError) {
            console.error('Supabase verification failed:', supabaseError);
            return res.status(401).json({
                error: 'Authentication failed',
                success: false
            });
        }

    } catch (error) {
        console.error('Authentication middleware error:', error);
        return res.status(500).json({
            error: 'Authentication error',
            success: false
        });
    }
};
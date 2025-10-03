import { NextFunction, Request, Response } from 'express';
import { supabase } from '../config/database';
import { ApiKey } from '../models/ApiKey';
import { ApiKeyService } from '../services/apiKeyService';

// Extender el tipo Request para incluir apiKey
declare global {
    namespace Express {
        interface Request {
            apiKey?: ApiKey;
        }
    }
}

const apiKeyService = new ApiKeyService();

export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction) => {
    try {
        // Obtener API key del header Authorization
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Missing or invalid Authorization header. Use: Authorization: Bearer ar_your_api_key',
                success: false
            });
        }

        const apiKey = authHeader.substring(7); // Remover "Bearer "

        // Validar formato de API key
        if (!apiKey.startsWith('ar_')) {
            return res.status(401).json({
                error: 'Invalid API key format. API keys must start with "ar_"',
                success: false
            });
        }

        // Validar API key en la base de datos
        const validApiKey = await apiKeyService.validateApiKey(apiKey);

        if (!validApiKey) {
            return res.status(401).json({
                error: 'Invalid or expired API key',
                success: false
            });
        }

        // Verificar límites de uso compartidos por plan
        try {
            // Obtener el total de uso del usuario usando la misma lógica que el controlador
            const { data: userKeys, error: keysError } = await supabase
                .from('api_keys')
                .select('usage_count')
                .eq('user_id', validApiKey.user_id)
                .eq('is_active', true);

            if (keysError) {
                console.error('Error checking user usage limits:', keysError);
                // Continuar sin bloquear en caso de error de consulta
            } else {
                // Calcular uso total del usuario
                const totalUsage = userKeys.reduce((total, key) => total + (key.usage_count || 0), 0);

                // Límites por plan
                const planLimits = {
                    free: 100,
                    starter: 1000,
                    pro: 5000,
                    enterprise: -1 // Ilimitado
                };

                const planLimit = planLimits[validApiKey.plan as keyof typeof planLimits];

                if (planLimit !== -1 && totalUsage >= planLimit) {
                    return res.status(429).json({
                        error: `Usage limit exceeded. Current plan (${validApiKey.plan}) allows ${planLimit} requests total across all API keys. Current usage: ${totalUsage}/${planLimit}`,
                        success: false,
                        upgrade_url: 'https://routerai.com/pricing',
                        total_usage: totalUsage,
                        plan_limit: planLimit
                    });
                }
            }
        } catch (limitError) {
            console.error('Error checking shared usage limits:', limitError);
            // Continuar sin bloquear en caso de error
        }

        // Agregar API key al request para uso posterior
        req.apiKey = validApiKey;
        next();

    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            error: 'Internal authentication error',
            success: false
        });
    }
};

// Middleware opcional para rutas públicas (como métricas)
export const optionalAuth = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const authHeader = req.headers.authorization;

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const apiKey = authHeader.substring(7);

            if (apiKey.startsWith('ar_')) {
                const validApiKey = await apiKeyService.validateApiKey(apiKey);
                if (validApiKey) {
                    req.apiKey = validApiKey;
                }
            }
        }

        next();
    } catch (error) {
        console.error('Optional auth error:', error);
        next(); // Continuar sin autenticación
    }
};

// Middleware para verificar plan específico
export const requirePlan = (requiredPlan: 'free' | 'starter' | 'pro' | 'enterprise') => {
    return (req: Request, res: Response, next: NextFunction) => {
        if (!req.apiKey) {
            return res.status(401).json({
                error: 'Authentication required',
                success: false
            });
        }

        const planHierarchy: Record<'free' | 'starter' | 'pro' | 'enterprise', number> = {
            free: 0,
            starter: 1,
            pro: 2,
            enterprise: 3
        };
        const userPlanLevel = planHierarchy[req.apiKey.plan];
        const requiredPlanLevel = planHierarchy[requiredPlan];

        if (userPlanLevel < requiredPlanLevel) {
            return res.status(403).json({
                error: `This feature requires ${requiredPlan} plan or higher. Current plan: ${req.apiKey.plan}`,
                success: false,
                upgrade_url: 'https://routerai.com/pricing'
            });
        }

        next();
    };
};
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requirePlan = exports.optionalAuth = exports.authenticateApiKey = void 0;
const apiKeyService_1 = require("../services/apiKeyService");
const apiKeyService = new apiKeyService_1.ApiKeyService();
const authenticateApiKey = async (req, res, next) => {
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
        // Verificar límites de uso
        if (validApiKey.usage_limit !== -1 && validApiKey.usage_count >= validApiKey.usage_limit) {
            return res.status(429).json({
                error: `Usage limit exceeded. Current plan (${validApiKey.plan}) allows ${validApiKey.usage_limit} requests per month.`,
                success: false,
                upgrade_url: 'https://agentrouter.com/pricing'
            });
        }
        // Agregar API key al request para uso posterior
        req.apiKey = validApiKey;
        next();
    }
    catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            error: 'Internal authentication error',
            success: false
        });
    }
};
exports.authenticateApiKey = authenticateApiKey;
// Middleware opcional para rutas públicas (como métricas)
const optionalAuth = async (req, res, next) => {
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
    }
    catch (error) {
        console.error('Optional auth error:', error);
        next(); // Continuar sin autenticación
    }
};
exports.optionalAuth = optionalAuth;
// Middleware para verificar plan específico
const requirePlan = (requiredPlan) => {
    return (req, res, next) => {
        if (!req.apiKey) {
            return res.status(401).json({
                error: 'Authentication required',
                success: false
            });
        }
        const planHierarchy = {
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
                upgrade_url: 'https://agentrouter.com/pricing'
            });
        }
        next();
    };
};
exports.requirePlan = requirePlan;

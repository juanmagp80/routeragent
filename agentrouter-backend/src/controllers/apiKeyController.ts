import { Request, Response } from 'express';
import { ApiKeyService } from '../services/apiKeyService';

const apiKeyService = new ApiKeyService();

// Crear nueva API Key
export const createApiKey = async (req: Request, res: Response) => {
    try {
        const { name, plan } = req.body;

        // Validar entrada
        if (!name || !plan) {
            return res.status(400).json({
                error: 'Name and plan are required',
                success: false
            });
        }

        if (!['starter', 'pro', 'enterprise'].includes(plan)) {
            return res.status(400).json({
                error: 'Invalid plan. Must be: starter, pro, or enterprise',
                success: false
            });
        }

        // Por ahora, crear sin user_id (para testing)
        // En producción esto vendría del usuario autenticado
        const userId = req.body.user_id || null;

        const { apiKey, rawKey } = await apiKeyService.generateApiKey(userId, name, plan);

        res.status(201).json({
            success: true,
            api_key: {
                id: apiKey.id,
                name: apiKey.name,
                key_prefix: apiKey.key_prefix,
                plan: apiKey.plan,
                usage_limit: apiKey.usage_limit,
                usage_count: apiKey.usage_count,
                created_at: apiKey.created_at,
                // Solo devolver la key completa una vez
                key: rawKey
            },
            message: 'API key created successfully. Save this key securely - it will not be shown again.'
        });

    } catch (error) {
        console.error('Create API key error:', error);
        res.status(500).json({
            error: 'Failed to create API key',
            success: false
        });
    }
};

// Listar API Keys del usuario
export const listApiKeys = async (req: Request, res: Response) => {
    try {
        const userId = req.query.user_id as string || null;

        if (!userId) {
            return res.status(400).json({
                error: 'user_id is required',
                success: false
            });
        }

        const apiKeys = await apiKeyService.getUserApiKeys(userId);

        // No devolver información sensible
        const safeApiKeys = apiKeys.map(key => ({
            id: key.id,
            name: key.name,
            key_prefix: key.key_prefix,
            plan: key.plan,
            usage_limit: key.usage_limit,
            usage_count: key.usage_count,
            is_active: key.is_active,
            created_at: key.created_at,
            last_used_at: key.last_used_at
        }));

        res.json({
            success: true,
            api_keys: safeApiKeys
        });

    } catch (error) {
        console.error('List API keys error:', error);
        res.status(500).json({
            error: 'Failed to fetch API keys',
            success: false
        });
    }
};

// Desactivar API Key
export const deactivateApiKey = async (req: Request, res: Response) => {
    try {
        const { keyId } = req.params;
        const userId = req.body.user_id;

        if (!userId) {
            return res.status(400).json({
                error: 'user_id is required',
                success: false
            });
        }

        await apiKeyService.deactivateApiKey(keyId, userId);

        res.json({
            success: true,
            message: 'API key deactivated successfully'
        });

    } catch (error) {
        console.error('Deactivate API key error:', error);
        res.status(500).json({
            error: 'Failed to deactivate API key',
            success: false
        });
    }
};

// Obtener estadísticas de uso de una API Key
export const getApiKeyStats = async (req: Request, res: Response) => {
    try {
        const { keyId } = req.params;

        const stats = await apiKeyService.getUsageStats(keyId);

        res.json({
            success: true,
            stats: stats
        });

    } catch (error) {
        console.error('Get API key stats error:', error);
        res.status(500).json({
            error: 'Failed to fetch API key statistics',
            success: false
        });
    }
};

// Validar API Key (endpoint público para testing)
export const validateApiKey = async (req: Request, res: Response) => {
    try {
        const { api_key } = req.body;

        if (!api_key) {
            return res.status(400).json({
                error: 'api_key is required',
                success: false
            });
        }

        const validKey = await apiKeyService.validateApiKey(api_key);

        if (!validKey) {
            return res.status(401).json({
                error: 'Invalid API key',
                success: false
            });
        }

        res.json({
            success: true,
            valid: true,
            key_info: {
                id: validKey.id,
                name: validKey.name,
                plan: validKey.plan,
                usage_count: validKey.usage_count,
                usage_limit: validKey.usage_limit,
                remaining: validKey.usage_limit === -1 ? 'unlimited' : validKey.usage_limit - validKey.usage_count
            }
        });

    } catch (error) {
        console.error('Validate API key error:', error);
        res.status(500).json({
            error: 'Failed to validate API key',
            success: false
        });
    }
};
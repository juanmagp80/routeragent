import { Request, Response } from 'express';
import { ApiKeyService } from '../services/apiKeyService';

const apiKeyService = new ApiKeyService();

// Crear nueva API Key
export const createApiKey = async (req: Request, res: Response) => {
    try {
        const { name, plan, usage_limit } = req.body;

        // Validar entrada
        if (!name) {
            return res.status(400).json({
                error: 'Name is required',
                success: false
            });
        }

        // Usar plan por defecto si no se proporciona
        const apiKeyPlan = plan || 'free';

        if (!['free', 'starter', 'pro', 'enterprise'].includes(apiKeyPlan)) {
            return res.status(400).json({
                error: 'Invalid plan. Must be: free, starter, pro, or enterprise',
                success: false
            });
        }

        // Obtener user_id del token JWT
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                error: 'User not authenticated',
                success: false
            });
        }

        const { apiKey, rawKey } = await apiKeyService.generateApiKey(userId, name, apiKeyPlan, usage_limit);

        res.status(201).json({
            success: true,
            api_key: {
                id: apiKey.id,
                name: apiKey.name,
                key_prefix: apiKey.key_prefix,
                plan: apiKey.plan,
                usage_limit: apiKey.usage_limit,
                usage_count: apiKey.usage_count,
                is_active: apiKey.is_active,
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
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                error: 'User not authenticated',
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
            error: 'Failed to list API keys',
            success: false
        });
    }
};

// Desactivar una API Key
export const deactivateApiKey = async (req: Request, res: Response) => {
    try {
        const { keyId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                error: 'User not authenticated',
                success: false
            });
        }

        if (!keyId) {
            return res.status(400).json({
                error: 'Key ID is required',
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

// Obtener estadísticas de una API Key específica
export const getApiKeyStats = async (req: Request, res: Response) => {
    try {
        const { keyId } = req.params;
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({
                error: 'User not authenticated',
                success: false
            });
        }

        if (!keyId) {
            return res.status(400).json({
                error: 'Key ID is required',
                success: false
            });
        }

        const stats = await apiKeyService.getApiKeyStats(keyId, userId);

        res.json({
            success: true,
            stats
        });

    } catch (error) {
        console.error('Get API key stats error:', error);
        res.status(500).json({
            error: 'Failed to get API key stats',
            success: false
        });
    }
};

// Validar una API Key (para uso interno)
export const validateApiKey = async (req: Request, res: Response) => {
    try {
        const { api_key } = req.body;

        if (!api_key) {
            return res.status(400).json({
                error: 'API key is required',
                success: false
            });
        }

        const isValid = await apiKeyService.validateApiKey(api_key);

        res.json({
            success: true,
            valid: !!isValid
        });

    } catch (error) {
        console.error('Validate API key error:', error);
        res.status(500).json({
            error: 'Failed to validate API key',
            success: false
        });
    }
};

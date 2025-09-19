"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ApiKeyService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const database_1 = require("../config/database");
class ApiKeyService {
    // Generar una nueva API Key
    async generateApiKey(userId, name, plan = 'free', usage_limit) {
        // Generar key aleatoria
        const rawKey = `ar_${crypto_1.default.randomBytes(32).toString('hex')}`;
        const keyHash = crypto_1.default.createHash('sha256').update(rawKey).digest('hex');
        const keyPrefix = rawKey.substring(0, 12); // ar_xxxxxxxx
        // Definir límites por plan
        const usageLimits = {
            free: 100,
            starter: 1000,
            pro: 5000,
            enterprise: -1 // Ilimitado
        };
        const apiKeyData = {
            user_id: userId,
            key_hash: keyHash,
            key_prefix: keyPrefix,
            name: name,
            plan: plan,
            usage_limit: usage_limit || usageLimits[plan],
            usage_count: 0,
            is_active: true,
            last_used_at: null,
            expires_at: null // Por ahora sin expiración
        };
        try {
            const { data, error } = await database_1.supabase
                .from('api_keys')
                .insert([{
                    ...apiKeyData,
                    created_at: new Date().toISOString()
                }])
                .select()
                .single();
            if (error) {
                throw new Error(`Failed to create API key: ${error.message}`);
            }
            return { apiKey: data, rawKey };
        }
        catch (error) {
            console.error('Error creating API key:', error);
            throw error;
        }
    }
    // Validar API Key
    async validateApiKey(rawKey) {
        try {
            const keyHash = crypto_1.default.createHash('sha256').update(rawKey).digest('hex');
            const { data, error } = await database_1.supabase
                .from('api_keys')
                .select('*')
                .eq('key_hash', keyHash)
                .eq('is_active', true)
                .single();
            if (error || !data) {
                return null;
            }
            // Verificar límites de uso
            if (data.usage_limit !== -1 && data.usage_count >= data.usage_limit) {
                return null; // Límite excedido
            }
            // Verificar expiración
            if (data.expires_at && new Date(data.expires_at) < new Date()) {
                return null; // Expirada
            }
            return data;
        }
        catch (error) {
            console.error('Error validating API key:', error);
            return null;
        }
    }
    // Incrementar uso de API Key
    async incrementUsage(apiKeyId, cost, tokensUsed, modelUsed, endpoint) {
        try {
            // Primero obtener el contador actual
            const { data: currentData, error: fetchError } = await database_1.supabase
                .from('api_keys')
                .select('usage_count')
                .eq('id', apiKeyId)
                .single();
            if (fetchError) {
                throw new Error(`Failed to fetch current usage: ${fetchError.message}`);
            }
            // Incrementar contador de uso
            const { error: updateError } = await database_1.supabase
                .from('api_keys')
                .update({
                usage_count: (currentData?.usage_count || 0) + 1,
                last_used_at: new Date().toISOString()
            })
                .eq('id', apiKeyId);
            if (updateError) {
                throw new Error(`Failed to update usage: ${updateError.message}`);
            }
            // Registrar uso detallado
            const usageRecord = {
                api_key_id: apiKeyId,
                endpoint: endpoint,
                cost: cost,
                tokens_used: tokensUsed,
                model_used: modelUsed
            };
            const { error: insertError } = await database_1.supabase
                .from('api_key_usage')
                .insert([{
                    ...usageRecord,
                    created_at: new Date().toISOString()
                }]);
            if (insertError) {
                console.error('Failed to log API key usage:', insertError);
                // No lanzar error aquí para no bloquear la request principal
            }
        }
        catch (error) {
            console.error('Error incrementing usage:', error);
            throw error;
        }
    }
    // Obtener API Keys de un usuario
    async getUserApiKeys(userId) {
        try {
            const { data, error } = await database_1.supabase
                .from('api_keys')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
            if (error) {
                throw new Error(`Failed to fetch API keys: ${error.message}`);
            }
            return data || [];
        }
        catch (error) {
            console.error('Error fetching user API keys:', error);
            throw error;
        }
    }
    // Desactivar API Key
    async deactivateApiKey(apiKeyId, userId) {
        try {
            const { error } = await database_1.supabase
                .from('api_keys')
                .update({ is_active: false })
                .eq('id', apiKeyId)
                .eq('user_id', userId);
            if (error) {
                throw new Error(`Failed to deactivate API key: ${error.message}`);
            }
        }
        catch (error) {
            console.error('Error deactivating API key:', error);
            throw error;
        }
    }
    // Obtener estadísticas de uso
    async getUsageStats(apiKeyId) {
        try {
            const { data, error } = await database_1.supabase
                .from('api_key_usage')
                .select('cost, tokens_used, model_used, created_at')
                .eq('api_key_id', apiKeyId)
                .order('created_at', { ascending: false })
                .limit(100);
            if (error) {
                throw new Error(`Failed to fetch usage stats: ${error.message}`);
            }
            // Procesar estadísticas
            const totalCost = data?.reduce((sum, record) => sum + record.cost, 0) || 0;
            const totalTokens = data?.reduce((sum, record) => sum + record.tokens_used, 0) || 0;
            const totalRequests = data?.length || 0;
            return {
                total_cost: totalCost,
                total_tokens: totalTokens,
                total_requests: totalRequests,
                recent_usage: data?.slice(0, 10) || []
            };
        }
        catch (error) {
            console.error('Error fetching usage stats:', error);
            throw error;
        }
    }
    // Obtener estadísticas específicas de una API Key (verificando permisos)
    async getApiKeyStats(apiKeyId, userId) {
        try {
            // Primero verificar que la API key pertenece al usuario
            const { data: apiKey, error: keyError } = await database_1.supabase
                .from('api_keys')
                .select('id, name, usage_count, usage_limit, plan, created_at, last_used_at')
                .eq('id', apiKeyId)
                .eq('user_id', userId)
                .single();
            if (keyError || !apiKey) {
                throw new Error('API key not found or access denied');
            }
            // Obtener estadísticas de uso
            const usageStats = await this.getUsageStats(apiKeyId);
            return {
                api_key: apiKey,
                usage_stats: usageStats
            };
        }
        catch (error) {
            console.error('Error fetching API key stats:', error);
            throw error;
        }
    }
}
exports.ApiKeyService = ApiKeyService;

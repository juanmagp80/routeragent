import { Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';
import { ApiKeyService } from '../services/apiKeyService';
import { AuthenticatedRequest } from '../types/request';

const apiKeyService = new ApiKeyService();

// Initialize Supabase client for dev functions
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Crear nueva API Key
export const createApiKey = async (req: AuthenticatedRequest, res: Response) => {
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
        console.error('Error creating API key:', error);
        res.status(500).json({
            error: 'Failed to create API key',
            success: false
        });
    }
};

// Listar API Keys del usuario
export const listApiKeys = async (req: AuthenticatedRequest, res: Response) => {
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
export const deactivateApiKey = async (req: AuthenticatedRequest, res: Response) => {
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
export const getApiKeyStats = async (req: AuthenticatedRequest, res: Response) => {
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

// Eliminar permanentemente una API Key
export const deleteApiKey = async (req: AuthenticatedRequest, res: Response) => {
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

        await apiKeyService.deleteApiKey(keyId, userId);

        res.json({
            success: true,
            message: 'API key deleted permanently'
        });

    } catch (error) {
        console.error('Delete API key error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to delete API key';
        res.status(500).json({
            error: errorMessage,
            success: false
        });
    }
};

// ====== FUNCIONES TEMPORALES PARA DESARROLLO (SIN AUTENTICACIÓN) ======
// TODO: Remover cuando la autenticación esté funcionando

export const listApiKeysDev = async (req: Request, res: Response) => {
    try {
        // Para desarrollo, obtener todas las API keys directamente de la base de datos 
        const supabaseUrl = process.env.SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        const { data: apiKeys, error } = await supabase
            .from('api_keys')
            .select('*')
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching API keys from Supabase:', error);
            return res.status(500).json({
                error: 'Failed to fetch API keys',
                success: false
            });
        }

        const safeApiKeys = (apiKeys || []).map((key: any) => ({
            id: key.id,
            name: key.name,
            key_prefix: key.key_prefix,
            plan: key.plan || 'starter',
            usage_limit: key.usage_limit,
            usage_count: key.usage_count || 0,
            is_active: key.is_active,
            created_at: key.created_at,
            last_used: key.last_used_at
        }));

        res.json({
            api_keys: safeApiKeys,
            success: true
        });
    } catch (error: any) {
        console.error('Error in listApiKeysDev:', error);
        res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }
};

export const createApiKeyDev = async (req: Request, res: Response) => {
    try {
        const userId = '1'; // Usuario temporal para desarrollo
        const { name, plan = 'starter', usage_limit } = req.body;

        if (!name) {
            return res.status(400).json({
                error: 'Name is required',
                success: false
            });
        }

        const result = await apiKeyService.generateApiKey(userId, name, plan as any, usage_limit);

        res.status(201).json({
            api_key: {
                id: result.apiKey.id,
                name: result.apiKey.name,
                key_prefix: result.apiKey.key_prefix,
                full_key: result.rawKey, // Incluir la clave completa solo en creación
                plan: result.apiKey.plan,
                usage_limit: result.apiKey.usage_limit,
                usage_count: 0,
                is_active: true,
                created_at: result.apiKey.created_at,
                last_used: null
            },
            success: true
        });
    } catch (error: any) {
        console.error('Error in createApiKeyDev:', error);
        res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }
};

export const deleteApiKeyDev = async (req: Request, res: Response) => {
    try {
        const { keyId } = req.params;
        const userId = '1'; // Usuario temporal para desarrollo

        if (!keyId) {
            return res.status(400).json({
                error: 'Key ID is required',
                success: false
            });
        }

        await apiKeyService.deactivateApiKey(keyId, userId);

        res.json({
            message: 'API key deactivated successfully',
            success: true
        });
    } catch (error: any) {
        console.error('Error in deleteApiKeyDev:', error);
        res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }
};

// Función para obtener métricas de desarrollo
export const getMetricsDev = async (req: Request, res: Response) => {
    try {
        const supabaseUrl = process.env.SUPABASE_URL!;
        const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
        const supabase = createClient(supabaseUrl, supabaseServiceKey);

        // Obtener conteo de API keys activas
        const { count: activeApiKeys } = await supabase
            .from('api_keys')
            .select('*', { count: 'exact', head: true })
            .eq('is_active', true);

        // Obtener estadísticas de uso (si existe una tabla de usage_records)
        const { data: usageData, error: usageError } = await supabase
            .from('usage_records')
            .select('cost, model_used, created_at')
            .order('created_at', { ascending: false })
            .limit(100);

        let totalCost = 0;
        let totalRequests = 0;
        let modelStats: { [key: string]: { count: number, sum: number } } = {};
        let recentTasks: any[] = [];

        if (!usageError && usageData) {
            totalRequests = usageData.length;
            
            usageData.forEach(record => {
                const cost = parseFloat(record.cost) || 0;
                totalCost += cost;
                
                const model = record.model_used || 'unknown';
                if (!modelStats[model]) {
                    modelStats[model] = { count: 0, sum: 0 };
                }
                modelStats[model].count++;
                modelStats[model].sum += cost;
            });

            // Crear tareas recientes
            recentTasks = usageData.slice(0, 4).map(record => ({
                model: record.model_used || 'unknown',
                cost: parseFloat(record.cost) || 0,
                latency: Math.floor(Math.random() * 200) + 50, // Latencia simulada
                status: 'completed',
                timestamp: record.created_at
            }));
        }

        // Convertir modelStats a array
        const metricsArray = Object.entries(modelStats).map(([model, stats]) => ({
            model,
            count: stats.count,
            sum: stats.sum
        }));

        const response = {
            metrics: metricsArray,
            summary: {
                total_cost: totalCost,
                total_requests: totalRequests,
                avg_cost_per_request: totalRequests > 0 ? totalCost / totalRequests : 0,
                active_api_keys: activeApiKeys || 0
            },
            recent_tasks: recentTasks,
            success: true
        };

        res.json(response);
    } catch (error: any) {
        console.error('Error in getMetricsDev:', error);
        res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }
};

// Función temporal para obtener información de facturación (sin autenticación)
export const getBillingDev = async (req: Request, res: Response) => {
    try {
        console.log('📋 Getting billing info for development...');

        // Obtener usuario actual con su plan real
        const { data: users, error: userError } = await supabase
            .from('users')
            .select('id, email, plan, subscription_status, subscription_current_period_end')
            .eq('email', 'juangpdev@gmail.com')
            .single();

        if (userError || !users) {
            console.error('Error fetching user for billing:', userError);
            return res.status(500).json({ error: 'Failed to fetch user info', success: false });
        }

        const currentPlan = users.plan || 'free';
        const subscriptionStatus = users.subscription_status || 'inactive';
        const nextBillingDate = users.subscription_current_period_end;
        
        console.log(`✅ Found user with plan: ${currentPlan}, status: ${subscriptionStatus}`);

        // Obtener información de API keys activas para el usuario
        const { data: apiKeys, error: apiKeysError } = await supabase
            .from('api_keys')
            .select('*')
            .eq('is_active', true);

        if (apiKeysError) {
            console.error('Error fetching API keys for billing:', apiKeysError);
            return res.status(500).json({ error: 'Failed to fetch API keys', success: false });
        }

        const currentApiKey = apiKeys?.[0]; // Tomar la primera API key activa

        let usageRecords = [];
        let usageError = null;

        // Solo consultar usage records si tenemos una API key válida
        if (currentApiKey && currentApiKey.id) {
            const { data: records, error } = await supabase
                .from('usage_records')
                .select('*')
                .eq('api_key_id', currentApiKey.id)
                .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()); // Últimos 30 días

            usageRecords = records || [];
            usageError = error;
        }

        if (usageError) {
            console.error('Error fetching usage records:', usageError);
        }

        const totalRequests = usageRecords?.length || 0;
        const totalCost = usageRecords?.reduce((sum, record) => sum + (record.cost || 0), 0) || 0;

        // Límites del plan actualizado
        const planLimits = {
            free: { requests: 1000, price: 0 },
            starter: { requests: 1000, price: 29 },
            pro: { requests: 5000, price: 49 },
            enterprise: { requests: -1, price: 299 }
        };        const currentPlanInfo = planLimits[currentPlan as keyof typeof planLimits] || planLimits.free;
        const usagePercentage = currentPlanInfo.requests === -1 ? 0 : Math.round((totalRequests / currentPlanInfo.requests) * 100);

        const billingInfo = {
            current_plan: {
                id: currentPlan,
                name: currentPlan === 'free' ? 'Plan Gratuito' : 
                      currentPlan === 'starter' ? 'Plan Starter' :
                      currentPlan === 'pro' ? 'Plan Pro' : 'Plan Enterprise',
                price: currentPlanInfo.price,
                currency: 'EUR',
                billing_cycle: 'monthly',
                next_billing_date: nextBillingDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                status: subscriptionStatus
            },
            usage: {
                current_requests: totalRequests,
                request_limit: currentPlanInfo.requests,
                usage_percentage: usagePercentage,
                total_cost: totalCost,
                billing_period_start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                billing_period_end: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString()
            },
            payment_method: {
                type: 'card',
                last4: '4242',
                brand: 'visa',
                expires: '12/25'
            },
            invoices: [
                {
                    id: 'inv_test_001',
                    date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
                    amount: currentPlanInfo.price,
                    currency: 'EUR',
                    status: 'paid',
                    pdf_url: '#'
                }
            ]
        };

        console.log('✅ Billing info retrieved successfully');
        res.json({
            billing: billingInfo,
            success: true
        });

    } catch (error) {
        console.error('❌ Error getting billing info:', error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

// Función temporal para crear sesión de checkout de Stripe (sin autenticación)
export const createCheckoutSessionDev = async (req: Request, res: Response) => {
    try {
        console.log('💳 Creating Stripe checkout session for development...');
        
        const { plan_id, success_url, cancel_url } = req.body;

        // Validar entrada
        if (!plan_id || !success_url || !cancel_url) {
            return res.status(400).json({
                error: 'Missing required fields: plan_id, success_url, cancel_url',
                success: false
            });
        }

        // Mapeo de planes a precios de Stripe (estos deben coincidir con los price IDs de Stripe)
        const stripePrices = {
            starter: 'price_starter_test', // Reemplazar con el price ID real de Stripe
            pro: 'price_pro_test',         // Reemplazar con el price ID real de Stripe
            enterprise: 'price_enterprise_test' // Reemplazar con el price ID real de Stripe
        };

        const priceId = stripePrices[plan_id as keyof typeof stripePrices];
        
        if (!priceId) {
            return res.status(400).json({
                error: 'Invalid plan_id',
                success: false
            });
        }

        // Para desarrollo, simular la creación de una sesión de checkout
        const mockCheckoutSession = {
            id: `cs_test_${Math.random().toString(36).substr(2, 9)}`,
            url: `https://checkout.stripe.com/c/pay/cs_test_${Math.random().toString(36).substr(2, 9)}#${plan_id}`,
            payment_status: 'open',
            success_url,
            cancel_url,
            plan_id,
            amount: plan_id === 'pro' ? 4900 : plan_id === 'enterprise' ? 9900 : 2900, // En centavos
            currency: 'eur'
        };

        console.log('✅ Mock Stripe checkout session created successfully');
        
        res.json({
            checkout_session: mockCheckoutSession,
            success: true
        });

    } catch (error) {
        console.error('❌ Error creating Stripe checkout session:', error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

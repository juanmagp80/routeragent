import { createClient } from '@supabase/supabase-js';
import { Request, Response } from 'express';
import { ApiKeyService } from '../services/apiKeyService';
import { notificationService } from '../services/notificationService';
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

        // 📧 Enviar notificación de nueva API key creada
        try {
            await notificationService.send({
                userId: userId,
                type: 'api_key_created',
                data: {
                    keyName: name,
                    plan: apiKeyPlan,
                    keyPrefix: rawKey.substring(0, 12) + '...'
                }
            });
        } catch (notificationError) {
            console.error('⚠️ Failed to send API key creation notification:', notificationError);
            // No fallar la creación de la API key si falla la notificación
        }

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
        console.log('📋 listApiKeysDev: Conectando con Supabase real');

        // ID del usuario de desarrollo (debe coincidir con createApiKeyDev)
        const userId = '3a942f65-25e7-4de3-84cb-3df0268ff759';

        // Para desarrollo, obtener solo las API keys del usuario actual
        const { data: apiKeys, error } = await supabase
            .from('api_keys')
            .select('*')
            .eq('user_id', userId)
            .eq('is_active', true)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching API keys from Supabase:', error);
            return res.status(500).json({
                error: 'Failed to fetch API keys',
                success: false,
                details: error.message
            });
        }

        console.log(`✅ Found ${apiKeys?.length || 0} API keys in database`);

        // Calcular el uso total de todas las claves activas
        const totalUsage = (apiKeys || []).reduce((sum: number, key: any) => sum + (key.usage_count || 0), 0);

        // Límites globales por plan
        const planLimits = {
            free: 100,
            starter: 1000,
            pro: 50000,
            enterprise: -1
        };

        // Obtener el plan del usuario (asumimos pro para desarrollo)
        const userPlan = 'pro';
        const planLimit = planLimits[userPlan as keyof typeof planLimits];

        const safeApiKeys = (apiKeys || []).map((key: any) => ({
            id: key.id,
            name: key.name,
            key_prefix: key.key_prefix,
            plan: key.plan || 'starter',
            usage_count: key.usage_count || 0,
            is_active: key.is_active,
            created_at: key.created_at,
            last_used: key.last_used_at
        }));

        res.json({
            api_keys: safeApiKeys,
            total_usage: totalUsage,
            plan_limit: planLimit,
            user_plan: userPlan,
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
        const userId = '3a942f65-25e7-4de3-84cb-3df0268ff759'; // Usuario fijo para desarrollo
        const { name, plan = 'pro' } = req.body; // Usar plan Pro por defecto

        if (!name) {
            return res.status(400).json({
                error: 'Name is required',
                success: false
            });
        }

        console.log(`🔑 Creating API key: name="${name}", plan="${plan}", userId="${userId}"`);

        // Verificar límite de claves por plan ANTES de crear
        const { data: existingKeys, error: countError } = await supabase
            .from('api_keys')
            .select('id')
            .eq('user_id', userId)
            .eq('is_active', true);

        if (countError) {
            console.error('Error checking existing keys:', countError);
            return res.status(500).json({
                error: 'Failed to check existing API keys',
                success: false
            });
        }

        // Límites de claves por plan
        const keyLimits = {
            free: 1,
            starter: 3,
            pro: 5,
            enterprise: 20
        };

        const currentKeyCount = existingKeys?.length || 0;
        const maxKeys = keyLimits[plan as keyof typeof keyLimits] || 1;

        if (currentKeyCount >= maxKeys) {
            return res.status(400).json({
                error: `You have reached the maximum number of API keys for your ${plan} plan (${maxKeys} keys). Please delete an existing key or upgrade your plan.`,
                success: false,
                current_keys: currentKeyCount,
                max_keys: maxKeys
            });
        }

        // Generar key directamente sin validaciones complejas
        const rawKey = `ar_${require('crypto').randomBytes(32).toString('hex')}`;
        const keyHash = require('crypto').createHash('sha256').update(rawKey).digest('hex');
        const keyPrefix = rawKey.substring(0, 12);

        // IMPORTANTE: Los requests se comparten entre TODAS las claves del usuario
        // No asignamos usage_limit por clave, sino que el límite es por plan del usuario
        const apiKeyData = {
            user_id: userId,
            key_hash: keyHash,
            key_prefix: keyPrefix,
            name: name,
            plan: plan,
            usage_count: 0,
            is_active: true,
            last_used_at: null,
            expires_at: null,
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('api_keys')
            .insert([apiKeyData])
            .select()
            .single();

        if (error) {
            console.error('❌ Supabase error creating API key:', error);
            return res.status(500).json({
                error: `Failed to create API key: ${error.message}`,
                success: false
            });
        }

        console.log('✅ API key created successfully:', data.id);

        // Límites globales por plan (compartidos entre todas las claves)
        const planLimits = {
            free: 100,
            starter: 1000,
            pro: 5000,
            enterprise: -1
        };

        res.status(201).json({
            api_key: {
                id: data.id,
                name: data.name,
                key_prefix: data.key_prefix,
                full_key: rawKey, // Incluir la clave completa solo en creación
                plan: data.plan,
                usage_limit: planLimits[plan as keyof typeof planLimits] || 5000, // Límite total del plan
                usage_count: 0,
                is_active: true,
                created_at: data.created_at,
                last_used: null
            },
            success: true
        });
    } catch (error: any) {
        console.error('❌ Error in createApiKeyDev:', error);
        res.status(500).json({
            error: 'Internal server error',
            success: false
        });
    }
};

export const deleteApiKeyDev = async (req: Request, res: Response) => {
    try {
        const { keyId } = req.params;
        const userId = '3a942f65-25e7-4de3-84cb-3df0268ff759'; // Usuario fijo para desarrollo

        if (!keyId) {
            return res.status(400).json({
                error: 'Key ID is required',
                success: false
            });
        }

        console.log(`🗑️ Deleting API key: keyId="${keyId}", userId="${userId}"`);

        // Eliminar directamente de Supabase
        const { error } = await supabase
            .from('api_keys')
            .update({ is_active: false })
            .eq('id', keyId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error deactivating API key in Supabase:', error);
            return res.status(500).json({
                error: 'Failed to delete API key',
                success: false
            });
        }

        console.log('✅ API key deactivated successfully');

        res.json({
            message: 'API key deleted successfully',
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
        // ID del usuario de desarrollo (debe coincidir con listApiKeysDev y createApiKeyDev)
        const userId = '3a942f65-25e7-4de3-84cb-3df0268ff759';

        // Obtener conteo de API keys activas del usuario específico
        const { count: activeApiKeys } = await supabase
            .from('api_keys')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_active', true);

        // Primero obtener las API keys del usuario para filtrar usage_records
        const { data: userApiKeys } = await supabase
            .from('api_keys')
            .select('id')
            .eq('user_id', userId);

        const userApiKeyIds = userApiKeys?.map(key => key.id) || [];

        // Obtener estadísticas de uso filtradas por las API keys del usuario
        const { data: usageData, error: usageError } = userApiKeyIds.length > 0 ? await supabase
            .from('usage_records')
            .select('cost, model_used, created_at, api_key_id')
            .in('api_key_id', userApiKeyIds)
            .order('created_at', { ascending: false })
            .limit(100) : { data: null, error: null };

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

        // Para desarrollo, usar datos simulados con plan Pro
        const currentPlan = 'pro';
        const subscriptionStatus = 'active';
        const nextBillingDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();

        console.log(`✅ Using development plan: ${currentPlan}, status: ${subscriptionStatus}`);

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
        }; const currentPlanInfo = planLimits[currentPlan as keyof typeof planLimits] || planLimits.free;
        const usagePercentage = currentPlanInfo.requests === -1 ? 0 : Math.round((totalRequests / currentPlanInfo.requests) * 100);

        const billingInfo = {
            current_plan: {
                id: currentPlan,
                name: 'Plan Pro', // Hardcodeado para desarrollo
                price: currentPlanInfo.price,
                currency: 'EUR',
                billing_cycle: 'monthly',
                next_billing_date: nextBillingDate,
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

// Función temporal para obtener información del usuario actual (sin autenticación)
export const getCurrentUserDev = async (req: Request, res: Response) => {
    try {
        console.log('👤 Getting current user info for development...');

        // Obtener usuario actual con todos sus datos usando ID fijo
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('*')
            .eq('id', '3a942f65-25e7-4de3-84cb-3df0268ff759')
            .single();

        if (userError || !user) {
            console.error('Error fetching current user:', userError);
            return res.status(500).json({ error: 'Failed to fetch user info', success: false });
        }

        console.log(`✅ Found current user: ${user.name} (${user.email}) with plan: ${user.plan}`);

        // Devolver datos del usuario en formato esperado por el frontend
        const userData = {
            id: user.id,
            name: (user.name || user.email.split('@')[0]).replace(/ - Test$/i, ''), // Limpiar " - Test" del nombre
            email: user.email,
            company: user.company || '',
            plan: user.plan || 'free',
            api_key_limit: user.api_key_limit || 3,
            is_active: user.is_active !== false,
            email_verified: user.email_verified !== false,
            created_at: user.created_at || new Date().toISOString(),
            // Preferencias de notificaciones (ahora con columnas reales en DB)
            email_notifications: user.email_notifications !== false, // leer de DB
            slack_notifications: user.slack_notifications === true, // leer de DB
            discord_notifications: user.discord_notifications === true // leer de DB
        };

        res.json({
            user: userData,
            success: true
        });

    } catch (error) {
        console.error('❌ Error fetching current user:', error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

export const updateCurrentUserDev = async (req: Request, res: Response) => {
    try {
        console.log('🔄 Updating current user info for development...');
        const updateData = req.body;

        // Usar UPSERT para crear o actualizar el usuario
        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .upsert({
                id: '3a942f65-25e7-4de3-84cb-3df0268ff759', // ID fijo para desarrollo
                name: updateData.name,
                company: updateData.company,
                email: updateData.email,
                plan: updateData.plan || 'pro'
            })
            .select()
            .single();

        if (updateError || !updatedUser) {
            console.error('Error updating user:', updateError);
            return res.status(500).json({ error: 'Failed to update user', success: false });
        }

        console.log(`✅ User updated successfully: ${updatedUser.name} (${updatedUser.email})`);

        // Devolver datos actualizados del usuario
        const userData = {
            id: updatedUser.id,
            name: updatedUser.name || updatedUser.email.split('@')[0],
            email: updatedUser.email,
            company: updatedUser.company || '',
            plan: updatedUser.plan || 'free',
            api_key_limit: updatedUser.api_key_limit || 3,
            is_active: updatedUser.is_active !== false,
            email_verified: updatedUser.email_verified !== false,
            created_at: updatedUser.created_at || new Date().toISOString()
        };

        res.json({
            user: userData,
            success: true,
            message: 'Usuario actualizado exitosamente'
        });

    } catch (error) {
        console.error('❌ Error updating current user:', error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

export const updateUserNotificationsDev = async (req: Request, res: Response) => {
    try {
        console.log('🔔 Updating user notification preferences...');
        const { email_notifications, slack_notifications, discord_notifications, slack_webhook_url, discord_webhook_url } = req.body;

        console.log('📝 Notification preferences received:', {
            email: email_notifications,
            slack: slack_notifications,
            discord: discord_notifications,
            slackWebhook: slack_webhook_url ? '***configured***' : 'not set',
            discordWebhook: discord_webhook_url ? '***configured***' : 'not set'
        });

        // Actualizar preferencias de notificaciones en Supabase (ahora con columnas reales)
        const updateData: any = {
            updated_at: new Date().toISOString()
        };

        if (email_notifications !== undefined) updateData.email_notifications = email_notifications;
        if (slack_notifications !== undefined) updateData.slack_notifications = slack_notifications;
        if (discord_notifications !== undefined) updateData.discord_notifications = discord_notifications;
        if (slack_webhook_url !== undefined) updateData.slack_webhook_url = slack_webhook_url;
        if (discord_webhook_url !== undefined) updateData.discord_webhook_url = discord_webhook_url;

        const { data: updatedUser, error: updateError } = await supabase
            .from('users')
            .update(updateData)
            .eq('email', 'juanmagp26@gmail.com')
            .select()
            .single();

        if (updateError || !updatedUser) {
            console.error('Error updating notification preferences:', updateError);
            return res.status(500).json({ error: 'Failed to update notification preferences', success: false });
        }

        console.log(`✅ Notification preferences updated successfully in database`);

        res.json({
            success: true,
            message: 'Preferencias de notificación actualizadas exitosamente',
            notifications: {
                email: updatedUser.email_notifications,
                slack: updatedUser.slack_notifications,
                discord: updatedUser.discord_notifications,
                slack_webhook_url: updatedUser.slack_webhook_url,
                discord_webhook_url: updatedUser.discord_webhook_url
            }
        });

    } catch (error) {
        console.error('❌ Error updating notification preferences:', error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

// 🚫 SLACK DESHABILITADO TEMPORALMENTE
export const validateSlackWebhook = async (req: Request, res: Response) => {
    try {
        console.log('⚠️ Slack webhook validation disabled');

        res.json({
            success: false,
            valid: false,
            message: 'Las notificaciones de Slack están temporalmente deshabilitadas',
            disabled: true
        });

    } catch (error) {
        console.error('❌ Error validating Slack webhook:', error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

// 🚫 DISCORD DESHABILITADO TEMPORALMENTE
export const validateDiscordWebhook = async (req: Request, res: Response) => {
    try {
        console.log('⚠️ Discord webhook validation disabled');

        res.json({
            success: false,
            valid: false,
            message: 'Las notificaciones de Discord están temporalmente deshabilitadas',
            disabled: true
        });

    } catch (error) {
        console.error('❌ Error validating Discord webhook:', error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

// 🧪 ENDPOINTS DE PRUEBA PARA NOTIFICACIONES
export const testNotificationApiKeyCreated = async (req: Request, res: Response) => {
    try {
        console.log('🧪 Testing API Key Created notification...');

        await notificationService.send({
            userId: '3a942f65-25e7-4de3-84cb-3df0268ff759',
            type: 'api_key_created',
            data: {
                keyName: 'Test API Key',
                plan: 'pro',
                keyPrefix: 'agr_test123...'
            }
        });

        res.json({
            success: true,
            message: 'Notificación de API Key creada enviada exitosamente'
        });

    } catch (error) {
        console.error('❌ Error testing API key created notification:', error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

export const testNotificationUsageAlert = async (req: Request, res: Response) => {
    try {
        const { percentage = 80 } = req.body;
        console.log(`🧪 Testing Usage Alert notification at ${percentage}%...`);

        await notificationService.send({
            userId: '3a942f65-25e7-4de3-84cb-3df0268ff759',
            type: 'usage_alert',
            data: {
                keyName: 'Production API Key',
                usageCount: Math.floor(1000 * (percentage / 100)),
                usageLimit: 1000,
                percentage: percentage,
                plan: 'pro'
            }
        });

        res.json({
            success: true,
            message: `Notificación de uso al ${percentage}% enviada exitosamente`
        });

    } catch (error) {
        console.error('❌ Error testing usage alert notification:', error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

export const testNotificationWelcome = async (req: Request, res: Response) => {
    try {
        console.log('🧪 Testing Welcome notification...');

        await notificationService.send({
            userId: '3a942f65-25e7-4de3-84cb-3df0268ff759',
            type: 'welcome',
            data: {}
        });

        res.json({
            success: true,
            message: 'Notificación de bienvenida enviada exitosamente'
        });

    } catch (error) {
        console.error('❌ Error testing welcome notification:', error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

export const testNotificationPaymentSuccess = async (req: Request, res: Response) => {
    try {
        console.log('🧪 Testing Payment Success notification...');

        await notificationService.send({
            userId: '3a942f65-25e7-4de3-84cb-3df0268ff759',
            type: 'payment_success',
            data: {
                amount: '€49.00',
                plan: 'Pro'
            }
        });

        res.json({
            success: true,
            message: 'Notificación de pago exitoso enviada'
        });

    } catch (error) {
        console.error('❌ Error testing payment success notification:', error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

// 🔔 ENDPOINTS PARA GESTIONAR NOTIFICACIONES EN PÁGINA
export const getNotifications = async (req: Request, res: Response) => {
    try {
        const userId = '3a942f65-25e7-4de3-84cb-3df0268ff759'; // ID fijo para desarrollo
        const { page = 1, limit = 20 } = req.query;

        const offset = (Number(page) - 1) * Number(limit);

        console.log(`📱 Getting notifications for user ${userId}...`);
        console.log(`📊 Supabase URL: ${supabaseUrl ? 'SET' : 'NOT SET'}`);
        console.log(`🔑 Supabase Key: ${supabaseServiceKey ? 'SET' : 'NOT SET'}`);

        const { data: notifications, error } = await supabase
            .from('notifications')
            .select('*')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .range(offset, offset + Number(limit) - 1);

        if (error) {
            console.error('❌ Supabase error:', error);
            return res.status(500).json({
                error: 'Failed to fetch notifications',
                success: false,
                details: error.message
            });
        }

        // Contar total de notificaciones no leídas
        const { count: unreadCount, error: countError } = await supabase
            .from('notifications')
            .select('*', { count: 'exact', head: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (countError) {
            console.error('❌ Error counting unread notifications:', countError);
        }

        console.log(`✅ Found ${notifications?.length || 0} notifications`);

        res.json({
            success: true,
            notifications: notifications || [],
            unreadCount: unreadCount || 0,
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total: notifications?.length || 0
            }
        });

    } catch (error) {
        console.error('❌ Error fetching notifications:', error);
        res.status(500).json({
            error: 'Internal server error',
            success: false,
            details: error instanceof Error ? error.message : 'Unknown error'
        });
    }
};

export const markNotificationAsRead = async (req: Request, res: Response) => {
    try {
        const { notificationId } = req.params;
        const userId = '3a942f65-25e7-4de3-84cb-3df0268ff759'; // ID fijo para desarrollo

        console.log(`📖 Marking notification ${notificationId} as read...`);

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('id', notificationId)
            .eq('user_id', userId);

        if (error) {
            console.error('Error marking notification as read:', error);
            return res.status(500).json({ error: 'Failed to mark notification as read', success: false });
        }

        res.json({
            success: true,
            message: 'Notification marked as read'
        });

    } catch (error) {
        console.error('❌ Error marking notification as read:', error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

export const markAllNotificationsAsRead = async (req: Request, res: Response) => {
    try {
        const userId = '3a942f65-25e7-4de3-84cb-3df0268ff759'; // ID fijo para desarrollo

        console.log(`📖 Marking all notifications as read for user ${userId}...`);

        const { error } = await supabase
            .from('notifications')
            .update({ is_read: true })
            .eq('user_id', userId)
            .eq('is_read', false);

        if (error) {
            console.error('Error marking all notifications as read:', error);
            return res.status(500).json({ error: 'Failed to mark all notifications as read', success: false });
        }

        res.json({
            success: true,
            message: 'All notifications marked as read'
        });

    } catch (error) {
        console.error('❌ Error marking all notifications as read:', error);
        res.status(500).json({ error: 'Internal server error', success: false });
    }
};

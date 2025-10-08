import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export interface UserMetrics {
    requests: number;
    cost: number;
    limit: number;
    apiKeysCount: number;
    uniqueModels: number;
    recentActivity: ActivityRecord[];
}

export interface ActivityRecord {
    id: string;
    task_type: string;
    model_used: string;
    cost: number;
    created_at: string;
    status: string;
    tokens_used?: number;
}

export interface UserStats {
    totalRequests: number;
    totalCost: number;
    requestsThisMonth: number;
    costThisMonth: number;
    avgResponseTime: number;
    mostUsedModel: string;
}

/**
 * Función de timeout para promesas
 */
function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
    return new Promise((resolve, reject) => {
        const timer = setTimeout(() => {
            reject(new Error(`Query timeout after ${timeoutMs}ms`));
        }, timeoutMs);

        promise
            .then((value) => {
                clearTimeout(timer);
                resolve(value);
            })
            .catch((error) => {
                clearTimeout(timer);
                reject(error);
            });
    });
}

/**
 * Obtiene las métricas principales del usuario de forma optimizada
 */
export async function getUserMetrics(userId: string): Promise<UserMetrics> {
    const startTime = Date.now();
    console.log('📊 [METRICS] Iniciando carga de métricas para usuario:', userId);

    try {
        // Consultas optimizadas con timeout de 8 segundos
        const queries = await withTimeout(
            Promise.allSettled([
                // Query 1: Contar API keys activas
                supabase
                    .from('api_keys')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', userId)
                    .eq('is_active', true),

                // Query 2: Obtener actividad reciente (solo últimas 10)
                supabase
                    .from('usage_records')
                    .select('id, model_used, cost, created_at, tokens_used, latency_ms')
                    .eq('user_id', userId)
                    .order('created_at', { ascending: false })
                    .limit(10),

                // Query 3: Suma total de costos
                supabase
                    .from('usage_records')
                    .select('cost')
                    .eq('user_id', userId),

                // Query 4: Info del usuario
                supabase
                    .from('users')
                    .select('api_key_limit, plan')
                    .eq('id', userId)
                    .single(),

                // Query 5: Contar total de requests
                supabase
                    .from('usage_records')
                    .select('id', { count: 'exact', head: true })
                    .eq('user_id', userId)
            ]),
            8000 // 8 segundos timeout
        );

        const [apiKeysResult, activityResult, costsResult, userResult, requestsCountResult] = queries;

        // Procesar resultados con fallbacks
        let apiKeysCount = 0;
        let recentActivity: ActivityRecord[] = [];
        let totalCost = 0;
        let totalRequests = 0;
        let userLimit = 1000;

        // API Keys
        if (apiKeysResult.status === 'fulfilled' && !apiKeysResult.value.error) {
            apiKeysCount = apiKeysResult.value.count || 0;
        } else {
            console.warn('⚠️ [METRICS] Error obteniendo API keys:', apiKeysResult);
        }

        // Actividad reciente
        if (activityResult.status === 'fulfilled' && !activityResult.value.error) {
            const activities = activityResult.value.data || [];
            recentActivity = activities.map(activity => ({
                id: activity.id,
                task_type: 'general', // usage_records no tiene task_type, usar valor por defecto
                model_used: activity.model_used || 'unknown',
                cost: parseFloat(activity.cost || '0'),
                created_at: activity.created_at,
                status: 'completed', // usage_records no tiene status, usar valor por defecto
                tokens_used: activity.tokens_used
            }));
        } else {
            console.warn('⚠️ [METRICS] Error obteniendo actividad:', activityResult);
        }

        // Costos totales
        if (costsResult.status === 'fulfilled' && !costsResult.value.error) {
            const costs = costsResult.value.data || [];
            totalCost = costs.reduce((sum, record) => sum + parseFloat(record.cost || '0'), 0);
        } else {
            console.warn('⚠️ [METRICS] Error obteniendo costos:', costsResult);
        }

        // Límite del usuario
        if (userResult.status === 'fulfilled' && !userResult.value.error) {
            const userData = userResult.value.data;
            userLimit = userData?.api_key_limit ? userData.api_key_limit * 1000 : 1000;
        } else {
            console.warn('⚠️ [METRICS] Error obteniendo datos de usuario:', userResult);
        }

        // Total de requests (conteo exacto)
        if (requestsCountResult.status === 'fulfilled' && !requestsCountResult.value.error) {
            totalRequests = requestsCountResult.value.count || 0;
        } else {
            console.warn('⚠️ [METRICS] Error contando requests:', requestsCountResult);
        }

        const loadTime = Date.now() - startTime;
        console.log(`✅ [METRICS] Métricas cargadas en ${loadTime}ms:`, {
            requests: totalRequests,
            cost: totalCost.toFixed(2),
            limit: userLimit,
            apiKeysCount,
            activityCount: recentActivity.length
        });

        // Calcular modelos únicos
        const uniqueModels = new Set(recentActivity.map(activity => activity.model_used).filter(Boolean));

        return {
            requests: totalRequests,
            cost: parseFloat(totalCost.toFixed(2)),
            limit: userLimit,
            apiKeysCount,
            uniqueModels: uniqueModels.size,
            recentActivity
        };

    } catch (error) {
        const loadTime = Date.now() - startTime;
        console.error(`❌ [METRICS] Error después de ${loadTime}ms:`, error);

        // Retornar datos por defecto si todo falla
        return {
            requests: 0,
            cost: 0,
            limit: 1000,
            apiKeysCount: 0,
            uniqueModels: 0,
            recentActivity: []
        };
    }
}

/**
 * Obtiene estadísticas del usuario de forma optimizada
 */
export async function getUserStats(userId: string): Promise<UserStats> {
    const startTime = Date.now();
    console.log('📈 [STATS] Iniciando carga de estadísticas para usuario:', userId);

    try {
        const now = new Date();
        const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Consulta simple con timeout
        const { data, error } = await supabase
            .from('usage_logs')
            .select('cost, created_at, latency_ms, model_used')
            .eq('user_id', userId)
            .order('created_at', { ascending: false })
            .limit(1000);

        if (error) {
            console.warn('⚠️ [STATS] Error en consulta:', error);
            return getDefaultStats();
        }

        const allData = data || [];

        if (allData.length === 0) {
            console.log('📊 [STATS] No hay datos de uso para el usuario');
            return getDefaultStats();
        }

        // Calcular estadísticas
        const totalRequests = allData.length;
        const totalCost = allData.reduce((sum: number, item: any) => sum + parseFloat(item.cost || '0'), 0);

        const thisMonthData = allData.filter((item: any) =>
            new Date(item.created_at) >= firstDayThisMonth
        );
        const requestsThisMonth = thisMonthData.length;
        const costThisMonth = thisMonthData.reduce((sum: number, item: any) => sum + parseFloat(item.cost || '0'), 0);

        // Calcular tiempo promedio de respuesta
        const dataWithResponseTime = allData.filter((item: any) =>
            item.latency_ms && item.latency_ms > 0
        );

        let avgResponseTime = 0;
        if (dataWithResponseTime.length > 0) {
            avgResponseTime = Math.round(
                dataWithResponseTime.reduce((sum: number, item: any) => sum + item.latency_ms, 0) /
                dataWithResponseTime.length
            );
        } else if (totalRequests > 0) {
            avgResponseTime = 800; // Valor estimado basado en datos reales
        }

        // Encontrar modelo más usado
        const modelCounts = allData.reduce((acc: Record<string, number>, item: any) => {
            const model = item.model_used || 'unknown';
            acc[model] = (acc[model] || 0) + 1;
            return acc;
        }, {} as Record<string, number>);

        const mostUsedModel = Object.keys(modelCounts).length > 0
            ? Object.keys(modelCounts).reduce((a, b) => modelCounts[a] > modelCounts[b] ? a : b)
            : 'N/A';

        const loadTime = Date.now() - startTime;
        console.log(`✅ [STATS] Estadísticas cargadas en ${loadTime}ms:`, {
            totalRequests,
            totalCost: totalCost.toFixed(2),
            requestsThisMonth,
            avgResponseTime,
            mostUsedModel
        });

        return {
            totalRequests,
            totalCost: parseFloat(totalCost.toFixed(2)),
            requestsThisMonth,
            costThisMonth: parseFloat(costThisMonth.toFixed(2)),
            avgResponseTime,
            mostUsedModel
        };

    } catch (error) {
        const loadTime = Date.now() - startTime;
        console.error(`❌ [STATS] Error después de ${loadTime}ms:`, error);
        return getDefaultStats();
    }
}

/**
 * Estadísticas por defecto cuando no hay datos
 */
function getDefaultStats(): UserStats {
    return {
        totalRequests: 0,
        totalCost: 0,
        requestsThisMonth: 0,
        costThisMonth: 0,
        avgResponseTime: 0,
        mostUsedModel: 'Ninguno'
    };
}
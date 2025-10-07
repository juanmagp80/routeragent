// Versión optimizada super rápida de métricas
import { supabase } from '../config/database';

export interface QuickMetrics {
    requests: number;
    cost: number;
    apiKeysCount: number;
    recentActivity: any[];
}

export async function getQuickMetrics(userId: string): Promise<QuickMetrics> {
    console.log('⚡ [QUICK-METRICS] Carga súper rápida para:', userId);

    try {
        // Solo las consultas esenciales, sin timeouts complejos
        const [requestsResult, apiKeysResult] = await Promise.allSettled([
            // Contar requests total
            supabase
                .from('usage_logs')
                .select('cost')
                .eq('user_id', userId),

            // Contar API keys activas
            supabase
                .from('api_keys')
                .select('id', { count: 'exact', head: true })
                .eq('user_id', userId)
                .eq('is_active', true)
        ]);

        let totalRequests = 0;
        let totalCost = 0;
        let apiKeysCount = 0;

        // Procesar requests y costos
        if (requestsResult.status === 'fulfilled' && !requestsResult.value.error) {
            const data = requestsResult.value.data || [];
            totalRequests = data.length;
            totalCost = data.reduce((sum, record) => sum + parseFloat(record.cost || '0'), 0);
        }

        // Procesar API keys
        if (apiKeysResult.status === 'fulfilled' && !apiKeysResult.value.error) {
            apiKeysCount = apiKeysResult.value.count || 0;
        }

        console.log('✅ [QUICK-METRICS] Métricas rápidas cargadas:', {
            totalRequests,
            totalCost: totalCost.toFixed(6),
            apiKeysCount
        });

        return {
            requests: totalRequests,
            cost: totalCost,
            apiKeysCount,
            recentActivity: [] // Vacío para máxima velocidad
        };

    } catch (error) {
        console.warn('⚠️ [QUICK-METRICS] Error, devolviendo defaults:', error);
        return {
            requests: 0,
            cost: 0,
            apiKeysCount: 0,
            recentActivity: []
        };
    }
}
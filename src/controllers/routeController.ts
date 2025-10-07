// Controlador de rutas para AgentRouter - Con guardado de actividad
import { supabase } from '../config/database';

// Función para guardar actividad básica
async function saveBasicActivity(req: any, task: any, cost: number) {
    try {
        console.log('💾 [SAVE-ACTIVITY] Guardando actividad básica...');

        // Obtener user_id desde API key
        const apiKey = req.headers?.['x-api-key'] || req.headers?.['X-API-Key'];
        if (!apiKey) {
            console.warn('⚠️ [SAVE-ACTIVITY] No hay API key, no se guardará');
            return;
        }

        // Hashear la API key para buscarla en la base de datos
        const crypto = require('crypto');
        const keyHash = crypto.createHash('sha256').update(apiKey).digest('hex');

        const { data: apiKeyData, error: apiKeyError } = await supabase
            .from('api_keys')
            .select('user_id')
            .eq('key_hash', keyHash)
            .eq('is_active', true)
            .single();

        if (apiKeyError || !apiKeyData) {
            console.warn('⚠️ [SAVE-ACTIVITY] API key no válida:', apiKeyError?.message);
            return;
        }

        // Insertar registro completo usando las columnas correctas
        const activityRecord = {
            user_id: apiKeyData.user_id,
            model_used: 'GPT-4o Mini',
            cost: parseFloat(cost.toFixed(6)),
            latency_ms: 800,
            tokens_used: Math.ceil(task.input.length * 0.75),
            prompt_preview: task.input.substring(0, 100),
            capabilities: 'text-generation',
            endpoint: '/api/v1/route',
            method: 'POST',
            cost_usd: parseFloat(cost.toFixed(6)),
            created_at: new Date().toISOString()
        };

        const { data, error } = await supabase
            .from('usage_logs')
            .insert([activityRecord])
            .select();

        if (error) {
            console.error('❌ [SAVE-ACTIVITY] Error:', error);
        } else {
            console.log('✅ [SAVE-ACTIVITY] Guardado exitoso:', data?.length);
        }

    } catch (error) {
        console.error('💥 [SAVE-ACTIVITY] Error general:', error);
    }
}

export const routeTask = async (req: any, res: any) => {
    try {
        console.log('🚀 [ROUTE-TASK] Procesando task...');
        const task = req.body;

        if (!task || !task.input) {
            return res.status(400).json({
                error: "Input requerido",
                success: false
            });
        }

        // Calcular costo
        const cost = task.input.length * 0.000001; // Costo simulado

        // Respuesta simulada
        const responseText = `Respuesta procesada: ${task.input}`;

        console.log('✅ [ROUTE-TASK] Task procesado, guardando actividad...');

        // Guardar actividad en la base de datos
        try {
            await saveBasicActivity(req, task, cost);
        } catch (saveError) {
            console.error('❌ [ROUTE-TASK] Error guardando:', saveError);
        }

        res.json({
            selected_model: "GPT-4o Mini",
            cost: cost,
            estimated_time: 800,
            response: responseText,
            task_type: task.task_type || 'general',
            success: true
        });

    } catch (error) {
        console.error('❌ [ROUTE-TASK] Error:', error);
        res.status(500).json({
            error: "Error interno del servidor",
            success: false
        });
    }
};

export const getMetrics = async (req: any, res: any) => {
    try {
        res.json({
            metrics: [],
            summary: {
                total_cost: 0,
                total_requests: 0,
                avg_cost_per_request: 0,
                active_api_keys: 0,
            },
            recent_tasks: []
        });
    } catch (error) {
        res.status(500).json({ error: "Error obteniendo métricas" });
    }
};

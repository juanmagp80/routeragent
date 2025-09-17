import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { UsageRecord } from '../models/UsageRecord';
import { ApiKeyService } from '../services/apiKeyService';
import { LogService } from '../services/logService';
import { ModelRouter } from '../services/modelRouter';

// Inicializar servicios
const logService = new LogService();
const apiKeyService = new ApiKeyService();

// Mock de modelos (en producción esto vendría de una base de datos)
const mockModels = [
    {
        id: "gpt-4",
        name: "gpt-4",
        provider: "openai",
        cost_per_token: 0.03,
        max_tokens: 128000,
        speed_rating: 8,
        quality_rating: 9,
        availability: true,
        supported_tasks: ["summary", "translation", "analysis", "general"]
    },
    {
        id: "claude-3",
        name: "claude-3",
        provider: "anthropic",
        cost_per_token: 0.015,
        max_tokens: 200000,
        speed_rating: 7,
        quality_rating: 8,
        availability: true,
        supported_tasks: ["summary", "translation", "analysis", "general"]
    },
    {
        id: "mistral-7b",
        name: "mistral-7b",
        provider: "mistral",
        cost_per_token: 0.002,
        max_tokens: 32000,
        speed_rating: 9,
        quality_rating: 7,
        availability: true,
        supported_tasks: ["summary", "translation", "general"]
    },
    {
        id: "llama-3",
        name: "llama-3",
        provider: "meta",
        cost_per_token: 0.001,
        max_tokens: 8000,
        speed_rating: 6,
        quality_rating: 6,
        availability: true,
        supported_tasks: ["summary", "translation", "general"]
    }
];

const modelRouter = new ModelRouter(mockModels);

export const routeTask = async (req: Request, res: Response) => {
    try {
        const task: Task = req.body;

        // Validar entrada
        if (!task.input) {
            return res.status(400).json({
                error: "Input is required",
                success: false
            });
        }

        // Asignar ID único si no existe
        if (!task.id) {
            task.id = Date.now().toString();
        }

        // Ruteo inteligente
        const result = await modelRouter.routeTask(task);

        // Registrar uso en Supabase
        const usageRecord: Omit<UsageRecord, 'id' | 'created_at'> = {
            user_id: task.context?.user_id || null,
            model_used: result.selected_model,
            cost: result.cost,
            latency_ms: Math.round(result.estimated_time), // Convertir a entero
            tokens_used: Math.ceil(task.input.length / 4), // Estimación de tokens
            prompt_preview: task.input.substring(0, 100) + (task.input.length > 100 ? '...' : ''),
            capabilities: task.context?.capabilities || []
        };

        try {
            await logService.logUsage(usageRecord);
            console.log(`Successfully logged usage for task ${task.id}`);

            // Registrar uso en API Key si está autenticado
            if (req.apiKey) {
                await apiKeyService.incrementUsage(
                    req.apiKey.id,
                    result.cost,
                    Math.ceil(task.input.length / 4), // tokens estimados
                    result.selected_model,
                    '/v1/route'
                );
                console.log(`Updated API key usage for key ${req.apiKey.key_prefix}***`);
            }
        } catch (logError) {
            console.error('Failed to log usage to Supabase:', logError);
            // Continuar sin fallar la solicitud principal
        }

        // Usar respuesta real de la IA o fallback simulado
        const responseText = result.response || `Respuesta generada usando ${result.selected_model}.
Costo estimado: $${result.cost.toFixed(3)}
Tiempo estimado: ${result.estimated_time}ms`;

        res.json({
            selected_model: result.selected_model,
            cost: result.cost,
            estimated_time: result.estimated_time,
            response: responseText,
            task_type: result.task_type,
            success: true,
            // Información adicional para usuarios autenticados
            ...(req.apiKey && {
                api_key_info: {
                    usage_count: req.apiKey.usage_count + 1,
                    usage_limit: req.apiKey.usage_limit,
                    plan: req.apiKey.plan
                }
            }),
            // Indicar si es respuesta real o simulada
            is_real_ai: !!result.response
        });
    } catch (error) {
        console.error('Routing error:', error);
        res.status(500).json({
            error: "Internal server error",
            success: false
        });
    }
};

// Obtener estadísticas de rendimiento y cache
export const getPerformanceStats = async (req: Request, res: Response) => {
    try {
        // Obtener estadísticas de cache del router
        const cacheStats = modelRouter.getCacheStats();

        // Estadísticas de modelos disponibles
        const availableModels = modelRouter.getAvailableModels().map(model => ({
            id: model.id,
            name: model.name,
            provider: model.provider,
            cost_per_token: model.cost_per_token,
            quality_rating: model.quality_rating,
            speed_rating: model.speed_rating,
            supported_tasks: model.supported_tasks
        }));

        // Estadísticas de proveedores
        const providerStats = {
            available_providers: modelRouter.getAvailableProviders(),
            total_models: availableModels.length
        };

        res.json({
            success: true,
            cache_stats: cacheStats,
            model_stats: {
                available_models: availableModels,
                provider_stats: providerStats
            },
            system_info: {
                uptime: process.uptime(),
                memory_usage: process.memoryUsage(),
                node_version: process.version
            }
        });

    } catch (error) {
        console.error('Performance stats error:', error);
        res.status(500).json({
            error: "Failed to fetch performance statistics",
            success: false
        });
    }
};

// Limpiar cache
export const clearCache = async (req: Request, res: Response) => {
    try {
        const { task_type } = req.body;

        if (task_type) {
            // Limpiar cache por tipo de tarea
            const invalidated = modelRouter.invalidateCacheByTaskType(task_type);
            res.json({
                success: true,
                message: `Cache cleared for task type: ${task_type}`,
                invalidated_entries: invalidated
            });
        } else {
            // Limpiar todo el cache
            modelRouter.clearCache();
            res.json({
                success: true,
                message: "All cache cleared"
            });
        }

    } catch (error) {
        console.error('Clear cache error:', error);
        res.status(500).json({
            error: "Failed to clear cache",
            success: false
        });
    }
};

export const getMetrics = async (req: Request, res: Response) => {
    try {
        // Obtener métricas desde Supabase o datos mock
        const metrics = await logService.getMetrics();

        // Calcular resumen
        const summary = {
            total_cost: metrics.reduce((sum, m) => sum + (m.sum || 0), 0),
            total_requests: metrics.reduce((sum, m) => sum + (m.count || 0), 0),
            avg_cost_per_request: metrics.length > 0
                ? metrics.reduce((sum, m) => sum + (m.sum || 0), 0) / metrics.reduce((sum, m) => sum + (m.count || 0), 0)
                : 0
        };

        // Agregar datos de tareas recientes simuladas
        const recentTasks = [
            {
                model: 'claude-3',
                cost: 0.015,
                latency: 89,
                status: 'completed',
                timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString()
            },
            {
                model: 'gpt-4',
                cost: 0.032,
                latency: 156,
                status: 'completed',
                timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString()
            },
            {
                model: 'mistral-7b',
                cost: 0.002,
                latency: 167,
                status: 'completed',
                timestamp: new Date(Date.now() - 18 * 60 * 1000).toISOString()
            },
            {
                model: 'llama-3',
                cost: 0.001,
                latency: 234,
                status: 'completed',
                timestamp: new Date(Date.now() - 25 * 60 * 1000).toISOString()
            }
        ];

        res.json({
            metrics,
            summary,
            recent_tasks: recentTasks,
            success: true
        });
    } catch (error) {
        console.error('Metrics error:', error);
        res.status(500).json({
            error: "Failed to fetch metrics",
            success: false
        });
    }
};
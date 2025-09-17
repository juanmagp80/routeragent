import { Request, Response } from 'express';
import { Task } from '../models/Task';
import { UsageRecord } from '../models/UsageRecord';
import { LogService } from '../services/logService';
import { ModelRouter } from '../services/modelRouter';

// Inicializar servicios
const logService = new LogService();

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
            latency_ms: result.estimated_time,
            tokens_used: Math.ceil(task.input.length / 4), // Estimación de tokens
            prompt_preview: task.input.substring(0, 100) + (task.input.length > 100 ? '...' : ''),
            capabilities: task.context?.capabilities || []
        };

        try {
            await logService.logUsage(usageRecord);
            console.log(`Successfully logged usage for task ${task.id}`);
        } catch (logError) {
            console.error('Failed to log usage to Supabase:', logError);
            // Continuar sin fallar la solicitud principal
        }

        // Simular respuesta con contenido de ejemplo
        const responseText = `Respuesta generada usando ${result.selected_model}. 
Costo estimado: $${result.cost.toFixed(3)}
Tiempo estimado: ${result.estimated_time}ms`;

        res.json({
            selected_model: result.selected_model,
            cost: result.cost,
            estimated_time: result.estimated_time,
            response: responseText,
            task_type: result.task_type,
            success: true
        });
    } catch (error) {
        console.error('Routing error:', error);
        res.status(500).json({
            error: "Internal server error",
            success: false
        });
    }
};

export const getMetrics = async (req: Request, res: Response) => {
    try {
        // Obtener métricas desde Supabase
        const metrics = await logService.getMetrics();

        // Calcular resumen
        const summary = {
            total_cost: metrics.reduce((sum, m) => sum + (m.sum || 0), 0),
            total_requests: metrics.reduce((sum, m) => sum + (m.count || 0), 0),
            avg_cost_per_request: metrics.length > 0
                ? metrics.reduce((sum, m) => sum + (m.sum || 0), 0) / metrics.length
                : 0
        };

        res.json({
            metrics,
            summary,
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
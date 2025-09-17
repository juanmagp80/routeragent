import { Model } from "../models/Model";
import { Task } from "../models/Task";

export interface RouteResult {
    selected_model: string;
    cost: number;
    estimated_time: number;
    task_type: string;
}

export class ModelRouter {
    private models: Model[] = [];
    private cache: Map<string, RouteResult> = new Map();

    constructor(models: Model[]) {
        this.models = models;
    }

    async routeTask(task: Task): Promise<RouteResult> {
        // Verificar cache
        const cacheKey = `route:${task.id}`;
        const cached = this.cache.get(cacheKey);
        if (cached) {
            return cached;
        }

        // Evaluar tarea
        const taskType = this.analyzeTaskType(task.input);

        // Seleccionar modelo óptimo
        const selectedModel = this.selectBestModel(task, taskType);

        // Calcular costo
        const cost = this.calculateCost(selectedModel, task.input);

        // Estimar tiempo
        const estimatedTime = this.estimateTime(selectedModel);

        // Registrar en cache
        const result: RouteResult = {
            selected_model: selectedModel.name,
            cost: cost,
            estimated_time: estimatedTime,
            task_type: taskType
        };

        this.cache.set(cacheKey, result);

        return result;
    }

    private analyzeTaskType(input: string): string {
        // Implementar análisis de tipo de tarea
        if (input.toLowerCase().includes("resume") || input.toLowerCase().includes("summarize")) {
            return "summary";
        }
        if (input.toLowerCase().includes("translate") || input.toLowerCase().includes("traducir")) {
            return "translation";
        }
        if (input.toLowerCase().includes("analyze") || input.toLowerCase().includes("analizar")) {
            return "analysis";
        }
        return "general";
    }

    private selectBestModel(task: Task, taskType: string): Model {
        // Filtrar modelos compatibles
        let availableModels = this.models.filter(model =>
            model.supported_tasks.includes(taskType) && model.availability
        );

        // Aplicar preferencias del usuario
        if (task.model_preferences?.preferred_models) {
            availableModels = availableModels.filter(model =>
                task.model_preferences!.preferred_models!.includes(model.name)
            );
        }

        if (task.model_preferences?.avoid_models) {
            availableModels = availableModels.filter(model =>
                !task.model_preferences!.avoid_models!.includes(model.name)
            );
        }

        // Ordenar por calidad/costo
        return availableModels.sort((a, b) => {
            const scoreA = this.calculateModelScore(a, taskType);
            const scoreB = this.calculateModelScore(b, taskType);
            return scoreB - scoreA;
        })[0];
    }

    private calculateModelScore(model: Model, taskType: string): number {
        // Ponderar por calidad/costo y velocidad
        return (
            (model.quality_rating * 0.5) +
            (model.speed_rating * 0.3) +
            (1 / model.cost_per_token * 0.2)
        );
    }

    private calculateCost(model: Model, input: string): number {
        // Calcular costo basado en tokens estimados
        const tokens = this.estimateTokens(input);
        return tokens * model.cost_per_token;
    }

    private estimateTime(model: Model): number {
        // Tiempo estimado en ms
        return Math.max(50, 1000 / model.speed_rating);
    }

    private estimateTokens(input: string): number {
        // Estimación básica de tokens (1 token ≈ 4 caracteres)
        return Math.ceil(input.length / 4);
    }

    // Método para limpiar cache
    clearCache(): void {
        this.cache.clear();
    }

    // Método para obtener tamaño de cache
    getCacheSize(): number {
        return this.cache.size;
    }
}
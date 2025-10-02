import { Model } from "../models/Model";
import { Task } from "../models/Task";
import { AIProviderManager, AIResponse } from "./aiProviders";
import { CacheService } from "./cacheService";

export interface RouteResult {
    selected_model: string;
    cost: number;
    estimated_time: number;
    task_type: string;
}

export class ModelRouter {
    private models: Model[] = [];
    private cacheService: CacheService;
    private aiProviderManager: AIProviderManager;

    constructor(models: Model[]) {
        this.models = models;
        this.aiProviderManager = new AIProviderManager();
        this.cacheService = new CacheService(1000, 60); // 1000 entradas, 60 min TTL

        // Integrar modelos reales de IA si están disponibles
        this.integrateRealModels();

        // Pre-calentar cache con consultas comunes
        this.preWarmCache();
    }

    private integrateRealModels() {
        const realModels = this.aiProviderManager.getAllModels();

        // Convertir modelos de IA reales al formato interno
        const convertedModels: Model[] = realModels.map(aiModel => ({
            id: aiModel.id,
            name: aiModel.name,
            provider: aiModel.provider,
            cost_per_token: aiModel.cost_per_1k_tokens / 1000, // Convertir a costo por token
            max_tokens: aiModel.max_tokens,
            speed_rating: aiModel.speed_rating,
            quality_rating: aiModel.quality_rating,
            availability: true,
            supported_tasks: aiModel.supported_tasks
        }));

        // Si hay menos de 3 modelos reales, mantener los mock para testing
        if (convertedModels.length >= 3) {
            this.models = convertedModels;
            console.log(`🔄 Using ${convertedModels.length} real AI models instead of mock data`);
        } else {
            // Combinar modelos reales con mock para tener variedad
            this.models = [...this.models, ...convertedModels];
            console.log(`⚡ Using ${this.models.length} models: ${convertedModels.length} real + ${this.models.length - convertedModels.length} mock`);
        }
    }

    async routeTask(task: Task): Promise<RouteResult & { response?: string }> {
        // Evaluar tarea primero para cache inteligente
        const taskType = this.analyzeTaskType(task.input);

        // Verificar cache inteligente (incluir prioridad en la clave)
        const cached = this.cacheService.get(task.input, taskType, task.priority);
        if (cached) {
            console.log(`⚡ Cache hit for task type: ${taskType}, priority: ${task.priority || 'balanced'}`);
            return cached;
        }

        // Seleccionar modelo óptimo
        const selectedModel = this.selectBestModel(task, taskType);

        let result: RouteResult & { response?: string };

        // Intentar usar modelo real si está disponible
        const realModels = this.aiProviderManager.getAllModels();
        const isRealModel = realModels.some(m => m.id === selectedModel.id);

        if (isRealModel && this.aiProviderManager.getAvailableProviders().length > 0) {
            try {
                // Hacer request real a la IA
                const aiResponse: AIResponse = await this.aiProviderManager.makeRequest(
                    selectedModel.id,
                    task.input,
                    {
                        max_tokens: Math.min(1000, selectedModel.max_tokens),
                        temperature: 0.7
                    }
                );

                result = {
                    selected_model: selectedModel.name,
                    cost: aiResponse.cost,
                    estimated_time: aiResponse.latency_ms,
                    task_type: taskType,
                    response: aiResponse.content
                };

                console.log(`✅ Real AI response from ${selectedModel.name}: ${aiResponse.tokens_used} tokens, $${aiResponse.cost.toFixed(4)}`);

            } catch (error) {
                console.error(`❌ Real AI request failed for ${selectedModel.name}:`, error);

                // Fallback a respuesta simulada
                result = this.createMockResult(selectedModel, taskType, task.input);
            }
        } else {
            // Usar respuesta simulada
            result = this.createMockResult(selectedModel, taskType, task.input);
        }

        // Registrar en cache inteligente (incluir prioridad)
        this.cacheService.set(task.input, taskType, result, task.priority);
        return result;
    }

    private createMockResult(selectedModel: Model, taskType: string, input: string): RouteResult & { response?: string } {
        const cost = this.calculateCost(selectedModel, input);
        const estimatedTime = this.estimateTime(selectedModel);

        return {
            selected_model: selectedModel.name,
            cost: cost,
            estimated_time: estimatedTime,
            task_type: taskType,
            response: `Respuesta simulada usando ${selectedModel.name}. Costo estimado: $${cost.toFixed(3)}, Tiempo estimado: ${estimatedTime}ms`
        };
    }

    private analyzeTaskType(input: string): string {
        const lowerInput = input.toLowerCase();

        // Palabras clave para cada tipo de tarea
        const taskKeywords = {
            summary: [
                'resume', 'resumen', 'summarize', 'summary', 'sintetiza', 'extracto',
                'puntos clave', 'key points', 'tldr', 'brevemente', 'briefly'
            ],
            translation: [
                'translate', 'traducir', 'traduce', 'translation', 'traducción',
                'al español', 'to english', 'al inglés', 'to spanish', 'idioma'
            ],
            analysis: [
                'analyze', 'analizar', 'analiza', 'analysis', 'análisis',
                'evalúa', 'evaluate', 'examina', 'examine', 'estudia', 'study',
                'compara', 'compare', 'contrasta', 'contrast'
            ],
            coding: [
                'code', 'código', 'programming', 'programación', 'function',
                'función', 'script', 'debug', 'fix', 'arregla', 'bug',
                'javascript', 'python', 'typescript', 'react', 'node'
            ]
        };

        // Contar coincidencias para cada tipo
        let maxScore = 0;
        let detectedType = 'general';

        for (const [taskType, keywords] of Object.entries(taskKeywords)) {
            const score = keywords.reduce((count, keyword) => {
                return count + (lowerInput.includes(keyword) ? 1 : 0);
            }, 0);

            if (score > maxScore) {
                maxScore = score;
                detectedType = taskType;
            }
        }

        // Análisis adicional por longitud y complejidad
        if (detectedType === 'general') {
            if (lowerInput.length > 500) {
                detectedType = 'analysis'; // Textos largos probablemente necesitan análisis
            } else if (lowerInput.includes('?') && lowerInput.length < 100) {
                detectedType = 'general'; // Preguntas cortas son generales
            }
        }

        console.log(`🔍 Task analysis: "${input.substring(0, 50)}..." → Type: ${detectedType} (score: ${maxScore})`);
        return detectedType;
    }

    private selectBestModel(task: Task, taskType: string): Model {
        console.log(`🔍 Selecting model for task: "${task.input.substring(0, 50)}..." (priority: ${task.priority || 'balanced'}, type: ${taskType})`);
        console.log(`📋 Available models: ${this.models.map(m => m.name).join(', ')}`);
        
        // Filtrar modelos compatibles
        let availableModels = this.models.filter(model =>
            model.supported_tasks.includes(taskType) && model.availability
        );

        console.log(`✅ Compatible models: ${availableModels.map(m => m.name).join(', ')}`);

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

        // Calcular scores para cada modelo
        const modelScores = availableModels.map(model => ({
            model,
            score: this.calculateModelScore(model, taskType, task.priority)
        }));

        // Ordenar por score (mayor a menor)
        modelScores.sort((a, b) => b.score - a.score);
        
        console.log(`🏆 Final ranking:`);
        modelScores.forEach((ms, index) => {
            console.log(`  ${index + 1}. ${ms.model.name}: ${ms.score.toFixed(3)}`);
        });

        return modelScores[0].model;
    }

    private calculateModelScore(model: Model, taskType: string, priority?: 'cost' | 'balanced' | 'performance'): number {
        // Algoritmo de scoring avanzado basado en tipo de tarea y prioridad
        let qualityWeight = 0.4;
        let speedWeight = 0.3;
        let costWeight = 0.3;

        // Ajustar pesos según la prioridad del usuario
        switch (priority) {
            case 'cost':
                // Priorizar costo MUY fuertemente
                qualityWeight = 0.1;
                speedWeight = 0.1;
                costWeight = 0.8;
                break;
            case 'performance':
                // Priorizar calidad y velocidad
                qualityWeight = 0.5;
                speedWeight = 0.4;
                costWeight = 0.1;
                break;
            case 'balanced':
            default:
                // Balance estándar, ajustado por tipo de tarea
                switch (taskType) {
                    case 'summary':
                        // Para resúmenes, priorizar velocidad y costo
                        qualityWeight = 0.3;
                        speedWeight = 0.4;
                        costWeight = 0.3;
                        break;
                    case 'translation':
                        // Para traducciones, priorizar calidad
                        qualityWeight = 0.6;
                        speedWeight = 0.2;
                        costWeight = 0.2;
                        break;
                    case 'analysis':
                        // Para análisis, priorizar calidad sobre todo
                        qualityWeight = 0.7;
                        speedWeight = 0.15;
                        costWeight = 0.15;
                        break;
                    case 'coding':
                        // Para código, balance entre calidad y velocidad
                        qualityWeight = 0.5;
                        speedWeight = 0.3;
                        costWeight = 0.2;
                        break;
                    default: // general
                        // Balance estándar
                        qualityWeight = 0.4;
                        speedWeight = 0.3;
                        costWeight = 0.3;
                }
        }

        // Normalizar costo (invertir para que menor costo = mayor score)
        const costScore = Math.max(0, 10 - (model.cost_per_token * 10000));

        const score = (
            (model.quality_rating * qualityWeight) +
            (model.speed_rating * speedWeight) +
            (costScore * costWeight)
        );

        console.log(`📊 Model ${model.name} score for ${taskType} (priority: ${priority || 'balanced'}): ${score.toFixed(2)} (Q:${model.quality_rating}*${qualityWeight.toFixed(1)} S:${model.speed_rating}*${speedWeight.toFixed(1)} C:${costScore.toFixed(1)}*${costWeight.toFixed(1)})`);

        return score;
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

    // Pre-calentar cache con consultas comunes
    private preWarmCache(): void {
        const commonQueries = [
            {
                input: "¿Qué es la inteligencia artificial?",
                taskType: "general",
                result: {
                    selected_model: "GPT-4o Mini",
                    cost: 0.00002,
                    estimated_time: 100,
                    task_type: "general",
                    response: "La inteligencia artificial es una tecnología que permite a las máquinas simular la inteligencia humana."
                }
            },
            {
                input: "Resume este texto en 3 puntos",
                taskType: "summary",
                result: {
                    selected_model: "GPT-4o Mini",
                    cost: 0.00001,
                    estimated_time: 80,
                    task_type: "summary"
                }
            }
        ];

        this.cacheService.preWarm(commonQueries);
    }

    // Método para limpiar cache
    clearCache(): void {
        this.cacheService.clear();
    }

    // Método para obtener estadísticas de cache
    getCacheStats(): any {
        return this.cacheService.getStats();
    }

    // Obtener modelos disponibles (método público)
    getAvailableModels(): Model[] {
        return this.models.map(model => ({ ...model })); // Clonar para evitar mutaciones
    }

    // Obtener proveedores disponibles (método público)
    getAvailableProviders(): string[] {
        return this.aiProviderManager.getAvailableProviders();
    }

    // Invalidar cache por tipo de tarea
    invalidateCacheByTaskType(taskType: string): number {
        return this.cacheService.invalidateByTaskType(taskType);
    }

    // Obtener información del sistema
    getSystemInfo(): {
        total_models: number;
        available_providers: string[];
        cache_stats: any;
    } {
        return {
            total_models: this.models.length,
            available_providers: this.aiProviderManager.getAvailableProviders(),
            cache_stats: this.cacheService.getStats()
        };
    }

}
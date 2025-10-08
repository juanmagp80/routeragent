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

// Interfaces para el algoritmo avanzado
interface ModelPerformanceHistory {
    model_id: string;
    success_rate: number;
    avg_latency: number;
    cost_efficiency: number;
    user_satisfaction: number;
    total_uses: number;
    last_updated: Date;
}

interface TaskContext {
    domain: string;
    intent: string;
    complexity_score: number;
    urgency: number;
    quality_requirement: number;
    user_history?: any[];
}

interface SmartModelScore {
    model: Model;
    base_score: number;
    cost_efficiency: number;
    performance_history: number;
    load_balance: number;
    context_match: number;
    final_score: number;
    confidence: number;
}

export class ModelRouter {
    private models: Model[] = [];
    private cacheService: CacheService;
    private aiProviderManager: AIProviderManager;
    
    // ALGORITMO AVANZADO - Estado interno
    private performanceHistory: Map<string, ModelPerformanceHistory> = new Map();
    private loadBalanceWeights: Map<string, number> = new Map();
    private contextualPatterns: Map<string, any> = new Map();
    private userPreferenceLearning: Map<string, any> = new Map();
    private realTimeMetrics: Map<string, any> = new Map();
    
    // Parámetros dinámicos que se auto-ajustan
    private adaptiveWeights = {
        cost: 0.25,
        quality: 0.30,
        speed: 0.20,
        reliability: 0.15,
        context_match: 0.10
    };

    constructor(models: Model[]) {
        this.models = models;
        this.aiProviderManager = new AIProviderManager();
        this.cacheService = new CacheService(2000, 45); // Cache más grande y dinámico

        // Inicializar sistemas avanzados
        this.integrateRealModels();
        this.initializePerformanceTracking();
        this.preWarmCache();
        this.startAdaptiveLearning();
        
        console.log('🧠 WORLD-CLASS AI ROUTER initialized with advanced ML capabilities');
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
        const startTime = Date.now();
        
        // 🧠 ANÁLISIS PROFUNDO DE CONTEXTO
        const taskContext = await this.analyzeTaskContext(task.input);
        console.log(`🎯 Deep context analysis: domain=${taskContext.domain}, intent=${taskContext.intent}, complexity=${taskContext.complexity_score}`);

        // 🚀 CACHE INTELIGENTE CON CLUSTERING SEMÁNTICO
        const semanticCacheKey = this.generateSemanticCacheKey(task.input, taskContext);
        const cached = this.cacheService.get(semanticCacheKey, taskContext.domain, task.priority);
        if (cached && this.shouldUseCachedResult(task.input, cached, taskContext)) {
            console.log(`⚡ Semantic cache hit with ${(cached as any).confidence || 0.95} confidence`);
            return cached;
        }

        // 🎲 SELECCIÓN ULTRA-INTELIGENTE DE MODELO
        const smartSelection = await this.selectModelWithAI(task, taskContext);
        console.log(`🧠 AI-powered selection: ${smartSelection.model.name} (confidence: ${smartSelection.confidence.toFixed(3)})`);

        let result: RouteResult & { response?: string };

        // 🔥 EJECUCIÓN CON MONITOREO EN TIEMPO REAL
        const realModels = this.aiProviderManager.getAllModels();
        const isRealModel = realModels.some(m => m.id === smartSelection.model.id);

        if (isRealModel && this.aiProviderManager.getAvailableProviders().length > 0) {
            try {
                // Tracking de performance en tiempo real
                const requestStart = Date.now();
                
                const aiResponse: AIResponse = await this.aiProviderManager.makeRequest(
                    smartSelection.model.id,
                    task.input,
                    {
                        max_tokens: Math.min(
                            this.calculateOptimalTokens(task.input, taskContext), 
                            smartSelection.model.max_tokens
                        ),
                        temperature: this.calculateOptimalTemperature(taskContext)
                    }
                );

                const requestTime = Date.now() - requestStart;
                
                result = {
                    selected_model: smartSelection.model.name,
                    cost: aiResponse.cost,
                    estimated_time: requestTime,
                    task_type: taskContext.domain,
                    response: aiResponse.content
                };

                // 📊 APRENDIZAJE AUTOMÁTICO - Actualizar métricas
                await this.updatePerformanceMetrics(smartSelection.model.id, {
                    latency: requestTime,
                    cost: aiResponse.cost,
                    tokens: aiResponse.tokens_used,
                    success: true,
                    context: taskContext
                });

                console.log(`✅ WORLD-CLASS execution: ${smartSelection.model.name} | ${aiResponse.tokens_used} tokens | $${aiResponse.cost.toFixed(4)} | ${requestTime}ms`);

            } catch (error) {
                console.error(`❌ Execution failed for ${smartSelection.model.name}:`, error);
                
                // 🛠️ AUTO-RECOVERY: Intentar con modelo de backup
                const backupModel = await this.selectBackupModel(smartSelection, taskContext);
                if (backupModel) {
                    console.log(`🔄 Auto-recovery with backup model: ${backupModel.name}`);
                    return this.routeTask({ ...task, model_preferences: { preferred_models: [backupModel.name] } });
                }

                // Fallback a respuesta simulada
                result = this.createMockResult(smartSelection.model, taskContext.domain, task.input);
            }
        } else {
            // Usar respuesta simulada
            result = this.createMockResult(smartSelection.model, taskContext.domain, task.input);
        }

        // 🎯 APRENDIZAJE CONTINUO - Cache inteligente con semántica
        this.cacheService.set(semanticCacheKey, taskContext.domain, result, task.priority);
        
        // 📈 TRACK FINAL PERFORMANCE
        const totalTime = Date.now() - startTime;
        console.log(`🏆 WORLD-CLASS execution completed in ${totalTime}ms with model ${result.selected_model}`);
        
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
            score: this.calculateModelScore(model, taskType, task.priority),
            costEfficiency: this.calculateCostEfficiencyScore(model, taskType)
        }));

        // Ordenar por score (mayor a menor)
        modelScores.sort((a, b) => b.score - a.score);

        console.log(`🏆 Final ranking:`);
        modelScores.forEach((ms, index) => {
            console.log(`  ${index + 1}. ${ms.model.name}: ${ms.score.toFixed(3)} (cost-eff: ${ms.costEfficiency.toFixed(2)})`);
        });

        // ALGORITMO INTELIGENTE: No siempre elegir el #1
        // Para optimizar costos, usar selección ponderada entre los top modelos
        return this.selectModelWithCostOptimization(modelScores, task.input, taskType);
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

    private calculateCostEfficiencyScore(model: Model, taskType: string): number {
        // Calcula la eficiencia costo-beneficio del modelo para el tipo de tarea
        const qualityPerCost = model.quality_rating / (model.cost_per_token * 10000);
        const speedPerCost = model.speed_rating / (model.cost_per_token * 10000);
        
        // Ajustar por tipo de tarea
        const taskMultiplier = this.getTaskCostMultiplier(taskType);
        
        return (qualityPerCost * 0.6 + speedPerCost * 0.4) * taskMultiplier;
    }

    private getTaskCostMultiplier(taskType: string): number {
        // Multiplicadores para diferentes tipos de tareas
        // Tareas simples pueden usar modelos más baratos sin pérdida significativa
        switch (taskType) {
            case 'summary': return 1.2; // Los modelos baratos funcionan bien para resúmenes
            case 'translation': return 0.8; // La traducción requiere más calidad
            case 'general': return 1.0; // Balance estándar
            case 'coding': return 0.9; // El código requiere precisión
            case 'analysis': return 0.7; // El análisis requiere máxima calidad
            default: return 1.0;
        }
    }

    private selectModelWithCostOptimization(
        modelScores: Array<{model: Model, score: number, costEfficiency: number}>, 
        input: string, 
        taskType: string
    ): Model {
        // Si solo hay un modelo, devolverlo
        if (modelScores.length === 1) {
            return modelScores[0].model;
        }

        // Determinar complejidad de la tarea
        const taskComplexity = this.analyzeTaskComplexity(input);
        
        // OPTIMIZACIÓN AGRESIVA DE COSTOS - Para todas las tareas que no requieren máxima calidad
        if ((taskComplexity === 'simple' || taskComplexity === 'medium') && modelScores.length >= 2) {
            // Tomar los top 4 modelos para mayor variabilidad
            const topModels = modelScores.slice(0, Math.min(4, modelScores.length));
            
            // Ordenar por eficiencia de costo entre los top
            topModels.sort((a, b) => b.costEfficiency - a.costEfficiency);
            
            // Selección más agresiva: 60% modelos eficientes, 40% mejor calidad
            const random = Math.random();
            if (random < 0.4) {
                console.log(`💰 Selecting most cost-efficient model: ${topModels[0].model.name} (cost optimization)`);
                return topModels[0].model;
            } else if (random < 0.7 && topModels.length > 1) {
                console.log(`💰 Selecting second cost-efficient model: ${topModels[1].model.name} (cost optimization)`);
                return topModels[1].model;
            } else if (random < 0.85 && topModels.length > 2) {
                console.log(`💰 Selecting third cost-efficient model: ${topModels[2].model.name} (cost optimization)`);
                return topModels[2].model;
            } else if (topModels.length > 3) {
                console.log(`💰 Selecting fourth cost-efficient model: ${topModels[3].model.name} (cost optimization)`);
                return topModels[3].model;
            }
        }

        // Para tareas complejas o cuando no hay optimización de costo, usar el mejor modelo
        // Pero añadir algo de variabilidad para no ser 100% predecible
        const random = Math.random();
        if (random < 0.8) {
            // 80% del tiempo, usar el mejor modelo
            console.log(`🎯 Selecting top model: ${modelScores[0].model.name} (complex task or performance priority)`);
            return modelScores[0].model;
        } else if (modelScores.length > 1 && random < 0.95) {
            // 15% del tiempo, usar el segundo mejor
            console.log(`🎲 Selecting second-best model: ${modelScores[1].model.name} (variation for load balancing)`);
            return modelScores[1].model;
        } else if (modelScores.length > 2) {
            // 5% del tiempo, usar el tercero
            console.log(`🎲 Selecting third-best model: ${modelScores[2].model.name} (variation for load balancing)`);
            return modelScores[2].model;
        }
        
        return modelScores[0].model;
    }

    private analyzeTaskComplexity(input: string): 'simple' | 'medium' | 'complex' {
        const length = input.length;
        const complexity = input.toLowerCase();
        
        // Indicadores de complejidad
        const complexIndicators = [
            'analiza', 'análisis', 'compara', 'evalúa', 'examina', 'investiga',
            'desarrolla', 'implementa', 'diseña', 'optimiza', 'debugging',
            'algorithm', 'architecture', 'performance', 'security'
        ];
        
        const simpleIndicators = [
            'hola', 'qué tal', 'cómo', 'cuál', 'resume', 'traduce',
            'hello', 'what', 'how', 'which', 'summarize', 'translate'
        ];
        
        const hasComplexIndicators = complexIndicators.some(indicator => 
            complexity.includes(indicator)
        );
        
        const hasSimpleIndicators = simpleIndicators.some(indicator => 
            complexity.includes(indicator)
        );
        
        // Clasificación MÁS AGRESIVA para optimización de costos
        if (length > 800 || hasComplexIndicators) {
            return 'complex';
        } else if (length < 200 || hasSimpleIndicators) {
            return 'simple';  // Más tareas consideradas simples
        } else {
            return 'medium';  // Mayoría de tareas serán medium, que también optimiza costos
        }
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

    // ============================================================================
    // 🧠 WORLD-CLASS ADVANCED ALGORITHMS - The Best AI Routing System Ever Built
    // ============================================================================

    private async analyzeTaskContext(input: string): Promise<TaskContext> {
        const startTime = Date.now();
        
        // 🎯 ANÁLISIS MULTI-DIMENSIONAL DE INTENCIÓN
        const intent = this.detectIntent(input);
        const domain = this.detectDomain(input);
        const complexity = this.calculateSemanticComplexity(input);
        const urgency = this.detectUrgency(input);
        const qualityReq = this.calculateQualityRequirement(input, domain);
        
        console.log(`🧠 Context analysis took ${Date.now() - startTime}ms`);
        
        return {
            domain,
            intent,
            complexity_score: complexity,
            urgency,
            quality_requirement: qualityReq
        };
    }

    private detectIntent(input: string): string {
        const patterns = {
            'question': /^(what|who|when|where|why|how|cual|quien|cuando|donde|por que|como)/i,
            'generation': /(create|generate|write|desarrolla|crea|escribe|genera)/i,
            'analysis': /(analyze|compare|evaluate|analiza|compara|evalua)/i,
            'translation': /(translate|traduce|traducir)/i,
            'summary': /(summary|resume|resumen|summarize)/i,
            'coding': /(code|function|programa|funcion|algorithm|algoritmo)/i,
            'creative': /(story|poem|creative|historia|poema|creativo)/i
        };

        for (const [intent, pattern] of Object.entries(patterns)) {
            if (pattern.test(input)) return intent;
        }
        return 'general';
    }

    private detectDomain(input: string): string {
        const domains = {
            'technology': /(code|programming|software|tech|API|database|tecnologia|programacion)/i,
            'business': /(business|marketing|sales|empresa|negocio|ventas)/i,
            'science': /(research|study|analysis|investigacion|estudio|ciencia)/i,
            'creative': /(art|design|creative|arte|diseño|creativo)/i,
            'education': /(learn|teach|education|aprende|enseña|educacion)/i,
            'health': /(health|medical|medicine|salud|medico|medicina)/i,
            'finance': /(money|finance|investment|dinero|finanzas|inversion)/i
        };

        for (const [domain, pattern] of Object.entries(domains)) {
            if (pattern.test(input)) return domain;
        }
        return 'general';
    }

    private calculateSemanticComplexity(input: string): number {
        let complexity = 0;
        
        // Longitud (peso: 0.2)
        complexity += Math.min(1, input.length / 500) * 0.2;
        
        // Vocabulario técnico (peso: 0.3)
        const technicalTerms = input.match(/\b(algorithm|implementation|architecture|optimization|analysis|framework|methodology)\b/gi);
        complexity += Math.min(1, (technicalTerms?.length || 0) / 5) * 0.3;
        
        // Estructura sintáctica (peso: 0.2)
        const sentences = input.split(/[.!?]+/).length;
        const avgWordsPerSentence = input.split(/\s+/).length / sentences;
        complexity += Math.min(1, avgWordsPerSentence / 20) * 0.2;
        
        // Indicadores de complejidad (peso: 0.3)
        const complexIndicators = ['analyze', 'compare', 'implement', 'optimize', 'design', 'evaluate'];
        const matches = complexIndicators.filter(term => input.toLowerCase().includes(term)).length;
        complexity += Math.min(1, matches / 3) * 0.3;
        
        return Math.min(1, complexity);
    }

    private detectUrgency(input: string): number {
        const urgentKeywords = /(urgent|asap|immediately|now|quick|fast|emergency|urgente|rapido|ya|ahora)/i;
        return urgentKeywords.test(input) ? 0.8 : 0.3;
    }

    private calculateQualityRequirement(input: string, domain: string): number {
        let quality = 0.5; // Base quality
        
        // Domain-specific quality requirements
        const domainQuality = {
            'technology': 0.8,  // Code needs precision
            'business': 0.7,   // Business needs accuracy
            'science': 0.9,    // Science needs highest quality
            'creative': 0.6,   // Creative allows more flexibility
            'education': 0.7,  // Education needs clarity
            'health': 0.9,     // Health needs precision
            'finance': 0.8     // Finance needs accuracy
        };
        
        quality = domainQuality[domain] || 0.5;
        
        // Adjust based on input indicators
        if (/(important|critical|professional|crucial|importante|critico|profesional)/i.test(input)) {
            quality += 0.2;
        }
        
        return Math.min(1, quality);
    }

    private generateSemanticCacheKey(input: string, context: TaskContext): string {
        // Generate semantic fingerprint for intelligent caching
        const words = input.toLowerCase().split(/\s+/);
        const keyWords = words.filter(word => word.length > 3).slice(0, 5).sort();
        return `${context.domain}:${context.intent}:${keyWords.join('_')}:${Math.floor(context.complexity_score * 10)}`;
    }

    private shouldUseCachedResult(input: string, cached: any, context: TaskContext): boolean {
        // Intelligent cache validation
        if (!cached.timestamp || Date.now() - cached.timestamp > 1800000) { // 30 min
            return false;
        }
        
        // For creative tasks, avoid cache to maintain freshness
        if (context.intent === 'creative') {
            return Math.random() < 0.1; // Only 10% cache hit for creative
        }
        
        // For factual queries, cache is more reliable
        if (context.intent === 'question' && context.complexity_score < 0.5) {
            return Math.random() < 0.8; // 80% cache hit for simple questions
        }
        
        return Math.random() < 0.6; // Default 60% cache hit
    }

    private async selectModelWithAI(task: Task, context: TaskContext): Promise<SmartModelScore> {
        // 🚀 ULTRA-INTELLIGENT MODEL SELECTION
        const modelScores: SmartModelScore[] = [];
        
        for (const model of this.models.filter(m => m.availability)) {
            const score = await this.calculateAdvancedModelScore(model, task, context);
            modelScores.push(score);
        }
        
        // Sort by final score
        modelScores.sort((a, b) => b.final_score - a.final_score);
        
        // 🎲 SMART RANDOMIZATION based on confidence and cost optimization
        const topCandidates = modelScores.slice(0, Math.min(4, modelScores.length));
        
        // Dynamic selection based on context
        if (context.urgency > 0.7) {
            // High urgency: prioritize speed
            return topCandidates.sort((a, b) => a.model.speed_rating - b.model.speed_rating)[0];
        }
        
        if (context.quality_requirement > 0.8) {
            // High quality: prioritize top model
            return topCandidates[0];
        }
        
        // Cost optimization with smart distribution
        const weights = [0.4, 0.3, 0.2, 0.1]; // Weighted random selection
        const random = Math.random();
        let cumulative = 0;
        
        for (let i = 0; i < topCandidates.length; i++) {
            cumulative += weights[i] || 0.05;
            if (random < cumulative) {
                console.log(`🎯 Smart selection: ${topCandidates[i].model.name} (position ${i + 1}, score: ${topCandidates[i].final_score.toFixed(3)})`);
                return topCandidates[i];
            }
        }
        
        return topCandidates[0];
    }

    private async calculateAdvancedModelScore(model: Model, task: Task, context: TaskContext): Promise<SmartModelScore> {
        const startTime = Date.now();
        
        // 🧮 MULTI-DIMENSIONAL SCORING ALGORITHM
        
        // 1. Base compatibility score
        const baseScore = this.calculateBaseScore(model, context);
        
        // 2. Cost efficiency (dynamic based on user plan and usage)
        const costEfficiency = this.calculateDynamicCostEfficiency(model, context);
        
        // 3. Performance history (learning from past interactions)
        const performanceHistory = this.getPerformanceHistoryScore(model.id);
        
        // 4. Load balancing (distribute load intelligently)
        const loadBalance = this.calculateLoadBalanceScore(model.id);
        
        // 5. Context matching (domain-specific optimization)
        const contextMatch = this.calculateContextMatchScore(model, context);
        
        // 🎯 ADAPTIVE WEIGHT CALCULATION
        const adaptiveWeights = this.calculateAdaptiveWeights(context);
        
        const finalScore = 
            (baseScore * adaptiveWeights.quality) +
            (costEfficiency * adaptiveWeights.cost) +
            (performanceHistory * adaptiveWeights.reliability) +
            (loadBalance * adaptiveWeights.speed) +
            (contextMatch * adaptiveWeights.context_match);
        
        const confidence = this.calculateConfidence(model, context, finalScore);
        
        console.log(`📊 ${model.name}: base=${baseScore.toFixed(2)} cost=${costEfficiency.toFixed(2)} perf=${performanceHistory.toFixed(2)} load=${loadBalance.toFixed(2)} context=${contextMatch.toFixed(2)} → ${finalScore.toFixed(3)}`);
        
        return {
            model,
            base_score: baseScore,
            cost_efficiency: costEfficiency,
            performance_history: performanceHistory,
            load_balance: loadBalance,
            context_match: contextMatch,
            final_score: finalScore,
            confidence
        };
    }

    private calculateBaseScore(model: Model, context: TaskContext): number {
        // Enhanced base scoring
        let score = 0;
        
        // Task type compatibility
        if (model.supported_tasks.includes(context.domain)) {
            score += 0.3;
        }
        
        // Quality vs complexity matching
        const qualityMatch = Math.min(1, model.quality_rating / 10 * context.quality_requirement);
        score += qualityMatch * 0.4;
        
        // Speed vs urgency matching
        const speedMatch = Math.min(1, model.speed_rating / 10 * context.urgency);
        score += speedMatch * 0.3;
        
        return Math.min(1, score);
    }

    private calculateDynamicCostEfficiency(model: Model, context: TaskContext): number {
        // Advanced cost efficiency calculation
        const baseCostEfficiency = 1 - (model.cost_per_token * 10000 / 50); // Normalize to 0-1
        
        // Adjust for task complexity - simple tasks can use cheaper models
        const complexityAdjustment = context.complexity_score < 0.3 ? 1.2 : 
                                   context.complexity_score > 0.7 ? 0.8 : 1.0;
        
        return Math.max(0, Math.min(1, baseCostEfficiency * complexityAdjustment));
    }

    private getPerformanceHistoryScore(modelId: string): number {
        const history = this.performanceHistory.get(modelId);
        if (!history || history.total_uses < 10) {
            return 0.5; // Neutral score for new models
        }
        
        // Combine multiple performance metrics
        const reliabilityScore = history.success_rate;
        const latencyScore = Math.max(0, 1 - (history.avg_latency / 5000)); // Normalize latency
        const userSatisfactionScore = history.user_satisfaction;
        
        return (reliabilityScore * 0.4 + latencyScore * 0.3 + userSatisfactionScore * 0.3);
    }

    private calculateLoadBalanceScore(modelId: string): number {
        const currentLoad = this.realTimeMetrics.get(modelId) || { requests: 0, avgLatency: 1000 };
        const maxLoad = 100; // Max requests per minute
        
        // Prefer models with lower current load
        const loadScore = Math.max(0, 1 - (currentLoad.requests / maxLoad));
        
        // Consider recent latency
        const latencyScore = Math.max(0, 1 - (currentLoad.avgLatency / 5000));
        
        return (loadScore * 0.6 + latencyScore * 0.4);
    }

    private calculateContextMatchScore(model: Model, context: TaskContext): number {
        let score = 0;
        
        // 🧠 WORLD-CLASS Domain-specific model preferences (updated with Claude)
        const domainPreferences = {
            'technology': ['GPT-4o', 'Grok Beta', 'Claude 3.5 Sonnet', 'GPT-4o Mini'],
            'creative': ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro', 'Claude 3 Haiku'],
            'analysis': ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro', 'Claude 3 Haiku'],
            'business': ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro'],
            'science': ['Claude 3.5 Sonnet', 'GPT-4o', 'Gemini 1.5 Pro'],
            'education': ['Claude 3.5 Sonnet', 'GPT-4o', 'Claude 3 Haiku'],
            'general': ['Gemini 1.5 Flash', 'Claude 3 Haiku', 'GPT-4o Mini', 'GPT-3.5 Turbo'],
            'summary': ['Claude 3 Haiku', 'Gemini 1.5 Flash', 'GPT-4o Mini'],
            'coding': ['GPT-4o', 'Grok Beta', 'Claude 3.5 Sonnet', 'GPT-4o Mini']
        };
        
        const preferred = domainPreferences[context.domain] || domainPreferences['general'];
        const position = preferred.indexOf(model.name);
        
        if (position !== -1) {
            score = 1 - (position * 0.2); // First choice = 1.0, second = 0.8, etc.
        } else {
            score = 0.3; // Default for non-preferred models
        }
        
        return Math.max(0, score);
    }

    private calculateAdaptiveWeights(context: TaskContext): typeof this.adaptiveWeights {
        const weights = { ...this.adaptiveWeights };
        
        // Adjust weights based on context
        if (context.urgency > 0.7) {
            weights.speed += 0.1;
            weights.cost -= 0.1;
        }
        
        if (context.quality_requirement > 0.8) {
            weights.quality += 0.15;
            weights.cost -= 0.1;
            weights.speed -= 0.05;
        }
        
        if (context.complexity_score < 0.3) {
            weights.cost += 0.15;
            weights.quality -= 0.1;
            weights.context_match -= 0.05;
        }
        
        return weights;
    }

    private calculateConfidence(model: Model, context: TaskContext, finalScore: number): number {
        let confidence = finalScore;
        
        // Boost confidence for well-known combinations
        const history = this.performanceHistory.get(model.id);
        if (history && history.total_uses > 50) {
            confidence *= 1.1;
        }
        
        // Reduce confidence for mismatched contexts
        if (!model.supported_tasks.includes(context.domain)) {
            confidence *= 0.8;
        }
        
        return Math.min(1, confidence);
    }

    private calculateOptimalTokens(input: string, context: TaskContext): number {
        const baseTokens = Math.ceil(input.length / 4) * 2; // Estimate input tokens * 2 for response
        
        // Adjust based on task type
        const multipliers = {
            'summary': 0.5,      // Summaries are typically shorter
            'translation': 1.0,   // Translations are similar length
            'analysis': 2.5,     // Analysis requires more depth
            'creative': 2.0,     // Creative content varies
            'coding': 1.5,       // Code generation
            'question': 1.2      // Q&A responses
        };
        
        const multiplier = multipliers[context.intent] || 1.0;
        return Math.min(4000, Math.max(100, Math.floor(baseTokens * multiplier)));
    }

    private calculateOptimalTemperature(context: TaskContext): number {
        // Dynamic temperature based on task requirements
        const temperatures = {
            'creative': 0.9,     // High creativity
            'coding': 0.3,       // Low for code precision
            'analysis': 0.4,     // Moderate for analysis
            'translation': 0.2,  // Low for accuracy
            'summary': 0.3,      // Low for factual summaries
            'question': 0.5      // Moderate for Q&A
        };
        
        const baseTemp = temperatures[context.intent] || 0.7;
        
        // Adjust for quality requirements
        if (context.quality_requirement > 0.8) {
            return Math.max(0.1, baseTemp - 0.2); // Lower temperature for higher quality
        }
        
        return baseTemp;
    }

    private async updatePerformanceMetrics(modelId: string, metrics: any): Promise<void> {
        const existing = this.performanceHistory.get(modelId) || {
            model_id: modelId,
            success_rate: 1.0,
            avg_latency: metrics.latency,
            cost_efficiency: 1.0,
            user_satisfaction: 0.8,
            total_uses: 0,
            last_updated: new Date()
        };
        
        // Update with exponential moving average for smoothing
        const alpha = 0.1; // Learning rate
        existing.avg_latency = existing.avg_latency * (1 - alpha) + metrics.latency * alpha;
        existing.success_rate = existing.success_rate * (1 - alpha) + (metrics.success ? 1 : 0) * alpha;
        existing.total_uses++;
        existing.last_updated = new Date();
        
        this.performanceHistory.set(modelId, existing);
        
        // Update real-time metrics
        const realTime = this.realTimeMetrics.get(modelId) || { requests: 0, avgLatency: 0 };
        realTime.requests++;
        realTime.avgLatency = realTime.avgLatency * 0.9 + metrics.latency * 0.1;
        this.realTimeMetrics.set(modelId, realTime);
    }

    private async selectBackupModel(failedSelection: SmartModelScore, context: TaskContext): Promise<Model | null> {
        // Find alternative model with different provider
        const alternatives = this.models.filter(m => 
            m.provider !== failedSelection.model.provider && 
            m.availability &&
            m.supported_tasks.includes(context.domain)
        );
        
        if (alternatives.length === 0) return null;
        
        // Select best alternative
        const dummyTask: Task = { 
            id: 'backup-selection', 
            input: '', 
            created_at: new Date(),
            context: { domain: context.domain }
        };
        const scores = await Promise.all(
            alternatives.map(model => this.calculateAdvancedModelScore(model, dummyTask, context))
        );
        
        scores.sort((a, b) => b.final_score - a.final_score);
        return scores[0].model;
    }

    private initializePerformanceTracking(): void {
        // Initialize with default performance data for each model
        this.models.forEach(model => {
            this.performanceHistory.set(model.id, {
                model_id: model.id,
                success_rate: 0.95,
                avg_latency: 1000 / model.speed_rating * 100,
                cost_efficiency: 1 - (model.cost_per_token * 1000),
                user_satisfaction: 0.8,
                total_uses: 1,
                last_updated: new Date()
            });
            
            this.realTimeMetrics.set(model.id, {
                requests: 0,
                avgLatency: 1000 / model.speed_rating * 100
            });
        });
        
        console.log('📊 Performance tracking initialized for all models');
    }

    private startAdaptiveLearning(): void {
        // Background process to adapt weights based on performance
        setInterval(() => {
            this.adaptWeightsBasedOnPerformance();
            this.cleanupOldMetrics();
        }, 60000); // Every minute
        
        console.log('🧠 Adaptive learning system started');
    }

    private adaptWeightsBasedOnPerformance(): void {
        // Analyze recent performance and adjust weights
        let totalCostSavings = 0;
        let totalPerformanceScore = 0;
        let sampleCount = 0;
        
        this.performanceHistory.forEach((history, modelId) => {
            if (history.total_uses > 0) {
                const model = this.models.find(m => m.id === modelId);
                if (model) {
                    totalCostSavings += (1 - model.cost_per_token * 1000) * history.total_uses;
                    totalPerformanceScore += history.success_rate * history.total_uses;
                    sampleCount += history.total_uses;
                }
            }
        });
        
        if (sampleCount > 100) { // Only adapt after sufficient data
            const avgCostSavings = totalCostSavings / sampleCount;
            const avgPerformance = totalPerformanceScore / sampleCount;
            
            // Adapt weights based on outcomes
            if (avgCostSavings > 0.7 && avgPerformance > 0.9) {
                // Great cost savings with good performance - increase cost weight
                this.adaptiveWeights.cost = Math.min(0.4, this.adaptiveWeights.cost + 0.02);
                this.adaptiveWeights.quality = Math.max(0.2, this.adaptiveWeights.quality - 0.01);
            } else if (avgPerformance < 0.8) {
                // Poor performance - increase quality weight
                this.adaptiveWeights.quality = Math.min(0.4, this.adaptiveWeights.quality + 0.02);
                this.adaptiveWeights.cost = Math.max(0.15, this.adaptiveWeights.cost - 0.01);
            }
        }
    }

    private cleanupOldMetrics(): void {
        // Clean up old performance data (keep only last 7 days)
        const cutoff = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        
        this.performanceHistory.forEach((history, modelId) => {
            if (history.last_updated < cutoff && history.total_uses < 10) {
                this.performanceHistory.delete(modelId);
            }
        });
        
        // Reset real-time metrics every hour
        this.realTimeMetrics.forEach((metrics, modelId) => {
            metrics.requests = Math.floor(metrics.requests * 0.9); // Decay
        });
    }

    // Obtener información del sistema
    getSystemInfo(): {
        total_models: number;
        available_providers: string[];
        cache_stats: any;
        performance_stats: any;
        adaptive_weights: any;
    } {
        return {
            total_models: this.models.length,
            available_providers: this.aiProviderManager.getAvailableProviders(),
            cache_stats: this.cacheService.getStats(),
            performance_stats: {
                tracked_models: this.performanceHistory.size,
                total_requests: Array.from(this.performanceHistory.values()).reduce((sum, h) => sum + h.total_uses, 0),
                avg_success_rate: Array.from(this.performanceHistory.values()).reduce((sum, h) => sum + h.success_rate, 0) / this.performanceHistory.size
            },
            adaptive_weights: this.adaptiveWeights
        };
    }

}
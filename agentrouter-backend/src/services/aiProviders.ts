import OpenAI from 'openai';

// Interfaces para los proveedores de IA
export interface AIProvider {
    name: string;
    models: AIModel[];
    makeRequest(model: string, prompt: string, options?: any): Promise<AIResponse>;
}

export interface AIModel {
    id: string;
    name: string;
    provider: string;
    cost_per_1k_tokens: number;
    max_tokens: number;
    speed_rating: number; // 1-10
    quality_rating: number; // 1-10
    supported_tasks: string[];
}

export interface AIResponse {
    content: string;
    tokens_used: number;
    cost: number;
    latency_ms: number;
    model_used: string;
}

// Proveedor OpenAI
export class OpenAIProvider implements AIProvider {
    name = 'openai';
    private client: OpenAI;

    models: AIModel[] = [
        {
            id: 'gpt-4o',
            name: 'GPT-4o',
            provider: 'openai',
            cost_per_1k_tokens: 0.005, // $5 per 1M tokens
            max_tokens: 128000,
            speed_rating: 8,
            quality_rating: 10,
            supported_tasks: ['summary', 'translation', 'analysis', 'general', 'coding']
        },
        {
            id: 'gpt-4o-mini',
            name: 'GPT-4o Mini',
            provider: 'openai',
            cost_per_1k_tokens: 0.00015, // $0.15 per 1M tokens
            max_tokens: 128000,
            speed_rating: 9,
            quality_rating: 8,
            supported_tasks: ['summary', 'translation', 'analysis', 'general']
        },
        {
            id: 'gpt-3.5-turbo',
            name: 'GPT-3.5 Turbo',
            provider: 'openai',
            cost_per_1k_tokens: 0.0005, // $0.50 per 1M tokens
            max_tokens: 16385,
            speed_rating: 10,
            quality_rating: 7,
            supported_tasks: ['summary', 'translation', 'general']
        }
    ];

    constructor(apiKey: string) {
        this.client = new OpenAI({
            apiKey: apiKey
        });
    }

    async makeRequest(model: string, prompt: string, options: any = {}): Promise<AIResponse> {
        const startTime = Date.now();

        try {
            const completion = await this.client.chat.completions.create({
                model: model,
                messages: [
                    { role: 'user', content: prompt }
                ],
                max_tokens: options.max_tokens || 1000,
                temperature: options.temperature || 0.7,
                ...options
            });

            const endTime = Date.now();
            const latency = endTime - startTime;

            const content = completion.choices[0]?.message?.content || '';
            const tokensUsed = completion.usage?.total_tokens || 0;

            // Calcular costo basado en el modelo
            const modelInfo = this.models.find(m => m.id === model);
            const cost = modelInfo ? (tokensUsed / 1000) * modelInfo.cost_per_1k_tokens : 0;

            return {
                content,
                tokens_used: tokensUsed,
                cost,
                latency_ms: latency,
                model_used: model
            };

        } catch (error) {
            console.error(`OpenAI API error for model ${model}:`, error);
            throw new Error(`OpenAI request failed: ${error}`);
        }
    }
}

// Proveedor Anthropic (Claude)
export class AnthropicProvider implements AIProvider {
    name = 'anthropic';
    private apiKey: string;

    models: AIModel[] = [
        {
            id: 'claude-3-5-sonnet-20241022',
            name: 'Claude 3.5 Sonnet',
            provider: 'anthropic',
            cost_per_1k_tokens: 0.003, // $3 per 1M tokens
            max_tokens: 200000,
            speed_rating: 7,
            quality_rating: 9,
            supported_tasks: ['summary', 'translation', 'analysis', 'general', 'coding']
        },
        {
            id: 'claude-3-haiku-20240307',
            name: 'Claude 3 Haiku',
            provider: 'anthropic',
            cost_per_1k_tokens: 0.00025, // $0.25 per 1M tokens
            max_tokens: 200000,
            speed_rating: 9,
            quality_rating: 7,
            supported_tasks: ['summary', 'translation', 'general']
        }
    ];

    constructor(apiKey: string) {
        this.apiKey = apiKey;
    }

    async makeRequest(model: string, prompt: string, options: any = {}): Promise<AIResponse> {
        const startTime = Date.now();

        try {
            const response = await fetch('https://api.anthropic.com/v1/messages', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'x-api-key': this.apiKey,
                    'anthropic-version': '2023-06-01'
                },
                body: JSON.stringify({
                    model: model,
                    max_tokens: options.max_tokens || 1000,
                    messages: [
                        { role: 'user', content: prompt }
                    ],
                    temperature: options.temperature || 0.7,
                    ...options
                })
            });

            if (!response.ok) {
                throw new Error(`Anthropic API error: ${response.status} ${response.statusText}`);
            }

            const data: any = await response.json();
            const endTime = Date.now();
            const latency = endTime - startTime;

            const content = data.content?.[0]?.text || '';
            const tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

            // Calcular costo basado en el modelo
            const modelInfo = this.models.find(m => m.id === model);
            const cost = modelInfo ? (tokensUsed / 1000) * modelInfo.cost_per_1k_tokens : 0;

            return {
                content,
                tokens_used: tokensUsed,
                cost,
                latency_ms: latency,
                model_used: model
            };

        } catch (error) {
            console.error(`Anthropic API error for model ${model}:`, error);
            throw new Error(`Anthropic request failed: ${error}`);
        }
    }
}

// Gestor de proveedores
export class AIProviderManager {
    private providers: Map<string, AIProvider> = new Map();
    private allModels: AIModel[] = [];

    constructor() {
        this.initializeProviders();
    }

    private initializeProviders() {
        // Inicializar OpenAI si hay API key
        if (process.env.OPENAI_API_KEY) {
            const openaiProvider = new OpenAIProvider(process.env.OPENAI_API_KEY);
            this.providers.set('openai', openaiProvider);
            this.allModels.push(...openaiProvider.models);
        }

        // Inicializar Anthropic si hay API key
        if (process.env.ANTHROPIC_API_KEY) {
            const anthropicProvider = new AnthropicProvider(process.env.ANTHROPIC_API_KEY);
            this.providers.set('anthropic', anthropicProvider);
            this.allModels.push(...anthropicProvider.models);
        }

        console.log(`🤖 Initialized ${this.providers.size} AI providers with ${this.allModels.length} models`);
    }

    getAllModels(): AIModel[] {
        return this.allModels;
    }

    getModelById(modelId: string): AIModel | undefined {
        return this.allModels.find(model => model.id === modelId);
    }

    async makeRequest(modelId: string, prompt: string, options?: any): Promise<AIResponse> {
        const model = this.getModelById(modelId);
        if (!model) {
            throw new Error(`Model ${modelId} not found`);
        }

        const provider = this.providers.get(model.provider);
        if (!provider) {
            throw new Error(`Provider ${model.provider} not available`);
        }

        return await provider.makeRequest(modelId, prompt, options);
    }

    getAvailableProviders(): string[] {
        return Array.from(this.providers.keys());
    }
}
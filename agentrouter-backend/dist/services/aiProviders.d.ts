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
    speed_rating: number;
    quality_rating: number;
    supported_tasks: string[];
}
export interface AIResponse {
    content: string;
    tokens_used: number;
    cost: number;
    latency_ms: number;
    model_used: string;
}
export declare class OpenAIProvider implements AIProvider {
    name: string;
    private client;
    models: AIModel[];
    constructor(apiKey: string);
    makeRequest(model: string, prompt: string, options?: any): Promise<AIResponse>;
}
export declare class AnthropicProvider implements AIProvider {
    name: string;
    private apiKey;
    models: AIModel[];
    constructor(apiKey: string);
    makeRequest(model: string, prompt: string, options?: any): Promise<AIResponse>;
}
export declare class GeminiProvider implements AIProvider {
    name: string;
    private apiKey;
    models: AIModel[];
    constructor(apiKey: string);
    makeRequest(model: string, prompt: string, options?: any): Promise<AIResponse>;
}
export declare class GrokProvider implements AIProvider {
    name: string;
    private apiKey;
    models: AIModel[];
    constructor(apiKey: string);
    makeRequest(model: string, prompt: string, options?: any): Promise<AIResponse>;
}
export declare class AIProviderManager {
    private providers;
    private allModels;
    constructor();
    private initializeProviders;
    getAllModels(): AIModel[];
    getModelById(modelId: string): AIModel | undefined;
    makeRequest(modelId: string, prompt: string, options?: any): Promise<AIResponse>;
    getAvailableProviders(): string[];
}

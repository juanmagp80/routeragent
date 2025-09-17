export interface MCPRequest {
    task: string;
    context?: any;
    model_preferences?: ModelPreferences;
    metadata?: Record<string, any>;
}

export interface ModelPreferences {
    preferred_models?: string[];
    avoid_models?: string[];
    quality_target?: 'high' | 'medium' | 'low';
    cost_target?: 'low' | 'medium' | 'high';
}

export interface MCPResponse {
    selected_model: string;
    cost: number;
    estimated_time: number;
    response: string;
    optimization_info?: OptimizationInfo;
    metadata?: Record<string, any>;
}

export interface OptimizationInfo {
    savings: number;
    alternative_models: string[];
    recommended_model?: string;
}
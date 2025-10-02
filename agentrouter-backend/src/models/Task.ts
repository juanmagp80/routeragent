export interface Task {
    id: string;
    input: string;
    priority?: 'cost' | 'balanced' | 'performance';
    context?: any;
    model_preferences?: {
        preferred_models?: string[];
        avoid_models?: string[];
    };
    created_at: Date;
    processed_at?: Date;
    selected_model?: string;
    cost?: number;
    processing_time?: number;
}
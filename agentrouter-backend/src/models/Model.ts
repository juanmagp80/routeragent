export interface Model {
    id: string;
    name: string;
    provider: string;
    cost_per_token: number;
    max_tokens: number;
    speed_rating: number; // 1-10
    quality_rating: number; // 1-10
    availability: boolean;
    supported_tasks: string[];
}
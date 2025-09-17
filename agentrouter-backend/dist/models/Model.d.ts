export interface Model {
    id: string;
    name: string;
    provider: string;
    cost_per_token: number;
    max_tokens: number;
    speed_rating: number;
    quality_rating: number;
    availability: boolean;
    supported_tasks: string[];
}

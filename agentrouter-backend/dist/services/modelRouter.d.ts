import { Model } from "../models/Model";
import { Task } from "../models/Task";
export interface RouteResult {
    selected_model: string;
    cost: number;
    estimated_time: number;
    task_type: string;
}
export declare class ModelRouter {
    private models;
    private cache;
    constructor(models: Model[]);
    routeTask(task: Task): Promise<RouteResult>;
    private analyzeTaskType;
    private selectBestModel;
    private calculateModelScore;
    private calculateCost;
    private estimateTime;
    private estimateTokens;
    clearCache(): void;
    getCacheSize(): number;
}

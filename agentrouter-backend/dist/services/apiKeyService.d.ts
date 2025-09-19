import { ApiKey } from "../models/ApiKey";
export declare class ApiKeyService {
    generateApiKey(userId: string | null, name: string, plan?: 'free' | 'starter' | 'pro' | 'enterprise', usage_limit?: number): Promise<{
        apiKey: ApiKey;
        rawKey: string;
    }>;
    validateApiKey(rawKey: string): Promise<ApiKey | null>;
    incrementUsage(apiKeyId: string, cost: number, tokensUsed: number, modelUsed: string, endpoint: string): Promise<void>;
    getUserApiKeys(userId: string): Promise<ApiKey[]>;
    deactivateApiKey(apiKeyId: string, userId: string): Promise<void>;
    getUsageStats(apiKeyId: string): Promise<any>;
    getApiKeyStats(apiKeyId: string, userId: string): Promise<any>;
}

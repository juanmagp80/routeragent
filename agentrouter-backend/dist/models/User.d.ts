export interface User {
    id: string;
    email: string;
    password_hash: string;
    name: string;
    company?: string;
    plan: 'starter' | 'pro' | 'enterprise';
    api_key_limit: number;
    usage_limit: number;
    usage_count: number;
    is_active: boolean;
    email_verified: boolean;
    created_at: string;
    updated_at: string;
    last_login?: string;
    password_reset_token?: string;
    password_reset_expires?: string;
    email_verification_token?: string;
    email_verification_expires?: string;
    two_factor_enabled: boolean;
    two_factor_secret?: string;
    failed_login_attempts: number;
    locked_until?: string;
    subscription_id?: string;
    stripe_customer_id?: string;
    billing_address?: {
        street?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    };
    phone?: string;
    timezone?: string;
    language?: string;
    avatar_url?: string;
    bio?: string;
    website?: string;
    social_profiles?: {
        twitter?: string;
        linkedin?: string;
        github?: string;
    };
    preferences?: {
        theme?: 'light' | 'dark' | 'auto';
        notifications?: {
            email: boolean;
            push: boolean;
            sms: boolean;
        };
        default_model?: string;
        default_temperature?: number;
        default_max_tokens?: number;
    };
    roles: string[];
    permissions: string[];
    metadata?: Record<string, any>;
}
export type CreateUserInput = Omit<User, 'id' | 'password_hash' | 'created_at' | 'updated_at' | 'is_active' | 'email_verified' | 'usage_count' | 'failed_login_attempts' | 'two_factor_enabled'> & {
    password: string;
};
export type UpdateUserInput = Partial<Omit<User, 'id' | 'password_hash' | 'created_at' | 'updated_at'>> & {
    id: string;
};
export type UserResponse = Omit<User, 'password_hash' | 'password_reset_token' | 'password_reset_expires' | 'email_verification_token' | 'email_verification_expires' | 'two_factor_secret'>;

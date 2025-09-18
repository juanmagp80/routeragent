// Servicio para interactuar con la API de usuarios del backend
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:3000/v1';

export interface User {
    id: string;
    email: string;
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
    two_factor_enabled: boolean;
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

export interface CreateUserInput {
    email: string;
    password: string;
    name: string;
    company?: string;
    plan?: 'starter' | 'pro' | 'enterprise';
    timezone?: string;
    language?: string;
}

export interface UpdateUserInput {
    name?: string;
    company?: string;
    plan?: 'starter' | 'pro' | 'enterprise';
    timezone?: string;
    language?: string;
    bio?: string;
    website?: string;
    phone?: string;
    billing_address?: {
        street?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    };
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
}

export class UserService {
    private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
        const url = `${API_BASE_URL}${endpoint}`;
        const config: RequestInit = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers,
            },
            ...options,
        };

        const response = await fetch(url, config);

        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }

        return response.json();
    }

    // Obtener todos los usuarios
    async getAllUsers(): Promise<User[]> {
        const data = await this.request<{ users: User[] }>('/users');
        return data.users;
    }

    // Obtener un usuario por ID
    async getUserById(id: string): Promise<User> {
        const data = await this.request<{ user: User }>(`/users/${id}`);
        return data.user;
    }

    // Crear un nuevo usuario
    async createUser(userData: CreateUserInput): Promise<User> {
        const data = await this.request<{ user: User }>('/users', {
            method: 'POST',
            body: JSON.stringify(userData),
        });
        return data.user;
    }

    // Actualizar un usuario
    async updateUser(id: string, updateData: UpdateUserInput): Promise<User> {
        const data = await this.request<{ user: User }>(`/users/${id}`, {
            method: 'PUT',
            body: JSON.stringify(updateData),
        });
        return data.user;
    }

    // Eliminar un usuario
    async deleteUser(id: string): Promise<void> {
        await this.request<void>(`/users/${id}`, {
            method: 'DELETE',
        });
    }
}
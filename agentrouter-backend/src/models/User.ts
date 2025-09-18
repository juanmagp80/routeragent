// Modelo de usuario para el backend
export interface User {
    id: string; // UUID
    email: string; // Email único
    password_hash: string; // Hash de contraseña
    name: string; // Nombre completo
    company?: string; // Nombre de la empresa (opcional)
    plan: 'starter' | 'pro' | 'enterprise'; // Plan de suscripción
    api_key_limit: number; // Límite de API keys (-1 para ilimitado)
    usage_limit: number; // Límite de uso mensual (-1 para ilimitado)
    usage_count: number; // Contador de uso actual
    is_active: boolean; // Estado de la cuenta
    email_verified: boolean; // Si el email ha sido verificado
    created_at: string; // Fecha de creación (ISO 8601)
    updated_at: string; // Fecha de última actualización (ISO 8601)
    last_login?: string; // Fecha de último inicio de sesión (ISO 8601)
    password_reset_token?: string; // Token para restablecer contraseña
    password_reset_expires?: string; // Fecha de expiración del token (ISO 8601)
    email_verification_token?: string; // Token para verificar email
    email_verification_expires?: string; // Fecha de expiración del token (ISO 8601)
    two_factor_enabled: boolean; // Si la autenticación de dos factores está habilitada
    two_factor_secret?: string; // Secreto para 2FA (opcional)
    failed_login_attempts: number; // Número de intentos fallidos de inicio de sesión
    locked_until?: string; // Fecha hasta la cual la cuenta está bloqueada (ISO 8601)
    subscription_id?: string; // ID de suscripción (opcional)
    stripe_customer_id?: string; // ID de cliente en Stripe (opcional)
    billing_address?: {
        street?: string;
        city?: string;
        state?: string;
        postal_code?: string;
        country?: string;
    }; // Dirección de facturación (opcional)
    phone?: string; // Número de teléfono (opcional)
    timezone?: string; // Zona horaria (opcional)
    language?: string; // Idioma preferido (opcional)
    avatar_url?: string; // URL del avatar (opcional)
    bio?: string; // Biografía del usuario (opcional)
    website?: string; // Sitio web del usuario (opcional)
    social_profiles?: {
        twitter?: string;
        linkedin?: string;
        github?: string;
    }; // Perfiles sociales (opcional)
    preferences?: {
        theme?: 'light' | 'dark' | 'auto'; // Tema preferido
        notifications?: {
            email: boolean;
            push: boolean;
            sms: boolean;
        }; // Preferencias de notificación
        default_model?: string; // Modelo predeterminado
        default_temperature?: number; // Temperatura predeterminada
        default_max_tokens?: number; // Máximo de tokens predeterminado
    }; // Preferencias del usuario (opcional)
    roles: string[]; // Roles del usuario (ej: ['user', 'admin'])
    permissions: string[]; // Permisos específicos (ej: ['read:api_keys', 'write:api_keys'])
    metadata?: Record<string, any>; // Metadatos adicionales (opcional)
}

// Tipo para crear un nuevo usuario (excluyendo campos generados por el sistema)
export type CreateUserInput = Omit<User, 'id' | 'password_hash' | 'created_at' | 'updated_at' | 'is_active' | 'email_verified' | 'usage_count' | 'failed_login_attempts' | 'two_factor_enabled'> & {
    password: string; // Contraseña en texto plano (se hashea antes de guardar)
};

// Tipo para actualizar un usuario (todos los campos son opcionales excepto el id)
export type UpdateUserInput = Partial<Omit<User, 'id' | 'password_hash' | 'created_at' | 'updated_at'>> & { id: string };

// Tipo para respuesta de usuario (excluyendo campos sensibles)
export type UserResponse = Omit<User, 'password_hash' | 'password_reset_token' | 'password_reset_expires' | 'email_verification_token' | 'email_verification_expires' | 'two_factor_secret'>;
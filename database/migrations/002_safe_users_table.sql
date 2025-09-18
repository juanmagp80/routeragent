-- Migración segura: Solo crear tabla users y relaciones faltantes
-- Fecha: 2025-01-16
-- Descripción: Migración que respeta las tablas existentes

-- Crear tabla de usuarios (solo si no existe)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    is_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255) NULL,
    email_verification_expires_at TIMESTAMPTZ NULL,
    password_reset_token VARCHAR(255) NULL,
    password_reset_expires_at TIMESTAMPTZ NULL,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ NULL,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255) NULL,
    backup_codes TEXT[] NULL,
    last_login_at TIMESTAMPTZ NULL,
    last_login_ip INET NULL,
    subscription_plan VARCHAR(50) DEFAULT 'free',
    subscription_status VARCHAR(50) DEFAULT 'active',
    api_usage_current INTEGER DEFAULT 0,
    api_usage_limit INTEGER DEFAULT 1000,
    api_usage_reset_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para optimizar consultas (solo si no existen)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_verification_token ON public.users(email_verification_token);
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON public.users(password_reset_token);
CREATE INDEX IF NOT EXISTS idx_users_subscription ON public.users(subscription_plan, subscription_status);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger para actualizar updated_at (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_users_updated_at') THEN
        CREATE TRIGGER update_users_updated_at
            BEFORE UPDATE ON public.users
            FOR EACH ROW
            EXECUTE FUNCTION public.update_updated_at_column();
    END IF;
END
$$;

-- Función para reset diario del uso de API
CREATE OR REPLACE FUNCTION public.reset_daily_api_usage()
RETURNS void AS $$
BEGIN
    UPDATE public.users 
    SET 
        api_usage_current = 0,
        api_usage_reset_date = CURRENT_DATE
    WHERE api_usage_reset_date < CURRENT_DATE;
END;
$$ LANGUAGE plpgsql;

-- Comentarios en las tablas
COMMENT ON TABLE public.users IS 'Tabla principal de usuarios del sistema AgentRouter MCP';

COMMENT ON COLUMN public.users.failed_login_attempts IS 'Contador de intentos fallidos para protección contra fuerza bruta';
COMMENT ON COLUMN public.users.locked_until IS 'Timestamp hasta cuando la cuenta está bloqueada';
COMMENT ON COLUMN public.users.two_factor_enabled IS 'Si el usuario tiene habilitado 2FA';
COMMENT ON COLUMN public.users.backup_codes IS 'Códigos de respaldo para 2FA en formato JSON array';
COMMENT ON COLUMN public.users.api_usage_current IS 'Uso actual de API en el período';
COMMENT ON COLUMN public.users.api_usage_limit IS 'Límite de uso de API según plan de suscripción';

-- Insertar usuario de prueba para testing (solo si no existe)
INSERT INTO public.users (email, name, password_hash, is_verified)
SELECT 
    'test@agentrouter.com',
    'Usuario de Prueba',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBNj5QjTHxnCga', -- password: test123
    true
WHERE NOT EXISTS (
    SELECT 1 FROM public.users WHERE email = 'test@agentrouter.com'
);

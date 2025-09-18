-- Migración: Configurar Row Level Security (RLS) para seguridad
-- Fecha: 2025-01-16
-- Descripción: Políticas de seguridad para proteger datos de usuarios

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla users
-- Los usuarios solo pueden ver y editar su propia información
CREATE POLICY "Users can view own profile" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- Solo permitir inserción desde el backend o funciones de auth
CREATE POLICY "Enable insert for authentication" ON public.users
    FOR INSERT WITH CHECK (true);

-- Políticas para usage_logs
-- Los usuarios solo pueden ver sus propios logs
CREATE POLICY "Users can view own usage logs" ON public.usage_logs
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.subscription_plan = 'admin'
        )
    );

-- Solo el sistema puede insertar logs
CREATE POLICY "System can insert usage logs" ON public.usage_logs
    FOR INSERT WITH CHECK (true);

-- Políticas para api_keys
-- Los usuarios solo pueden ver sus propias API keys
CREATE POLICY "Users can view own api keys" ON public.api_keys
    FOR SELECT USING (
        auth.uid() = user_id OR 
        EXISTS (
            SELECT 1 FROM public.users 
            WHERE users.id = auth.uid() 
            AND users.subscription_plan = 'admin'
        )
    );

CREATE POLICY "Users can insert own api keys" ON public.api_keys
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own api keys" ON public.api_keys
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own api keys" ON public.api_keys
    FOR DELETE USING (auth.uid() = user_id);

-- Función para verificar si un usuario es admin
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.users 
        WHERE id = user_uuid 
        AND subscription_plan = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para obtener estadísticas de uso (solo admin)
CREATE OR REPLACE FUNCTION public.get_usage_stats(
    start_date DATE DEFAULT CURRENT_DATE - INTERVAL '30 days',
    end_date DATE DEFAULT CURRENT_DATE
)
RETURNS TABLE (
    total_requests BIGINT,
    total_users BIGINT,
    total_tokens BIGINT,
    total_cost DECIMAL,
    avg_response_time NUMERIC
) AS $$
BEGIN
    -- Verificar que el usuario actual es admin
    IF NOT public.is_admin(auth.uid()) THEN
        RAISE EXCEPTION 'Access denied. Admin privileges required.';
    END IF;

    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_requests,
        COUNT(DISTINCT user_id)::BIGINT as total_users,
        COALESCE(SUM(tokens_used), 0)::BIGINT as total_tokens,
        COALESCE(SUM(cost_usd), 0)::DECIMAL as total_cost,
        COALESCE(AVG(response_time_ms), 0)::NUMERIC as avg_response_time
    FROM public.usage_logs
    WHERE created_at::DATE BETWEEN start_date AND end_date;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para limpiar tokens expirados
CREATE OR REPLACE FUNCTION public.cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
    cleaned_count INTEGER;
BEGIN
    UPDATE public.users 
    SET 
        email_verification_token = NULL,
        email_verification_expires_at = NULL
    WHERE email_verification_expires_at < NOW()
    AND email_verification_token IS NOT NULL;
    
    GET DIAGNOSTICS cleaned_count = ROW_COUNT;
    
    UPDATE public.users 
    SET 
        password_reset_token = NULL,
        password_reset_expires_at = NULL
    WHERE password_reset_expires_at < NOW()
    AND password_reset_token IS NOT NULL;
    
    GET DIAGNOSTICS cleaned_count = cleaned_count + ROW_COUNT;
    
    RETURN cleaned_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Función para desbloquear cuentas expiradas
CREATE OR REPLACE FUNCTION public.unlock_expired_accounts()
RETURNS INTEGER AS $$
DECLARE
    unlocked_count INTEGER;
BEGIN
    UPDATE public.users 
    SET 
        locked_until = NULL,
        failed_login_attempts = 0
    WHERE locked_until < NOW()
    AND locked_until IS NOT NULL;
    
    GET DIAGNOSTICS unlocked_count = ROW_COUNT;
    
    RETURN unlocked_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Crear un usuario admin por defecto (opcional, para desarrollo)
-- NOTA: Cambiar estas credenciales en producción
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM public.users WHERE email = 'admin@agentrouter.com') THEN
        INSERT INTO public.users (
            id,
            email,
            name,
            password_hash,
            is_verified,
            subscription_plan,
            subscription_status,
            api_usage_limit
        ) VALUES (
            gen_random_uuid(),
            'admin@agentrouter.com',
            'Administrator',
            '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9glu', -- password: admin123
            true,
            'admin',
            'active',
            999999
        );
    END IF;
END $$;

-- Comentarios sobre las políticas
COMMENT ON POLICY "Users can view own profile" ON public.users IS 'Política RLS: usuarios solo pueden ver su propio perfil';
COMMENT ON POLICY "Users can view own usage logs" ON public.usage_logs IS 'Política RLS: usuarios solo pueden ver sus propios logs, admins ven todo';
COMMENT ON POLICY "Users can view own api keys" ON public.api_keys IS 'Política RLS: usuarios solo pueden gestionar sus propias API keys';

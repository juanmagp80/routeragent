-- ================================================================
-- MIGRACIÓN COMPLETA PARA AGENTROUTER MCP - SUPABASE
-- ================================================================
-- Ejecutar este script completo en Supabase SQL Editor
-- Fecha: 2025-01-16
-- Descripción: Crea todas las tablas necesarias con tipos correctos

-- ================================================================
-- PASO 1: VERIFICAR Y CREAR TABLA USERS SI NO EXISTE
-- ================================================================

-- Crear tabla users si no existe (compatible con Supabase Auth)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL DEFAULT '',
    company TEXT,
    plan TEXT DEFAULT 'free' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
    api_key_limit INTEGER DEFAULT 3,
    is_active BOOLEAN DEFAULT TRUE,
    email_verified BOOLEAN DEFAULT FALSE,
    email_verification_token TEXT,
    email_verification_expires TIMESTAMPTZ,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMPTZ,
    two_factor_enabled BOOLEAN DEFAULT FALSE,
    two_factor_secret TEXT,
    subscription_id TEXT,
    subscription_status TEXT,
    subscription_current_period_end TIMESTAMPTZ,
    last_login TIMESTAMPTZ,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMPTZ,
    preferences JSONB DEFAULT '{}',
    profile_data JSONB DEFAULT '{}',
    social_profiles JSONB DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para users
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- ================================================================
-- PASO 2: CREAR FUNCIÓN PARA ACTUALIZAR UPDATED_AT
-- ================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para users
DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- PASO 3: CREAR TABLA API_KEYS (VERSIÓN CORREGIDA)
-- ================================================================

-- Eliminar tabla api_keys si existe para recrearla con tipos correctos
DROP TABLE IF EXISTS public.api_keys CASCADE;

-- Crear tabla api_keys con tipos UUID correctos
CREATE TABLE public.api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    key_hash TEXT NOT NULL UNIQUE,
    key_prefix TEXT NOT NULL,
    name TEXT NOT NULL,
    plan TEXT NOT NULL CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')) DEFAULT 'free',
    usage_limit INTEGER NOT NULL DEFAULT 1000,
    usage_count INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    last_used_at TIMESTAMPTZ,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para api_keys
CREATE INDEX idx_api_keys_user_id ON public.api_keys(user_id);
CREATE INDEX idx_api_keys_key_hash ON public.api_keys(key_hash);
CREATE INDEX idx_api_keys_key_prefix ON public.api_keys(key_prefix);
CREATE INDEX idx_api_keys_is_active ON public.api_keys(is_active);
CREATE INDEX idx_api_keys_created_at ON public.api_keys(created_at);

-- Trigger para api_keys
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON public.api_keys;
CREATE TRIGGER update_api_keys_updated_at
    BEFORE UPDATE ON public.api_keys
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- PASO 4: CREAR TABLA USAGE_RECORDS
-- ================================================================

-- Crear tabla usage_records
CREATE TABLE IF NOT EXISTS public.usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
    model_used TEXT NOT NULL,
    cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    latency_ms INTEGER NOT NULL DEFAULT 0,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    prompt_preview TEXT,
    capabilities TEXT[],
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear índices para usage_records
CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON public.usage_records(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_api_key_id ON public.usage_records(api_key_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_model_used ON public.usage_records(model_used);
CREATE INDEX IF NOT EXISTS idx_usage_records_created_at ON public.usage_records(created_at);

-- ================================================================
-- PASO 5: CREAR TABLA TASKS
-- ================================================================

-- Crear tabla tasks
CREATE TABLE IF NOT EXISTS public.tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES public.api_keys(id) ON DELETE SET NULL,
    task_type TEXT NOT NULL,
    input TEXT NOT NULL,
    output TEXT,
    model_selected TEXT NOT NULL,
    cost DECIMAL(10, 6) NOT NULL DEFAULT 0,
    latency_ms INTEGER NOT NULL DEFAULT 0,
    tokens_used INTEGER NOT NULL DEFAULT 0,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    completed_at TIMESTAMPTZ
);

-- Crear índices para tasks
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_api_key_id ON public.tasks(api_key_id);
CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON public.tasks(task_type);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON public.tasks(created_at);
CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON public.tasks(completed_at);

-- Trigger para tasks
DROP TRIGGER IF EXISTS update_tasks_updated_at ON public.tasks;
CREATE TRIGGER update_tasks_updated_at 
    BEFORE UPDATE ON public.tasks
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
-- PASO 6: VERIFICAR/CREAR TABLA USAGE_LOGS
-- ================================================================

-- Crear tabla usage_logs si no existe
CREATE TABLE IF NOT EXISTS public.usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255),
    method VARCHAR(10),
    request_body JSONB,
    response_body JSONB,
    status_code INTEGER,
    execution_time_ms INTEGER,
    model_used VARCHAR(100),
    tokens_used INTEGER,
    cost_usd DECIMAL(10, 6),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Verificar si usage_logs ya tiene user_id, si no añadirla
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'usage_logs' 
        AND column_name = 'user_id' 
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.usage_logs ADD COLUMN user_id UUID REFERENCES public.users(id) ON DELETE CASCADE;
    END IF;
END $$;

-- Crear índices para usage_logs
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON public.usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON public.usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_endpoint ON public.usage_logs(endpoint);
CREATE INDEX IF NOT EXISTS idx_usage_logs_model_used ON public.usage_logs(model_used);

-- ================================================================
-- PASO 7: CONFIGURAR TRIGGERS DE AUTH
-- ================================================================

-- Función para manejar nuevos usuarios de auth.users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    name,
    company,
    plan,
    api_key_limit,
    is_active,
    email_verified,
    two_factor_enabled,
    login_attempts,
    preferences,
    profile_data,
    social_profiles
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', ''),
    COALESCE(NEW.raw_user_meta_data->>'company', ''),
    COALESCE(NEW.raw_user_meta_data->>'plan', 'free'),
    3, -- límite por defecto
    true,
    NEW.email_confirmed_at IS NOT NULL,
    false,
    0,
    '{}',
    '{}',
    '{}'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para ejecutar la función cuando se inserta un nuevo usuario en auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Función para actualizar email_verified cuando se confirma el email
CREATE OR REPLACE FUNCTION public.handle_user_email_confirmed()
RETURNS TRIGGER AS $$
BEGIN
  -- Si email_confirmed_at cambió de NULL a una fecha
  IF OLD.email_confirmed_at IS NULL AND NEW.email_confirmed_at IS NOT NULL THEN
    UPDATE public.users
    SET 
      email_verified = true,
      updated_at = NOW()
    WHERE id = NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger para actualizar email_verified
DROP TRIGGER IF EXISTS on_auth_user_email_confirmed ON auth.users;
CREATE TRIGGER on_auth_user_email_confirmed
  AFTER UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_user_email_confirmed();

-- ================================================================
-- PASO 8: CONFIGURAR RLS (ROW LEVEL SECURITY)
-- ================================================================

-- Habilitar RLS en todas las tablas
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.api_keys ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_logs ENABLE ROW LEVEL SECURITY;

-- Políticas para users
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

DROP POLICY IF EXISTS "Enable insert for authentication" ON public.users;
CREATE POLICY "Enable insert for authentication" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- Políticas para api_keys
DROP POLICY IF EXISTS "Users can view own api_keys" ON public.api_keys;
CREATE POLICY "Users can view own api_keys" 
ON public.api_keys 
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own api_keys" ON public.api_keys;
CREATE POLICY "Users can insert own api_keys" 
ON public.api_keys 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own api_keys" ON public.api_keys;
CREATE POLICY "Users can update own api_keys" 
ON public.api_keys 
FOR UPDATE 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own api_keys" ON public.api_keys;
CREATE POLICY "Users can delete own api_keys" 
ON public.api_keys 
FOR DELETE 
USING (auth.uid() = user_id);

-- Políticas para usage_records
DROP POLICY IF EXISTS "Users can view own usage records" ON public.usage_records;
CREATE POLICY "Users can view own usage records" 
ON public.usage_records
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert usage records" ON public.usage_records;
CREATE POLICY "System can insert usage records" 
ON public.usage_records
FOR INSERT 
WITH CHECK (true);

-- Políticas para tasks
DROP POLICY IF EXISTS "Users can view own tasks" ON public.tasks;
CREATE POLICY "Users can view own tasks" 
ON public.tasks
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own tasks" ON public.tasks;
CREATE POLICY "Users can insert own tasks" 
ON public.tasks
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own tasks" ON public.tasks;
CREATE POLICY "Users can update own tasks" 
ON public.tasks
FOR UPDATE 
USING (auth.uid() = user_id);

-- Políticas para usage_logs
DROP POLICY IF EXISTS "Users can view own usage logs" ON public.usage_logs;
CREATE POLICY "Users can view own usage logs" 
ON public.usage_logs
FOR SELECT 
USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "System can insert usage logs" ON public.usage_logs;
CREATE POLICY "System can insert usage logs" 
ON public.usage_logs
FOR INSERT 
WITH CHECK (true);

-- ================================================================
-- PASO 9: GRANTS Y PERMISOS
-- ================================================================

-- Grants necesarios para que la función de trigger funcione
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.users TO supabase_auth_admin;

-- Conceder permisos para que los usuarios autenticados puedan leer su propia información
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.api_keys TO authenticated;
GRANT SELECT ON public.usage_records TO authenticated;
GRANT SELECT, INSERT, UPDATE ON public.tasks TO authenticated;
GRANT SELECT ON public.usage_logs TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ================================================================
-- PASO 10: INSERTAR DATOS DE PRUEBA
-- ================================================================

-- Insertar un usuario de prueba si no existe
INSERT INTO auth.users (
    id,
    instance_id,
    email,
    encrypted_password,
    email_confirmed_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    recovery_token
)
SELECT 
    gen_random_uuid(),
    '00000000-0000-0000-0000-000000000000',
    'test@agentrouter.com',
    crypt('password123', gen_salt('bf')),
    NOW(),
    '{"provider": "email", "providers": ["email"]}',
    '{"name": "Usuario de Prueba"}',
    NOW(),
    NOW(),
    '',
    ''
WHERE NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'test@agentrouter.com'
);

-- ================================================================
-- PASO 11: VERIFICACIÓN FINAL
-- ================================================================

-- Verificar que todas las tablas fueron creadas correctamente
SELECT 
    schemaname,
    tablename,
    'Tabla creada exitosamente' as status
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'api_keys', 'usage_records', 'tasks', 'usage_logs')
ORDER BY tablename;

-- Verificar que los triggers están configurados
SELECT 
    trigger_name,
    event_object_table,
    'Trigger configurado' as status
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
AND event_object_table IN ('users', 'api_keys', 'tasks')
ORDER BY event_object_table, trigger_name;

-- Mostrar conteo de registros
SELECT 'users' as tabla, COUNT(*) as registros FROM public.users
UNION ALL
SELECT 'api_keys' as tabla, COUNT(*) as registros FROM public.api_keys  
UNION ALL
SELECT 'usage_records' as tabla, COUNT(*) as registros FROM public.usage_records
UNION ALL
SELECT 'tasks' as tabla, COUNT(*) as registros FROM public.tasks
UNION ALL
SELECT 'usage_logs' as tabla, COUNT(*) as registros FROM public.usage_logs
ORDER BY tabla;

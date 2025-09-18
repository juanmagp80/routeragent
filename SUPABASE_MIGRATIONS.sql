-- ================================
-- INSTRUCCIONES PARA EJECUTAR EN SUPABASE SQL EDITOR
-- ================================
-- 1. Ve a https://supabase.com/dashboard/project/jmfegokyvaflwegtyaun/sql
-- 2. Copia y pega cada bloque de código por separado
-- 3. Ejecuta cada bloque uno por uno

-- ================================
-- BLOQUE 1: CREAR TABLA USERS (VERSIÓN CORREGIDA)
-- ================================

-- Eliminar tabla existente si hay problemas
DROP TABLE IF EXISTS public.users CASCADE;

-- Crear tabla users compatible con Supabase Auth
CREATE TABLE public.users (
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

-- Crear índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON public.users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_plan ON public.users(plan);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at);

-- Trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_users_updated_at ON public.users;
CREATE TRIGGER update_users_updated_at
    BEFORE UPDATE ON public.users
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================
-- BLOQUE 2: CONFIGURAR TRIGGERS DE AUTH
-- ================================

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

-- ================================
-- BLOQUE 3: CONFIGURAR RLS (ROW LEVEL SECURITY)
-- ================================

-- Habilitar RLS en la tabla users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver y editar su propia información
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

-- Política para permitir inserción solo durante el registro (manejado por trigger)
DROP POLICY IF EXISTS "Enable insert for authentication" ON public.users;
CREATE POLICY "Enable insert for authentication" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- Grants necesarios para que la función de trigger funcione
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.users TO supabase_auth_admin;

-- Conceder permisos para que los usuarios autenticados puedan leer su propia información
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

-- ================================
-- VERIFICACIÓN FINAL
-- ================================

-- Verificar que la tabla fue creada correctamente
SELECT 
    table_name, 
    column_name, 
    data_type, 
    is_nullable
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

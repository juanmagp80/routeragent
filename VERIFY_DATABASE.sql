-- Verificar estructura de base de datos y existencia de tablas
-- Ejecutar en Supabase SQL Editor

-- ============================================
-- VERIFICAR TABLAS EXISTENTES
-- ============================================

SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('users', 'usage_logs', 'usage_records', 'tasks', 'api_keys')
ORDER BY tablename;

-- ============================================
-- VERIFICAR COLUMNAS DE TABLA USERS
-- ============================================

SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' 
AND table_schema = 'public'
ORDER BY ordinal_position;

-- ============================================
-- VERIFICAR SI EXISTEN DATOS DE USUARIOS
-- ============================================

SELECT 
    COUNT(*) as total_users,
    COUNT(CASE WHEN plan = 'free' THEN 1 END) as free_users,
    COUNT(CASE WHEN plan = 'starter' THEN 1 END) as starter_users,
    COUNT(CASE WHEN is_active = true THEN 1 END) as active_users
FROM public.users;

-- ============================================
-- MOSTRAR USUARIOS EXISTENTES
-- ============================================

SELECT 
    id,
    email,
    name,
    plan,
    api_key_limit,
    is_active,
    created_at
FROM public.users
ORDER BY created_at DESC
LIMIT 5;

-- ============================================
-- VERIFICAR ESTRUCTURA DE TABLAS DE MÉTRICAS
-- ============================================

-- Verificar si las tablas de métricas existen
DO $$
BEGIN
    -- Verificar usage_records
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usage_records' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabla usage_records existe';
    ELSE
        RAISE NOTICE 'Tabla usage_records NO existe';
    END IF;
    
    -- Verificar tasks
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'tasks' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabla tasks existe';
    ELSE
        RAISE NOTICE 'Tabla tasks NO existe';
    END IF;
    
    -- Verificar usage_logs
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'usage_logs' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabla usage_logs existe';
    ELSE
        RAISE NOTICE 'Tabla usage_logs NO existe';
    END IF;
    
    -- Verificar api_keys
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'api_keys' AND table_schema = 'public') THEN
        RAISE NOTICE 'Tabla api_keys existe';
    ELSE
        RAISE NOTICE 'Tabla api_keys NO existe';
    END IF;
END $$;

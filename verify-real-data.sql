-- ========================================
-- CONSULTAS PARA VERIFICAR DATOS REALES
-- ========================================

-- 1. Verificar información del usuario actual
SELECT 
    id, 
    email, 
    name, 
    plan, 
    api_key_limit,
    created_at,
    is_active
FROM users 
WHERE email = 'juanmagpdev@gmail.com';

-- 2. Verificar API keys del usuario
SELECT 
    id,
    name,
    key_prefix,
    usage_count,
    usage_limit,
    is_active,
    created_at,
    last_used_at
FROM api_keys 
WHERE user_id = (
    SELECT id::uuid FROM users WHERE email = 'juanmagpdevv@gmail.com'
);

-- 3. Verificar si existen tablas de métricas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tasks', 'usage_logs', 'usage_records');

-- 4. Si existe la tabla tasks, verificar datos
SELECT COUNT(*) as total_tasks
FROM tasks 
WHERE user_id = (
    SELECT id::uuid FROM users WHERE email = 'juanmagpdevv@gmail.com'
);

-- 5. Si existe la tabla usage_logs, verificar datos
SELECT COUNT(*) as total_usage_logs
FROM usage_logs 
WHERE user_id = (
    SELECT id::uuid FROM users WHERE email = 'juanmagpdevv@gmail.com'
);

-- 6. Si existe la tabla usage_records, verificar datos
SELECT COUNT(*) as total_usage_records
FROM usage_records 
WHERE user_id = (
    SELECT id::uuid FROM users WHERE email = 'juanmagpdevv@gmail.com'
);

-- 7. Verificar estructura de la tabla api_keys
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'api_keys' 
AND table_schema = 'public'
ORDER BY ordinal_position;

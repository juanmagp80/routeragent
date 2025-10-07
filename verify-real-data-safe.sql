-- ========================================
-- CONSULTAS PASO A PASO (MÁS SEGURAS)
-- ========================================

-- PASO 1: Primero obtén el ID del usuario
SELECT 
    id, 
    email, 
    name, 
    plan, 
    api_key_limit,
    created_at,
    is_active
FROM users 
WHERE email = 'juanmagpdevv@gmail.com';

-- PASO 2: Copia el ID del paso anterior y úsalo aquí (reemplaza 'TU_USER_ID_AQUI')
-- Ejemplo: WHERE user_id = '761ce82d-0f07-4f70-9b63-987a668b0907'

-- API keys del usuario
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
WHERE user_id = '761ce82d-0f07-4f70-9b63-987a668b0907';

-- Verificar tablas existentes
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tasks', 'usage_logs', 'usage_records');

-- Contar registros en tasks (si existe)
SELECT COUNT(*) as total_tasks
FROM tasks 
WHERE user_id = '761ce82d-0f07-4f70-9b63-987a668b0907';

-- Contar registros en usage_logs (si existe) 
SELECT COUNT(*) as total_usage_logs
FROM usage_logs 
WHERE user_id = '761ce82d-0f07-4f70-9b63-987a668b0907';

-- Contar registros en usage_records (si existe)
SELECT COUNT(*) as total_usage_records
FROM usage_records 
WHERE user_id = '761ce82d-0f07-4f70-9b63-987a668b0907';

-- Estructura de api_keys
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'api_keys' 
AND table_schema = 'public'
ORDER BY ordinal_position;

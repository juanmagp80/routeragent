-- Consultas específicas para obtener los datos que necesito

-- 1. Información del usuario
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

-- 2. API keys del usuario con sus contadores
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

-- 3. Verificar qué tablas de métricas existen
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('tasks', 'usage_logs', 'usage_records');

-- 4. Si existe tasks, contar registros
SELECT COUNT(*) as total_tasks
FROM tasks 
WHERE user_id = '761ce82d-0f07-4f70-9b63-987a668b0907';

-- 5. Si existe usage_logs, contar registros  
SELECT COUNT(*) as total_usage_logs
FROM usage_logs 
WHERE user_id = '761ce82d-0f07-4f70-9b63-987a668b0907';

-- 6. Si existe usage_records, contar registros
SELECT COUNT(*) as total_usage_records
FROM usage_records 
WHERE user_id = '761ce82d-0f07-4f70-9b63-987a668b0907';

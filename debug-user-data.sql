-- Verificar datos reales del usuario en todas las tablas relevantes
-- Ejecutar cada consulta por separado en Supabase SQL Editor

-- 1. Verificar usuario actual
SELECT id, email, name, plan, created_at FROM users WHERE email = 'juanmagpdev@gmail.com';

-- 2. Verificar API keys del usuario
SELECT id, user_id, name, is_active, created_at FROM api_keys WHERE user_id = (SELECT id FROM users WHERE email = 'juanmagpdev@gmail.com');

-- 3. Verificar datos en usage_logs (tabla principal que usa getUserMetrics)
SELECT id, user_id, task_type, model_used, cost, created_at, status, tokens_used, response_time_ms 
FROM usage_logs 
WHERE user_id = (SELECT id FROM users WHERE email = 'juanmagpdev@gmail.com')
ORDER BY created_at DESC
LIMIT 10;

-- 4. Verificar datos en tasks (tabla alternativa)
SELECT id, user_id, task_type, model_selected, cost, created_at, status, tokens_used, latency_ms
FROM tasks 
WHERE user_id = (SELECT id FROM users WHERE email = 'juanmagpdev@gmail.com')
ORDER BY created_at DESC
LIMIT 10;

-- 5. Verificar datos en usage_records (otra tabla posible)
SELECT id, user_id, cost, created_at, latency_ms, model_used
FROM usage_records 
WHERE user_id = (SELECT id FROM users WHERE email = 'juanmagpdev@gmail.com')
ORDER BY created_at DESC
LIMIT 10;

-- 6. Contar total de registros por tabla
SELECT 
    'usage_logs' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN user_id = (SELECT id FROM users WHERE email = 'juanmagpdev@gmail.com') THEN 1 END) as registros_usuario
FROM usage_logs
UNION ALL
SELECT 
    'tasks' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN user_id = (SELECT id FROM users WHERE email = 'juanmagpdev@gmail.com') THEN 1 END) as registros_usuario
FROM tasks
UNION ALL
SELECT 
    'usage_records' as tabla,
    COUNT(*) as total_registros,
    COUNT(CASE WHEN user_id = (SELECT id FROM users WHERE email = 'juanmagpdev@gmail.com') THEN 1 END) as registros_usuario
FROM usage_records;

-- 7. Verificar estructura de las tablas
SELECT table_name, column_name, data_type 
FROM information_schema.columns 
WHERE table_name IN ('usage_logs', 'tasks', 'usage_records', 'api_keys')
ORDER BY table_name, ordinal_position;
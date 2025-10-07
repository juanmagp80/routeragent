-- Script para crear datos de prueba de actividad reciente para el dashboard
-- Ejecuta esto en el SQL Editor de Supabase

-- Primero, asegúrate de tener una API key creada (reemplaza 'TU_USER_ID' con tu ID real)
-- Buscar tu ID de usuario:
SELECT id, email, name FROM users WHERE email = 'juanmagpdev@gmail.com';

-- Si no tienes API keys, crear una:
-- INSERT INTO api_keys (user_id, name, key_hash, key_preview, is_active, created_at)
-- VALUES (
--   'TU_USER_ID',
--   'Test Key',
--   'test_hash_123',
--   'ak_test_***',
--   true,
--   NOW()
-- );

-- Crear registros de actividad reciente (reemplaza 'TU_USER_ID' con tu ID real)
-- Y 'TU_API_KEY_ID' con el ID de tu API key

-- Ejemplo de inserción de datos de prueba:
/*
INSERT INTO usage_logs (
    id,
    user_id,
    api_key_id,
    task_type,
    model_used,
    provider,
    tokens_used,
    cost,
    processing_time_ms,
    status,
    created_at,
    response_data
) VALUES
-- Actividad de hoy
(
    gen_random_uuid(),
    'TU_USER_ID',
    'TU_API_KEY_ID',
    'text-generation',
    'gpt-4o-mini',
    'openai',
    150,
    0.0045,
    1200,
    'completed',
    NOW() - INTERVAL '2 hours',
    '{"response": "Respuesta generada exitosamente"}'::jsonb
),
(
    gen_random_uuid(),
    'TU_USER_ID',
    'TU_API_KEY_ID',
    'translation',
    'claude-3-haiku',
    'anthropic',
    200,
    0.008,
    800,
    'completed',
    NOW() - INTERVAL '4 hours',
    '{"response": "Traducción completada"}'::jsonb
),
(
    gen_random_uuid(),
    'TU_USER_ID',
    'TU_API_KEY_ID',
    'general',
    'gpt-4o',
    'openai',
    450,
    0.027,
    2100,
    'completed',
    NOW() - INTERVAL '6 hours',
    '{"response": "Análisis general completado"}'::jsonb
),
-- Actividad de ayer
(
    gen_random_uuid(),
    'TU_USER_ID',
    'TU_API_KEY_ID',
    'code-generation',
    'claude-3.5-sonnet',
    'anthropic',
    800,
    0.024,
    3400,
    'completed',
    NOW() - INTERVAL '1 day' - INTERVAL '3 hours',
    '{"response": "Código generado exitosamente"}'::jsonb
),
(
    gen_random_uuid(),
    'TU_USER_ID',
    'TU_API_KEY_ID',
    'summarization',
    'gpt-4o-mini',
    'openai',
    300,
    0.009,
    900,
    'completed',
    NOW() - INTERVAL '1 day' - INTERVAL '8 hours',
    '{"response": "Resumen completado"}'::jsonb
),
-- Actividad de hace 2 días
(
    gen_random_uuid(),
    'TU_USER_ID',
    'TU_API_KEY_ID',
    'analysis',
    'gpt-4o',
    'openai',
    600,
    0.036,
    2800,
    'completed',
    NOW() - INTERVAL '2 days' - INTERVAL '5 hours',
    '{"response": "Análisis completado"}'::jsonb
),
(
    gen_random_uuid(),
    'TU_USER_ID',
    'TU_API_KEY_ID',
    'text-generation',
    'claude-3-haiku',
    'anthropic',
    180,
    0.0054,
    700,
    'failed',
    NOW() - INTERVAL '2 days' - INTERVAL '10 hours',
    '{"error": "Rate limit exceeded"}'::jsonb
);
*/

-- Para verificar los datos insertados:
-- SELECT 
--   task_type, 
--   model_used, 
--   cost, 
--   processing_time_ms, 
--   status,
--   created_at 
-- FROM usage_logs 
-- WHERE user_id = 'TU_USER_ID'
-- ORDER BY created_at DESC;
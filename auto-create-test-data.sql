-- Script automático para crear datos de prueba
-- Este script busca automáticamente tu usuario y crea los datos necesarios

-- 1. Obtener información del usuario
WITH user_info AS (
  SELECT id as user_id FROM users WHERE email = 'juanmagpdev@gmail.com'
),

-- 2. Crear o obtener API key
api_key_info AS (
  INSERT INTO api_keys (user_id, name, key_hash, key_preview, is_active, created_at, updated_at)
  SELECT 
    user_id, 
    'Dashboard Test Key', 
    'test_hash_dashboard_' || user_id, 
    'ak_test_***' || substring(user_id::text, 1, 6), 
    true, 
    NOW(),
    NOW()
  FROM user_info
  ON CONFLICT (user_id, name) DO UPDATE SET updated_at = NOW()
  RETURNING id as api_key_id, user_id
)

-- 3. Insertar datos de actividad de prueba
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
)
SELECT 
    gen_random_uuid(),
    aki.user_id,
    aki.api_key_id,
    activity.task_type,
    activity.model_used,
    activity.provider,
    activity.tokens_used,
    activity.cost,
    activity.processing_time_ms,
    activity.status,
    activity.created_at,
    activity.response_data::jsonb
FROM api_key_info aki
CROSS JOIN (
  VALUES 
    -- Actividad de hoy (últimas horas)
    ('text-generation', 'gpt-4o-mini', 'openai', 150, 0.0045, 1200, 'completed', NOW() - INTERVAL '2 hours', '{"response": "Respuesta generada exitosamente", "prompt_length": 45}'),
    ('translation', 'claude-3-haiku', 'anthropic', 200, 0.008, 800, 'completed', NOW() - INTERVAL '4 hours', '{"response": "Traducción completada", "source_lang": "es", "target_lang": "en"}'),
    ('general', 'gpt-4o', 'openai', 450, 0.027, 2100, 'completed', NOW() - INTERVAL '6 hours', '{"response": "Análisis general completado", "complexity": "high"}'),
    ('code-review', 'claude-3.5-sonnet', 'anthropic', 600, 0.018, 1800, 'completed', NOW() - INTERVAL '8 hours', '{"response": "Code review completado", "files_reviewed": 3}'),
    
    -- Actividad de ayer
    ('code-generation', 'claude-3.5-sonnet', 'anthropic', 800, 0.024, 3400, 'completed', NOW() - INTERVAL '1 day' - INTERVAL '3 hours', '{"response": "Código generado exitosamente", "language": "python"}'),
    ('summarization', 'gpt-4o-mini', 'openai', 300, 0.009, 900, 'completed', NOW() - INTERVAL '1 day' - INTERVAL '8 hours', '{"response": "Resumen completado", "original_length": 5000}'),
    ('analysis', 'gpt-4o', 'openai', 550, 0.033, 2600, 'completed', NOW() - INTERVAL '1 day' - INTERVAL '12 hours', '{"response": "Análisis de datos completado", "data_points": 150}'),
    
    -- Actividad de hace 2 días
    ('analysis', 'gpt-4o', 'openai', 600, 0.036, 2800, 'completed', NOW() - INTERVAL '2 days' - INTERVAL '5 hours', '{"response": "Análisis completado", "insights": 5}'),
    ('text-generation', 'claude-3-haiku', 'anthropic', 180, 0.0054, 700, 'failed', NOW() - INTERVAL '2 days' - INTERVAL '10 hours', '{"error": "Rate limit exceeded", "retry_after": 60}'),
    ('translation', 'gpt-4o-mini', 'openai', 120, 0.0036, 600, 'completed', NOW() - INTERVAL '2 days' - INTERVAL '14 hours', '{"response": "Traducción rápida completada", "target_lang": "fr"}'),
    
    -- Actividad de hace 3 días
    ('general', 'claude-3.5-sonnet', 'anthropic', 400, 0.012, 1900, 'completed', NOW() - INTERVAL '3 days' - INTERVAL '6 hours', '{"response": "Consulta general resuelta", "complexity": "medium"}'),
    ('code-generation', 'gpt-4o', 'openai', 750, 0.045, 3200, 'completed', NOW() - INTERVAL '3 days' - INTERVAL '11 hours', '{"response": "Función generada", "language": "javascript"}'),
    
    -- Actividad más antigua para cálculos de promedios
    ('analysis', 'gpt-4o-mini', 'openai', 250, 0.0075, 800, 'completed', NOW() - INTERVAL '4 days', '{"response": "Análisis básico", "type": "exploratory"}'),
    ('summarization', 'claude-3-haiku', 'anthropic', 350, 0.0105, 1100, 'completed', NOW() - INTERVAL '5 days', '{"response": "Resumen ejecutivo", "pages": 10}'),
    ('text-generation', 'gpt-4o', 'openai', 500, 0.030, 2400, 'completed', NOW() - INTERVAL '6 days', '{"response": "Contenido generado", "word_count": 800}')
) AS activity(task_type, model_used, provider, tokens_used, cost, processing_time_ms, status, created_at, response_data);

-- Verificar los datos insertados
SELECT 
  'Registros de actividad insertados:' as info,
  COUNT(*) as total_records,
  SUM(cost) as total_cost,
  AVG(processing_time_ms) as avg_processing_time,
  COUNT(DISTINCT model_used) as models_used
FROM usage_logs ul
JOIN users u ON ul.user_id = u.id 
WHERE u.email = 'juanmagpdev@gmail.com';

-- Mostrar actividad reciente
SELECT 
  task_type,
  model_used,
  cost,
  processing_time_ms,
  status,
  created_at,
  'Hace ' || 
  CASE 
    WHEN AGE(NOW(), created_at) < INTERVAL '1 hour' THEN EXTRACT(MINUTE FROM AGE(NOW(), created_at))::text || ' minutos'
    WHEN AGE(NOW(), created_at) < INTERVAL '1 day' THEN EXTRACT(HOUR FROM AGE(NOW(), created_at))::text || ' horas'
    ELSE EXTRACT(DAY FROM AGE(NOW(), created_at))::text || ' días'
  END as tiempo_transcurrido
FROM usage_logs ul
JOIN users u ON ul.user_id = u.id 
WHERE u.email = 'juanmagpdev@gmail.com'
ORDER BY created_at DESC
LIMIT 10;
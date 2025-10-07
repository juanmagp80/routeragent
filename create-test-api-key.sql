-- Script para crear una API key de prueba para el usuario actual
-- Ejecuta este script en Supabase SQL Editor

-- 1. Obtener información del usuario
WITH user_info AS (
  SELECT id, email, name FROM users WHERE email = 'juanmagpdev@gmail.com'
),

-- 2. Generar API key de prueba
api_key_data AS (
  SELECT 
    ui.id as user_id,
    ui.email,
    'test-key-' || EXTRACT(EPOCH FROM NOW())::text as key_name,
    'ak_test_' || substring(md5(random()::text), 1, 24) as api_key_value,
    'ak_test_***' || substring(ui.id::text, 1, 6) as key_preview
  FROM user_info ui
)

-- 3. Insertar la API key
INSERT INTO api_keys (
  user_id, 
  name, 
  key_hash, 
  key_preview, 
  is_active, 
  created_at, 
  updated_at,
  last_used_at
)
SELECT 
  user_id,
  key_name,
  encode(digest(api_key_value, 'sha256'), 'hex'), -- Hash de la API key
  key_preview,
  true,
  NOW(),
  NOW(),
  NULL
FROM api_key_data
ON CONFLICT (user_id, name) DO UPDATE SET 
  updated_at = NOW(),
  is_active = true
RETURNING 
  id,
  name,
  key_preview,
  'Usa esta API key completa:' as instruction,
  (SELECT api_key_value FROM api_key_data LIMIT 1) as full_api_key;

-- 4. Mostrar las API keys del usuario
SELECT 
  'API Keys disponibles para ' || u.email as info,
  ak.name,
  ak.key_preview,
  ak.is_active,
  ak.created_at
FROM api_keys ak
JOIN users u ON ak.user_id = u.id
WHERE u.email = 'juanmagpdev@gmail.com'
ORDER BY ak.created_at DESC;
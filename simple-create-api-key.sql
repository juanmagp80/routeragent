-- Script simple para crear API key de prueba
-- Copia y pega cada parte por separado en Supabase SQL Editor

-- PARTE 1: Obtener tu ID de usuario
SELECT id, email, name 
FROM users 
WHERE email = 'juanmagpdev@gmail.com';

-- PARTE 2: Crear API key (reemplaza USER_ID_AQUI con el ID de la consulta anterior)
-- Ejemplo: INSERT INTO api_keys (user_id, name, key_hash, key_preview, is_active, created_at, updated_at)
-- VALUES (
--   'USER_ID_AQUI',
--   'Test Dashboard Key',
--   'test_hash_dashboard_001',
--   'ak_test_dashboard001',
--   true,
--   NOW(),
--   NOW()
-- );

-- PARTE 3: Verificar la API key creada
-- SELECT * FROM api_keys WHERE user_id = 'USER_ID_AQUI';
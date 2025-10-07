-- Crear API key simple para pruebas
-- INSTRUCCIONES:
-- 1. Ejecuta esta consulta para obtener tu user_id:

SELECT id as user_id, email, name FROM users WHERE email = 'juanmagpdev@gmail.com';

-- 2. Copia el user_id del resultado anterior
-- 3. Reemplaza 'TU_USER_ID_AQUI' en el siguiente INSERT con el ID real:

INSERT INTO api_keys (
  user_id, 
  name, 
  key_hash, 
  key_preview, 
  is_active, 
  created_at, 
  updated_at
) VALUES (
  'TU_USER_ID_AQUI',  -- <-- REEMPLAZA ESTO
  'Dashboard Test Key',
  'ak_test_dashboard_12345',  -- Esta será la API key real
  'ak_test_***dashboard',
  true,
  NOW(),
  NOW()
);

-- 4. Verifica que se creó correctamente:
SELECT 
  ak.id,
  ak.name,
  ak.key_hash as api_key_completa,  -- Esta es la que usas en las pruebas
  ak.key_preview,
  ak.is_active,
  u.email
FROM api_keys ak
JOIN users u ON ak.user_id = u.id
WHERE u.email = 'juanmagpdev@gmail.com'
ORDER BY ak.created_at DESC;
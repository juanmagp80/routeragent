-- Script para limpiar los datos incorrectos del usuario OAuth actual
-- Ejecutar en Supabase SQL Editor

-- 1. Buscar el usuario más reciente (probablemente el que acabas de registrar)
SELECT id, email, name, company, role, created_at 
FROM users 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC
LIMIT 5;

-- 2. Una vez identifiques tu usuario, actualiza los datos incorrectos
-- Reemplaza 'TU_USER_ID_AQUI' con el ID real de tu usuario

-- UPDATE users 
-- SET 
--     name = 'TU_NOMBRE_REAL',  -- Cambia por tu nombre real
--     email = 'TU_EMAIL_REAL',  -- Cambia por tu email real
--     company = '',             -- Vacío por defecto
--     role = 'User',
--     updated_at = NOW()
-- WHERE id = 'TU_USER_ID_AQUI';

-- 3. Verificar que los cambios se aplicaron correctamente
-- SELECT id, email, name, company, role, updated_at 
-- FROM users 
-- WHERE id = 'TU_USER_ID_AQUI';

-- 4. Si quieres eliminar completamente el usuario y que se vuelva a crear:
-- DELETE FROM users WHERE id = 'TU_USER_ID_AQUI';

-- Nota: El usuario se volverá a crear automáticamente la próxima vez que hagas login
-- con los datos correctos del OAuth
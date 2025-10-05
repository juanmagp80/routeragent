-- 1. Buscar usuarios recientes (ejecuta este primero para identificar tu usuario)
SELECT id, email, name, company, role, created_at, last_login
FROM users 
WHERE created_at > NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;
-- Ejecutar estas consultas UNA POR UNA para identificar errores

-- CONSULTA 1: Información del usuario
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

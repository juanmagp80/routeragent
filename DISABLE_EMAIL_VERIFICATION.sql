-- EJECUTAR EN SUPABASE SQL EDITOR
-- Para deshabilitar temporalmente la verificación de email

-- Marcar todos los usuarios como verificados
UPDATE auth.users 
SET email_confirmed_at = NOW()
WHERE email_confirmed_at IS NULL;

-- Actualizar la tabla users para reflejar el cambio
UPDATE public.users 
SET email_verified = true
WHERE email_verified = false;

-- Verificar cambios
SELECT 
    id, 
    email, 
    email_confirmed_at,
    created_at
FROM auth.users;

SELECT 
    id, 
    email, 
    email_verified,
    name
FROM public.users;

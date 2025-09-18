-- EJECUTAR ESTE BLOQUE EN SUPABASE SQL EDITOR
-- Solo para corregir las políticas RLS (sin recrear triggers)

-- Deshabilitar RLS temporalmente
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON public.users;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable update for authenticated users" ON public.users;
DROP POLICY IF EXISTS "Enable insert for system" ON public.users;

-- Dar permisos básicos (sin RLS por ahora para debugging)
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON public.users TO authenticated;
GRANT USAGE ON SCHEMA public TO anon;
GRANT SELECT, INSERT, UPDATE ON public.users TO anon;

-- Verificar que los triggers existen
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table
FROM information_schema.triggers 
WHERE event_object_table = 'users' 
   AND trigger_name LIKE '%auth%';

-- Verificar estructura de la tabla
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

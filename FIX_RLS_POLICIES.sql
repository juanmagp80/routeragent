-- EJECUTAR ESTE BLOQUE EN SUPABASE SQL EDITOR
-- Para corregir las políticas RLS y permitir que los triggers funcionen

-- Deshabilitar RLS temporalmente para diagnosticar
ALTER TABLE public.users DISABLE ROW LEVEL SECURITY;

-- Eliminar todas las políticas existentes
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
DROP POLICY IF EXISTS "Enable insert for authentication" ON public.users;

-- Habilitar RLS nuevamente
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Crear políticas más permisivas
CREATE POLICY "Enable read access for authenticated users" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Enable update for authenticated users" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- Política para permitir inserción por parte del sistema (triggers)
CREATE POLICY "Enable insert for system" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- Verificar que los triggers existen
SELECT 
    trigger_name, 
    event_manipulation, 
    event_object_table,
    action_statement
FROM information_schema.triggers 
WHERE event_object_table IN ('users') 
   OR trigger_name LIKE '%auth%';

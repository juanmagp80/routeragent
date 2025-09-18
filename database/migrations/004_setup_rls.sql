-- Configuración de Row Level Security (RLS) para la tabla users

-- Habilitar RLS en la tabla users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios solo puedan ver y editar su propia información
CREATE POLICY "Users can view own profile" 
ON public.users 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile" 
ON public.users 
FOR UPDATE 
USING (auth.uid() = id);

-- Política para permitir inserción solo durante el registro (manejado por trigger)
CREATE POLICY "Enable insert for authentication" 
ON public.users 
FOR INSERT 
WITH CHECK (true);

-- Grants necesarios para que la función de trigger funcione
GRANT USAGE ON SCHEMA public TO supabase_auth_admin;
GRANT ALL ON public.users TO supabase_auth_admin;

-- Conceder permisos para que los usuarios autenticados puedan leer su propia información
GRANT SELECT, UPDATE ON public.users TO authenticated;
GRANT USAGE ON SCHEMA public TO authenticated;

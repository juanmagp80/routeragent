-- Verificar estructura actual de la tabla users
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'users' AND table_schema = 'public'
ORDER BY ordinal_position;

-- También revisar si la tabla existe
SELECT table_name, table_schema
FROM information_schema.tables
WHERE table_name = 'users' AND table_schema = 'public';

-- Verificar políticas RLS
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
FROM pg_policies 
WHERE tablename = 'users';
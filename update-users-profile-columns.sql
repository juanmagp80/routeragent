-- Script SQL para agregar las columnas necesarias en la tabla users para el perfil
-- Ejecutar en Supabase SQL Editor

-- Agregar columnas para información de perfil si no existen
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS company TEXT,
ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'User',
ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'Europe/Madrid',
ADD COLUMN IF NOT EXISTS language TEXT DEFAULT 'es';

-- Actualizar usuarios existentes con valores por defecto
UPDATE users 
SET 
    company = COALESCE(company, ''),
    role = COALESCE(role, 'User'),
    timezone = COALESCE(timezone, 'Europe/Madrid'),
    language = COALESCE(language, 'es')
WHERE 
    company IS NULL 
    OR role IS NULL 
    OR timezone IS NULL 
    OR language IS NULL;

-- Crear índice para mejorar rendimiento en búsquedas por empresa
CREATE INDEX IF NOT EXISTS idx_users_company ON users(company) WHERE company != '';

-- Verificar la estructura de la tabla
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
ORDER BY ordinal_position;
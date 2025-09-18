#!/bin/bash

# Script para configurar automáticamente las tablas de Supabase
# Este script ejecuta el SQL necesario para crear la estructura de la base de datos

echo "🚀 Configurando base de datos de Supabase..."

# Crear directorio para scripts SQL si no existe
mkdir -p database/migrations

# Crear el archivo SQL con toda la estructura
cat > database/migrations/001_create_users_table.sql << 'EOF'
-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255),
    plan VARCHAR(50) DEFAULT 'starter',
    api_key_limit INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    email_verification_token VARCHAR(255),
    email_verification_expires TIMESTAMP,
    password_reset_token VARCHAR(255),
    password_reset_expires TIMESTAMP,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret VARCHAR(255),
    subscription_id VARCHAR(255),
    subscription_status VARCHAR(50),
    subscription_current_period_end TIMESTAMP,
    last_login TIMESTAMP,
    login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP,
    preferences JSONB DEFAULT '{}',
    profile_data JSONB DEFAULT '{}',
    social_profiles JSONB DEFAULT '{}',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Crear índices para mejor rendimiento
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);

-- Crear función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Crear trigger para actualizar updated_at automáticamente
DROP TRIGGER IF EXISTS update_users_updated_at ON users;
CREATE TRIGGER update_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();

-- Crear tabla para logs de uso de API
CREATE TABLE IF NOT EXISTS usage_logs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    endpoint VARCHAR(255) NOT NULL,
    method VARCHAR(10) NOT NULL,
    request_body JSONB,
    response_body JSONB,
    status_code INTEGER,
    execution_time_ms INTEGER,
    model_used VARCHAR(100),
    tokens_used INTEGER,
    cost_usd DECIMAL(10, 6),
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Índices para usage_logs
CREATE INDEX IF NOT EXISTS idx_usage_logs_user_id ON usage_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_usage_logs_created_at ON usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_usage_logs_endpoint ON usage_logs(endpoint);

-- Crear tabla para API keys
CREATE TABLE IF NOT EXISTS api_keys (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    key_hash VARCHAR(255) UNIQUE NOT NULL,
    key_prefix VARCHAR(20) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    usage_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMP,
    expires_at TIMESTAMP,
    permissions JSONB DEFAULT '{}',
    rate_limit_per_hour INTEGER DEFAULT 1000,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices para api_keys
CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
CREATE INDEX IF NOT EXISTS idx_api_keys_key_hash ON api_keys(key_hash);
CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);

-- Trigger para api_keys
DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
CREATE TRIGGER update_api_keys_updated_at 
    BEFORE UPDATE ON api_keys 
    FOR EACH ROW 
    EXECUTE FUNCTION update_updated_at_column();
EOF

echo "✅ Archivo SQL creado en database/migrations/001_create_users_table.sql"

echo ""
echo "📋 Para completar la configuración:"
echo "1. Ve a tu proyecto de Supabase: https://supabase.com/dashboard"
echo "2. Abre el SQL Editor"
echo "3. Copia y pega el contenido del archivo: database/migrations/001_create_users_table.sql"
echo "4. Ejecuta el SQL"
echo ""
echo "🔒 Configuración de Row Level Security (RLS):"
echo "También ejecuta este SQL para configurar la seguridad:"

cat > database/migrations/002_setup_rls.sql << 'EOF'
-- Habilitar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE usage_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE api_keys ENABLE ROW LEVEL SECURITY;

-- Políticas para la tabla users
-- Permitir registro de nuevos usuarios
CREATE POLICY "Enable insert for registration" ON users
    FOR INSERT WITH CHECK (true);

-- Los usuarios pueden ver solo su propia información
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (id = auth.uid());

-- Los usuarios pueden actualizar solo su propia información
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (id = auth.uid());

-- Políticas para usage_logs
-- Los usuarios solo pueden ver sus propios logs
CREATE POLICY "Users can view own usage logs" ON usage_logs
    FOR SELECT USING (user_id = auth.uid());

-- Solo el sistema puede insertar logs
CREATE POLICY "System can insert usage logs" ON usage_logs
    FOR INSERT WITH CHECK (true);

-- Políticas para api_keys
-- Los usuarios pueden ver solo sus propias API keys
CREATE POLICY "Users can view own api keys" ON api_keys
    FOR SELECT USING (user_id = auth.uid());

-- Los usuarios pueden insertar sus propias API keys
CREATE POLICY "Users can insert own api keys" ON api_keys
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Los usuarios pueden actualizar sus propias API keys
CREATE POLICY "Users can update own api keys" ON api_keys
    FOR UPDATE USING (user_id = auth.uid());

-- Los usuarios pueden eliminar sus propias API keys
CREATE POLICY "Users can delete own api keys" ON api_keys
    FOR DELETE USING (user_id = auth.uid());
EOF

echo ""
echo "🔒 Archivo RLS creado en database/migrations/002_setup_rls.sql"
echo ""
echo "🎉 ¡Configuración completada!"
echo "Ahora ejecuta ambos archivos SQL en Supabase para completar la configuración."

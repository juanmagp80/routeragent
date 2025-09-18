import { supabase } from '../config/database';

async function setupDatabase() {
    console.log('Setting up database...');

    try {
        // Leer el archivo de funciones RPC
        const rpcFunctions = `
-- Función para crear la tabla de usuarios
CREATE OR REPLACE FUNCTION create_users_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    email TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    company TEXT,
    plan TEXT DEFAULT 'starter',
    api_key_limit INTEGER DEFAULT 1,
    usage_limit INTEGER DEFAULT 1000,
    usage_count INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_login TIMESTAMP WITH TIME ZONE,
    password_reset_token TEXT,
    password_reset_expires TIMESTAMP WITH TIME ZONE,
    email_verification_token TEXT,
    email_verification_expires TIMESTAMP WITH TIME ZONE,
    two_factor_enabled BOOLEAN DEFAULT false,
    two_factor_secret TEXT,
    failed_login_attempts INTEGER DEFAULT 0,
    locked_until TIMESTAMP WITH TIME ZONE,
    subscription_id TEXT,
    stripe_customer_id TEXT,
    billing_address JSONB,
    phone TEXT,
    timezone TEXT,
    language TEXT,
    avatar_url TEXT,
    bio TEXT,
    website TEXT,
    social_profiles JSONB,
    preferences JSONB,
    roles TEXT[] DEFAULT ARRAY['user'],
    permissions TEXT[] DEFAULT ARRAY[],
    metadata JSONB
  );

  -- Crear índices para mejorar el rendimiento
  CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
  CREATE INDEX IF NOT EXISTS idx_users_plan ON users(plan);
  CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at);
  CREATE INDEX IF NOT EXISTS idx_users_last_login ON users(last_login);

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
  CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END;
$$ LANGUAGE plpgsql;

-- Función para crear la tabla de claves API
CREATE OR REPLACE FUNCTION create_api_keys_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS api_keys (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    key_prefix TEXT UNIQUE NOT NULL,
    key_hash TEXT NOT NULL,
    name TEXT,
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    usage_limit INTEGER DEFAULT -1, -- -1 para ilimitado
    usage_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    last_used_at TIMESTAMP WITH TIME ZONE,
    permissions TEXT[] DEFAULT ARRAY[]
  );

  -- Crear índices para claves API
  CREATE INDEX IF NOT EXISTS idx_api_keys_user_id ON api_keys(user_id);
  CREATE INDEX IF NOT EXISTS idx_api_keys_key_prefix ON api_keys(key_prefix);
  CREATE INDEX IF NOT EXISTS idx_api_keys_is_active ON api_keys(is_active);
  CREATE INDEX IF NOT EXISTS idx_api_keys_created_at ON api_keys(created_at);

  -- Crear trigger para actualizar updated_at de claves API
  DROP TRIGGER IF EXISTS update_api_keys_updated_at ON api_keys;
  CREATE TRIGGER update_api_keys_updated_at BEFORE UPDATE ON api_keys
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END;
$$ LANGUAGE plpgsql;

-- Función para crear la tabla de registros de uso
CREATE OR REPLACE FUNCTION create_usage_records_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS usage_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    model_used TEXT NOT NULL,
    cost DECIMAL(10, 6) NOT NULL,
    latency_ms INTEGER NOT NULL,
    tokens_used INTEGER NOT NULL,
    prompt_preview TEXT,
    capabilities TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Crear índices para registros de uso
  CREATE INDEX IF NOT EXISTS idx_usage_records_user_id ON usage_records(user_id);
  CREATE INDEX IF NOT EXISTS idx_usage_records_api_key_id ON usage_records(api_key_id);
  CREATE INDEX IF NOT EXISTS idx_usage_records_model_used ON usage_records(model_used);
  CREATE INDEX IF NOT EXISTS idx_usage_records_created_at ON usage_records(created_at);
END;
$$ LANGUAGE plpgsql;

-- Función para crear la tabla de tareas
CREATE OR REPLACE FUNCTION create_tasks_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS tasks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    task_type TEXT NOT NULL,
    input TEXT NOT NULL,
    output TEXT,
    model_selected TEXT NOT NULL,
    cost DECIMAL(10, 6) NOT NULL,
    latency_ms INTEGER NOT NULL,
    tokens_used INTEGER NOT NULL,
    status TEXT DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completed_at TIMESTAMP WITH TIME ZONE
  );

  -- Crear índices para tareas
  CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_api_key_id ON tasks(api_key_id);
  CREATE INDEX IF NOT EXISTS idx_tasks_task_type ON tasks(task_type);
  CREATE INDEX IF NOT EXISTS idx_tasks_status ON tasks(status);
  CREATE INDEX IF NOT EXISTS idx_tasks_created_at ON tasks(created_at);
  CREATE INDEX IF NOT EXISTS idx_tasks_completed_at ON tasks(completed_at);

  -- Crear trigger para actualizar updated_at de tareas
  DROP TRIGGER IF EXISTS update_tasks_updated_at ON tasks;
  CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END;
$$ LANGUAGE plpgsql;

-- Función para crear la tabla de métricas de rendimiento
CREATE OR REPLACE FUNCTION create_performance_metrics_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model TEXT NOT NULL,
    provider TEXT NOT NULL,
    task_type TEXT NOT NULL,
    avg_latency_ms DECIMAL(10, 2),
    avg_cost_per_task DECIMAL(10, 6),
    success_rate DECIMAL(5, 4),
    sample_size INTEGER,
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Crear índices para métricas de rendimiento
  CREATE INDEX IF NOT EXISTS idx_performance_metrics_model ON performance_metrics(model);
  CREATE INDEX IF NOT EXISTS idx_performance_metrics_provider ON performance_metrics(provider);
  CREATE INDEX IF NOT EXISTS idx_performance_metrics_task_type ON performance_metrics(task_type);
  CREATE INDEX IF NOT EXISTS idx_performance_metrics_recorded_at ON performance_metrics(recorded_at);
END;
$$ LANGUAGE plpgsql;

-- Función para crear la tabla de caché
CREATE OR REPLACE FUNCTION create_cache_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Crear índices para caché
  CREATE INDEX IF NOT EXISTS idx_cache_key ON cache(key);
  CREATE INDEX IF NOT EXISTS idx_cache_expires_at ON cache(expires_at);

  -- Crear trigger para actualizar updated_at de caché
  DROP TRIGGER IF EXISTS update_cache_updated_at ON cache;
  CREATE TRIGGER update_cache_updated_at BEFORE UPDATE ON cache
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END;
$$ LANGUAGE plpgsql;

-- Función para crear la tabla de registros de logs
CREATE OR REPLACE FUNCTION create_logs_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    api_key_id UUID REFERENCES api_keys(id) ON DELETE SET NULL,
    level TEXT NOT NULL,
    message TEXT NOT NULL,
    context JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Crear índices para logs
  CREATE INDEX IF NOT EXISTS idx_logs_user_id ON logs(user_id);
  CREATE INDEX IF NOT EXISTS idx_logs_api_key_id ON logs(api_key_id);
  CREATE INDEX IF NOT EXISTS idx_logs_level ON logs(level);
  CREATE INDEX IF NOT EXISTS idx_logs_created_at ON logs(created_at);
END;
$$ LANGUAGE plpgsql;

-- Función para crear la tabla de suscripciones
CREATE OR REPLACE FUNCTION create_subscriptions_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    plan TEXT NOT NULL,
    status TEXT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE NOT NULL,
    end_date TIMESTAMP WITH TIME ZONE,
    cancel_at TIMESTAMP WITH TIME ZONE,
    canceled_at TIMESTAMP WITH TIME ZONE,
    trial_start TIMESTAMP WITH TIME ZONE,
    trial_end TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Crear índices para suscripciones
  CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON subscriptions(user_id);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_plan ON subscriptions(plan);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);
  CREATE INDEX IF NOT EXISTS idx_subscriptions_created_at ON subscriptions(created_at);

  -- Crear trigger para actualizar updated_at de suscripciones
  DROP TRIGGER IF EXISTS update_subscriptions_updated_at ON subscriptions;
  CREATE TRIGGER update_subscriptions_updated_at BEFORE UPDATE ON subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END;
$$ LANGUAGE plpgsql;

-- Función para crear la tabla de facturas
CREATE OR REPLACE FUNCTION create_invoices_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subscription_id UUID REFERENCES subscriptions(id) ON DELETE SET NULL,
    amount DECIMAL(10, 2) NOT NULL,
    currency TEXT NOT NULL,
    status TEXT NOT NULL,
    invoice_date TIMESTAMP WITH TIME ZONE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    paid_at TIMESTAMP WITH TIME ZONE,
    invoice_pdf_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Crear índices para facturas
  CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
  CREATE INDEX IF NOT EXISTS idx_invoices_subscription_id ON invoices(subscription_id);
  CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
  CREATE INDEX IF NOT EXISTS idx_invoices_invoice_date ON invoices(invoice_date);
  CREATE INDEX IF NOT EXISTS idx_invoices_due_date ON invoices(due_date);

  -- Crear trigger para actualizar updated_at de facturas
  DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
  CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END;
$$ LANGUAGE plpgsql;

-- Función para crear la tabla de notificaciones
CREATE OR REPLACE FUNCTION create_notifications_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    read_at TIMESTAMP WITH TIME ZONE
  );

  -- Crear índices para notificaciones
  CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
  CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
  CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
  CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);
END;
$$ LANGUAGE plpgsql;

-- Función para crear la tabla de configuraciones del sistema
CREATE OR REPLACE FUNCTION create_system_config_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS system_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Crear índices para configuraciones del sistema
  CREATE INDEX IF NOT EXISTS idx_system_config_key ON system_config(key);

  -- Crear trigger para actualizar updated_at de configuraciones del sistema
  DROP TRIGGER IF EXISTS update_system_config_updated_at ON system_config;
  CREATE TRIGGER update_system_config_updated_at BEFORE UPDATE ON system_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END;
$$ LANGUAGE plpgsql;

-- Función para crear la tabla de modelos de IA
CREATE OR REPLACE FUNCTION create_ai_models_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS ai_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    provider TEXT NOT NULL,
    cost_per_token DECIMAL(10, 8) NOT NULL,
    max_tokens INTEGER NOT NULL,
    speed_rating INTEGER NOT NULL, -- 1-10
    quality_rating INTEGER NOT NULL, -- 1-10
    availability BOOLEAN DEFAULT true,
    supported_tasks TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Crear índices para modelos de IA
  CREATE INDEX IF NOT EXISTS idx_ai_models_name ON ai_models(name);
  CREATE INDEX IF NOT EXISTS idx_ai_models_provider ON ai_models(provider);
  CREATE INDEX IF NOT EXISTS idx_ai_models_availability ON ai_models(availability);

  -- Crear trigger para actualizar updated_at de modelos de IA
  DROP TRIGGER IF EXISTS update_ai_models_updated_at ON ai_models;
  CREATE TRIGGER update_ai_models_updated_at BEFORE UPDATE ON ai_models
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END;
$$ LANGUAGE plpgsql;

-- Función para crear la tabla de proveedores de IA
CREATE OR REPLACE FUNCTION create_ai_providers_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS ai_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT UNIQUE NOT NULL,
    api_endpoint TEXT NOT NULL,
    api_key TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Crear índices para proveedores de IA
  CREATE INDEX IF NOT EXISTS idx_ai_providers_name ON ai_providers(name);
  CREATE INDEX IF NOT EXISTS idx_ai_providers_is_active ON ai_providers(is_active);

  -- Crear trigger para actualizar updated_at de proveedores de IA
  DROP TRIGGER IF EXISTS update_ai_providers_updated_at ON ai_providers;
  CREATE TRIGGER update_ai_providers_updated_at BEFORE UPDATE ON ai_providers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END;
$$ LANGUAGE plpgsql;

-- Función para crear la tabla de configuraciones de ruteo
CREATE OR REPLACE FUNCTION create_routing_config_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS routing_config (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_id UUID REFERENCES ai_models(id) ON DELETE CASCADE,
    task_type TEXT NOT NULL,
    weight DECIMAL(5, 4) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Crear índices para configuraciones de ruteo
  CREATE INDEX IF NOT EXISTS idx_routing_config_model_id ON routing_config(model_id);
  CREATE INDEX IF NOT EXISTS idx_routing_config_task_type ON routing_config(task_type);

  -- Crear trigger para actualizar updated_at de configuraciones de ruteo
  DROP TRIGGER IF EXISTS update_routing_config_updated_at ON routing_config;
  CREATE TRIGGER update_routing_config_updated_at BEFORE UPDATE ON routing_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
END;
$$ LANGUAGE plpgsql;

-- Función para crear la tabla de historial de ruteo
CREATE OR REPLACE FUNCTION create_routing_history_table()
RETURNS VOID AS $$
BEGIN
  CREATE TABLE IF NOT EXISTS routing_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    task_id UUID REFERENCES tasks(id) ON DELETE CASCADE,
    selected_model TEXT NOT NULL,
    reasoning JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );

  -- Crear índices para historial de ruteo
  CREATE INDEX IF NOT EXISTS idx_routing_history_task_id ON routing_history(task_id);
  CREATE INDEX IF NOT EXISTS idx_routing_history_selected_model ON routing_history(selected_model);
  CREATE INDEX IF NOT EXISTS idx_routing_history_created_at ON routing_history(created_at);
END;
$$ LANGUAGE plpgsql;

-- Función para insertar configuraciones iniciales
CREATE OR REPLACE FUNCTION insert_initial_system_config()
RETURNS VOID AS $$
BEGIN
  INSERT INTO system_config (key, value, description) VALUES
    ('default_plan', '{"name": "starter", "api_key_limit": 1, "usage_limit": 1000}', 'Configuración del plan por defecto')
  ON CONFLICT (key) DO NOTHING;

  INSERT INTO system_config (key, value, description) VALUES
    ('pricing_plans', '{
      "starter": {"price": 29, "api_key_limit": 1, "usage_limit": 1000},
      "pro": {"price": 99, "api_key_limit": 5, "usage_limit": 5000},
      "enterprise": {"price": null, "api_key_limit": -1, "usage_limit": -1}
    }', 'Planes de precios disponibles')
  ON CONFLICT (key) DO NOTHING;

  INSERT INTO system_config (key, value, description) VALUES
    ('model_routing_weights', '{
      "cost": 0.4,
      "speed": 0.3,
      "quality": 0.3
    }', 'Pesos para el ruteo de modelos')
  ON CONFLICT (key) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Función para insertar modelos de IA iniciales
CREATE OR REPLACE FUNCTION insert_initial_ai_models()
RETURNS VOID AS $$
BEGIN
  INSERT INTO ai_models (name, provider, cost_per_token, max_tokens, speed_rating, quality_rating, availability, supported_tasks) VALUES
    ('gpt-4', 'openai', 0.03, 128000, 8, 9, true, ARRAY['summary', 'translation', 'analysis', 'general']),
    ('claude-3', 'anthropic', 0.015, 200000, 7, 8, true, ARRAY['summary', 'translation', 'analysis', 'general']),
    ('mistral-7b', 'mistral', 0.002, 32000, 9, 7, true, ARRAY['summary', 'translation', 'general']),
    ('llama-3', 'meta', 0.001, 8000, 6, 6, true, ARRAY['summary', 'translation', 'general'])
  ON CONFLICT (name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Función para insertar proveedores de IA iniciales
CREATE OR REPLACE FUNCTION insert_initial_ai_providers()
RETURNS VOID AS $$
BEGIN
  INSERT INTO ai_providers (name, api_endpoint, api_key, is_active) VALUES
    ('openai', 'https://api.openai.com/v1/chat/completions', 'YOUR_OPENAI_API_KEY', true),
    ('anthropic', 'https://api.anthropic.com/v1/messages', 'YOUR_ANTHROPIC_API_KEY', true),
    ('mistral', 'https://api.mistral.ai/v1/chat/completions', 'YOUR_MISTRAL_API_KEY', true),
    ('meta', 'https://api.meta.com/v1/chat/completions', 'YOUR_META_API_KEY', true)
  ON CONFLICT (name) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- Función para insertar configuraciones de ruteo iniciales
CREATE OR REPLACE FUNCTION insert_initial_routing_config()
RETURNS VOID AS $$
BEGIN
  -- Insertar configuraciones de ruteo para tareas de resumen
  INSERT INTO routing_config (model_id, task_type, weight) 
  SELECT id, 'summary', 0.25 FROM ai_models WHERE name = 'gpt-4'
  UNION ALL
  SELECT id, 'summary', 0.25 FROM ai_models WHERE name = 'claude-3'
  UNION ALL
  SELECT id, 'summary', 0.25 FROM ai_models WHERE name = 'mistral-7b'
  UNION ALL
  SELECT id, 'summary', 0.25 FROM ai_models WHERE name = 'llama-3'
  ON CONFLICT DO NOTHING;

  -- Insertar configuraciones de ruteo para tareas de traducción
  INSERT INTO routing_config (model_id, task_type, weight) 
  SELECT id, 'translation', 0.3 FROM ai_models WHERE name = 'gpt-4'
  UNION ALL
  SELECT id, 'translation', 0.3 FROM ai_models WHERE name = 'claude-3'
  UNION ALL
  SELECT id, 'translation', 0.2 FROM ai_models WHERE name = 'mistral-7b'
  UNION ALL
  SELECT id, 'translation', 0.2 FROM ai_models WHERE name = 'llama-3'
  ON CONFLICT DO NOTHING;

  -- Insertar configuraciones de ruteo para tareas de análisis
  INSERT INTO routing_config (model_id, task_type, weight) 
  SELECT id, 'analysis', 0.4 FROM ai_models WHERE name = 'gpt-4'
  UNION ALL
  SELECT id, 'analysis', 0.4 FROM ai_models WHERE name = 'claude-3'
  UNION ALL
  SELECT id, 'analysis', 0.1 FROM ai_models WHERE name = 'mistral-7b'
  UNION ALL
  SELECT id, 'analysis', 0.1 FROM ai_models WHERE name = 'llama-3'
  ON CONFLICT DO NOTHING;

  -- Insertar configuraciones de ruteo para tareas generales
  INSERT INTO routing_config (model_id, task_type, weight) 
  SELECT id, 'general', 0.3 FROM ai_models WHERE name = 'gpt-4'
  UNION ALL
  SELECT id, 'general', 0.3 FROM ai_models WHERE name = 'claude-3'
  UNION ALL
  SELECT id, 'general', 0.2 FROM ai_models WHERE name = 'mistral-7b'
  UNION ALL
  SELECT id, 'general', 0.2 FROM ai_models WHERE name = 'llama-3'
  ON CONFLICT DO NOTHING;
END;
$$ LANGUAGE plpgsql;
    `;

        // Ejecutar las funciones RPC para crear las tablas
        const functions = [
            'create_users_table',
            'create_api_keys_table',
            'create_usage_records_table',
            'create_tasks_table',
            'create_performance_metrics_table',
            'create_cache_table',
            'create_logs_table',
            'create_subscriptions_table',
            'create_invoices_table',
            'create_notifications_table',
            'create_system_config_table',
            'create_ai_models_table',
            'create_ai_providers_table',
            'create_routing_config_table',
            'create_routing_history_table'
        ];

        for (const func of functions) {
            const { error } = await supabase.rpc(func);
            if (error) {
                console.error(`Error executing ${func}:`, error);
            } else {
                console.log(`${func} executed successfully`);
            }
        }

        // Ejecutar las funciones RPC para insertar datos iniciales
        const insertFunctions = [
            'insert_initial_system_config',
            'insert_initial_ai_models',
            'insert_initial_ai_providers',
            'insert_initial_routing_config'
        ];

        for (const func of insertFunctions) {
            const { error } = await supabase.rpc(func);
            if (error) {
                console.error(`Error executing ${func}:`, error);
            } else {
                console.log(`${func} executed successfully`);
            }
        }

        console.log('Database setup completed');
    } catch (error) {
        console.error('Error setting up database:', error);
    }
}

// Ejecutar la configuración si se llama directamente
if (require.main === module) {
    setupDatabase();
}

export default setupDatabase;
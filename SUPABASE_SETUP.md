# Configuración de Supabase para AgentRouter

## 🚀 Configuración de Base de Datos

Para conectar tu aplicación con Supabase, sigue estos pasos:

### 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com)
2. Crea una nueva cuenta o inicia sesión
3. Crea un nuevo proyecto
4. Espera a que el proyecto se inicialice

### 2. Configurar Variables de Entorno

1. Copia el archivo `.env.example` a `.env.local`:
```bash
cp .env.example .env.local
```

2. En tu proyecto de Supabase, ve a **Settings > API**
3. Copia los valores necesarios:
   - **URL**: Project URL
   - **ANON KEY**: Project API keys > anon public
   - **SERVICE_ROLE_KEY**: Project API keys > service_role (para el backend)

4. Actualiza `.env.local` con tus valores reales:
```env
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-key
```

### 3. Crear Tablas en Supabase

Ejecuta el siguiente SQL en el **SQL Editor** de Supabase:

```sql
-- Crear tabla de usuarios
CREATE TABLE users (
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
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_plan ON users(plan);
CREATE INDEX idx_users_is_active ON users(is_active);

-- Crear trigger para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE
    ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

### 4. Configurar Políticas de Seguridad (RLS)

Ejecuta este SQL para configurar las políticas de seguridad:

```sql
-- Habilitar Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Política para que los usuarios puedan ver solo su propia información
CREATE POLICY "Users can view own data" ON users
    FOR SELECT USING (auth.uid()::text = id::text);

-- Política para que los usuarios puedan actualizar solo su propia información
CREATE POLICY "Users can update own data" ON users
    FOR UPDATE USING (auth.uid()::text = id::text);

-- Política para permitir registro de nuevos usuarios
CREATE POLICY "Enable insert for registration" ON users
    FOR INSERT WITH CHECK (true);
```

### 5. Probar la Conexión

Una vez configurado todo, puedes probar:

1. Ejecutar la aplicación:
```bash
npm run dev
```

2. Ir a `/register` y crear una cuenta
3. Ir a `/login` e iniciar sesión

### 🔧 Troubleshooting

**Error: "Invalid credentials"**
- Verifica que las variables de entorno estén correctas
- Asegúrate de que la tabla `users` existe en Supabase

**Error: "Database error"**
- Revisa las políticas RLS en Supabase
- Verifica que el usuario tenga permisos para insertar/leer

**Error: "Token expired"**
- El JWT tiene una duración de 24h por defecto
- Puedes cambiar esto en `frontendAuthService.ts`

### 📚 Documentación Adicional

- [Supabase Auth](https://supabase.com/docs/guides/auth)
- [Supabase JavaScript Client](https://supabase.com/docs/reference/javascript)
- [Next.js Environment Variables](https://nextjs.org/docs/basic-features/environment-variables)

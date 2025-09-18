#!/bin/bash

# Script para ejecutar migraciones en Supabase
# Requiere que tengas configurado Supabase CLI

echo "🚀 Ejecutando migraciones de Supabase..."

# Verificar si Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI no está instalado. Instálalo con:"
    echo "npm install -g supabase"
    exit 1
fi

# Verificar si el proyecto está inicializado
if [ ! -f "supabase/config.toml" ]; then
    echo "📁 Inicializando proyecto Supabase..."
    supabase init
fi

# Ejecutar migración de usuarios
echo "👥 Ejecutando migración de tabla users..."
supabase db push --db-url "postgresql://postgres.jmfegokyvaflwegtyaun:Solketal@24@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" < database/migrations/001_create_users_table.sql

# Ejecutar migración de RLS
echo "🔒 Configurando Row Level Security..."
supabase db push --db-url "postgresql://postgres.jmfegokyvaflwegtyaun:Solketal@24@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" < database/migrations/002_setup_rls.sql

# Ejecutar triggers de autenticación
echo "🔗 Configurando triggers de autenticación..."
supabase db push --db-url "postgresql://postgres.jmfegokyvaflwegtyaun:Solketal@24@aws-0-eu-central-1.pooler.supabase.com:6543/postgres" < database/migrations/003_auth_trigger.sql

echo "✅ Migraciones completadas exitosamente!"
echo ""
echo "🌐 Puedes verificar en tu panel de Supabase:"
echo "https://supabase.com/dashboard/project/jmfegokyvaflwegtyaun"

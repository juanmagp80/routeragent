#!/bin/bash

# Script para ejecutar el backend de AgentRouter MCP en modo producción

echo "🚀 Starting AgentRouter MCP Backend in Production Mode..."

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "📁 Working directory: $PROJECT_DIR"

# Verificar si Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js v18 or later."
    exit 1
fi

# Verificar si npm está instalado
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm."
    exit 1
fi

# Verificar si Supabase CLI está instalado
if ! command -v supabase &> /dev/null; then
    echo "⚠️  Supabase CLI is not installed. Installing..."
    npm install -g supabase
fi

# Instalar dependencias
echo "📦 Installing dependencies..."
npm ci

# Ejecutar las migraciones de la base de datos
echo "🔧 Running database migrations..."
npx supabase migration up

# Ejecutar el script de configuración y seeding de la base de datos
echo "🌱 Setting up and seeding database..."
npm run setup-database

# Construir el proyecto
echo "🏗️  Building project..."
npm run build

# Iniciar el servidor en modo producción
echo "🔥 Starting server in production mode..."
npm run start

echo "🚀 AgentRouter MCP Backend started in production mode"
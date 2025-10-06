#!/bin/bash

# Script para iniciar solo el backend con puerto 3002

echo "🚀 Iniciando AgentRouter Backend..."

# Cambiar al directorio del backend
cd agentrouter-backend

# Cargar variables de entorno desde .env
if [ -f ".env" ]; then
    echo "📝 Cargando variables de entorno desde .env..."
    export $(cat .env | grep -v '^#' | grep -v '^$' | xargs)
fi

# Establecer variables de entorno para el backend
export PORT=${PORT:-3002}
export NODE_ENV=${NODE_ENV:-development}

echo "✅ Configuración:"
echo "   🚪 Puerto: $PORT"
echo "   🌍 Entorno: $NODE_ENV" 
echo "   🔗 Supabase URL: ${SUPABASE_URL:0:30}..."
echo "   🔑 Supabase Key: ${SUPABASE_KEY:0:20}..."

# Verificar si existe dist/app.js, si no, compilar
if [ ! -f "dist/app.js" ]; then
    echo "📦 Compilando TypeScript..."
    npm run build
fi

# Iniciar el backend usando el archivo compilado
echo "🎯 Iniciando servidor compilado..."
node dist/app.js
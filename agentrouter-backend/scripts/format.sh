#!/bin/bash

# Script para ejecutar el formateador de código del backend de AgentRouter MCP

echo "🎨 Running AgentRouter MCP Backend Code Formatter..."

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "📁 Working directory: $PROJECT_DIR"

# Verificar si Prettier está instalado
if ! command -v prettier &> /dev/null; then
    echo "⚠️  Prettier is not installed. Installing..."
    npm install --save-dev prettier
fi

# Ejecutar el formateador de código
echo "🔍 Running code formatter..."
npx prettier --write src/**/*.ts src/**/*.tsx

# Verificar el resultado del formateador
if [ $? -eq 0 ]; then
    echo "✅ Code formatting completed successfully!"
else
    echo "❌ Code formatting failed!"
    exit 1
fi

echo "🎨 AgentRouter MCP Backend code formatting completed"
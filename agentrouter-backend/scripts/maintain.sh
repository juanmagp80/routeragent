#!/bin/bash

# Script para ejecutar todas las tareas de mantenimiento del backend de AgentRouter MCP

echo "🛠️  Running AgentRouter MCP Backend Maintenance Tasks..."

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "📁 Working directory: $PROJECT_DIR"

# Ejecutar el linter
echo "🧹 Running linter..."
./scripts/lint.sh

# Verificar el resultado del linter
if [ $? -ne 0 ]; then
    echo "❌ Linting failed!"
    exit 1
fi

# Ejecutar el formateador de código
echo "🎨 Running code formatter..."
./scripts/format.sh

# Verificar el resultado del formateador
if [ $? -ne 0 ]; then
    echo "❌ Code formatting failed!"
    exit 1
fi

# Ejecutar las pruebas
echo "🧪 Running tests..."
./scripts/test.sh

# Verificar el resultado de las pruebas
if [ $? -ne 0 ]; then
    echo "❌ Tests failed!"
    exit 1
fi

echo "✅ All maintenance tasks completed successfully!"
echo "🛠️  AgentRouter MCP Backend maintenance completed"
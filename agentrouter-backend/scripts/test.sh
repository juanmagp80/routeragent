#!/bin/bash

# Script para ejecutar pruebas del backend de AgentRouter MCP

echo "🧪 Running AgentRouter MCP Backend Tests..."

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "📁 Working directory: $PROJECT_DIR"

# Verificar si Jest está instalado
if ! command -v jest &> /dev/null; then
    echo "⚠️  Jest is not installed. Installing..."
    npm install --save-dev jest @types/jest ts-jest
fi

# Ejecutar pruebas
echo "🔍 Running tests..."
npm test

# Verificar el resultado de las pruebas
if [ $? -eq 0 ]; then
    echo "✅ All tests passed!"
else
    echo "❌ Some tests failed!"
    exit 1
fi

echo "🧪 AgentRouter MCP Backend tests completed"
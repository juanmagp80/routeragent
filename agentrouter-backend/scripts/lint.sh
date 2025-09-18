#!/bin/bash

# Script para ejecutar el linter del backend de AgentRouter MCP

echo "🧹 Running AgentRouter MCP Backend Linter..."

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "📁 Working directory: $PROJECT_DIR"

# Verificar si ESLint está instalado
if ! command -v eslint &> /dev/null; then
    echo "⚠️  ESLint is not installed. Installing..."
    npm install --save-dev eslint @typescript-eslint/parser @typescript-eslint/eslint-plugin
fi

# Ejecutar el linter
echo "🔍 Running linter..."
npx eslint src/**/*.ts src/**/*.tsx

# Verificar el resultado del linter
if [ $? -eq 0 ]; then
    echo "✅ No linting errors found!"
else
    echo "❌ Linting errors found!"
    exit 1
fi

echo "🧹 AgentRouter MCP Backend linting completed"
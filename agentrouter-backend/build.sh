#!/bin/bash
set -e

echo "🚀 Building Router AI Backend..."

# Asegurarse de que estamos en el directorio correcto
cd "$(dirname "$0")"

# Instalar dependencias solo del backend
echo "📦 Installing dependencies..."
npm install

# Compilar TypeScript sin ESLint
echo "🔨 Compiling TypeScript..."
npx tsc

echo "✅ Build completed successfully!"
#!/bin/bash
set -e

echo "🚀 Starting Router AI Backend Deployment..."

# Ir directamente al directorio del backend
cd agentrouter-backend

echo "📁 Current directory: $(pwd)"
echo "📋 Files in directory:"
ls -la

# Limpiar instalaciones previas
echo "🧹 Cleaning previous installations..."
rm -rf node_modules/ dist/ package-lock.json

# Instalar dependencias del backend solamente
echo "📦 Installing backend dependencies..."
npm install --only=production
npm install --only=dev typescript @types/node

# Mostrar estructura del proyecto
echo "🔍 Backend source files:"
find src -name "*.ts" | head -10

# Compilar usando TypeScript directamente
echo "🔨 Compiling TypeScript..."
npx tsc --version
npx tsc

# Verificar resultado
if [ -f "dist/app.js" ]; then
    echo "✅ Backend compilation successful!"
    echo "📂 Generated files:"
    ls -la dist/
else
    echo "❌ Compilation failed"
    exit 1
fi

echo "🎉 Backend ready for production!"
#!/bin/bash
set -e

echo "🚀 Building Router AI Backend..."

# Asegurarse de que estamos en el directorio correcto
cd "$(dirname "$0")"

# Limpiar build anterior
echo "🧹 Cleaning previous build..."
rm -rf dist/

# Instalar dependencias solo del backend
echo "📦 Installing dependencies..."
npm install --production=false

# Compilar TypeScript sin ESLint usando solo archivos del backend
echo "🔨 Compiling TypeScript..."
npx tsc --project . --noEmitOnError false

# Verificar que el build fue exitoso
if [ -f "dist/app.js" ]; then
    echo "✅ Build completed successfully!"
    echo "📁 Backend compiled to: $(pwd)/dist/"
else
    echo "❌ Build failed: app.js not found in dist/"
    exit 1
fi
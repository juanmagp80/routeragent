#!/bin/bash

# Script para desplegar el backend de AgentRouter MCP

echo "🚀 Deploying AgentRouter MCP Backend..."

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

# Verificar si Docker está instalado (para despliegue local)
if ! command -v docker &> /dev/null; then
    echo "⚠️  Docker is not installed. Installing..."
    # En sistemas basados en Debian/Ubuntu
    if command -v apt &> /dev/null; then
        sudo apt update
        sudo apt install -y docker.io
        sudo systemctl start docker
        sudo systemctl enable docker
    # En sistemas basados en Red Hat/CentOS/Fedora
    elif command -v yum &> /dev/null || command -v dnf &> /dev/null; then
        if command -v dnf &> /dev/null; then
            sudo dnf install -y docker
        else
            sudo yum install -y docker
        fi
        sudo systemctl start docker
        sudo systemctl enable docker
    # En macOS
    elif [[ "$OSTYPE" == "darwin"* ]]; then
        echo "Please install Docker Desktop for Mac from https://www.docker.com/products/docker-desktop"
        exit 1
    # En Windows
    elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
        echo "Please install Docker Desktop for Windows from https://www.docker.com/products/docker-desktop"
        exit 1
    else
        echo "Unsupported OS. Please install Docker manually."
        exit 1
    fi
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

# Crear imagen de Docker
echo "🐳 Creating Docker image..."
docker build -t agentrouter-backend .

# Verificar si hay contenedores existentes y detenerlos
echo "🔍 Checking for existing containers..."
EXISTING_CONTAINERS=$(docker ps -aq -f name="agentrouter-backend")

if [ -n "$EXISTING_CONTAINERS" ]; then
    echo "🛑 Stopping existing containers: $EXISTING_CONTAINERS"
    docker stop $EXISTING_CONTAINERS
    docker rm $EXISTING_CONTAINERS
fi

# Iniciar contenedor de Docker
echo "🚀 Starting Docker container..."
docker run -d \
  --name agentrouter-backend \
  -p 3000:3000 \
  -e NODE_ENV=production \
  -e PORT=3000 \
  -e SUPABASE_URL=$SUPABASE_URL \
  -e SUPABASE_KEY=$SUPABASE_KEY \
  -e JWT_SECRET=$JWT_SECRET \
  -e OPENAI_API_KEY=$OPENAI_API_KEY \
  agentrouter-backend

# Verificar si el contenedor se inició correctamente
if [ $? -eq 0 ]; then
    echo "✅ AgentRouter MCP Backend deployed successfully!"
    echo "🌐 Access the API at: http://localhost:3000"
    echo "📊 Health check: http://localhost:3000/"
    echo "📚 API docs: http://localhost:3000/v1/route"
else
    echo "❌ Failed to deploy AgentRouter MCP Backend!"
    exit 1
fi

echo "🚀 AgentRouter MCP Backend deployment completed"
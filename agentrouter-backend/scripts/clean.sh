#!/bin/bash

# Script para limpiar el backend de AgentRouter MCP

echo "🧹 Cleaning AgentRouter MCP Backend..."

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "📁 Working directory: $PROJECT_DIR"

# Detener procesos de Node.js
echo "🛑 Stopping Node.js processes..."
NODE_PROCESSES=$(pgrep -f "node.*agentrouter-backend")

if [ -n "$NODE_PROCESSES" ]; then
    echo "🛑 Killing Node.js processes: $NODE_PROCESSES"
    kill $NODE_PROCESSES
    
    # Esperar un momento para que los procesos se detengan
    sleep 2
    
    # Verificar si aún hay procesos corriendo
    REMAINING_PROCESSES=$(pgrep -f "node.*agentrouter-backend")
    if [ -n "$REMAINING_PROCESSES" ]; then
        echo "⚠️  Some processes are still running, force killing..."
        kill -9 $REMAINING_PROCESSES
    fi
    
    echo "✅ Node.js processes stopped successfully"
else
    echo "ℹ️  No running AgentRouter MCP Backend processes found"
fi

# Detener contenedores de Docker si están en uso
echo "🔍 Checking for Docker containers..."
DOCKER_CONTAINERS=$(docker ps -q -f name="agentrouter")

if [ -n "$DOCKER_CONTAINERS" ]; then
    echo "🛑 Stopping Docker containers: $DOCKER_CONTAINERS"
    docker stop $DOCKER_CONTAINERS
    echo "✅ Docker containers stopped successfully"
else
    echo "ℹ️  No running AgentRouter MCP Docker containers found"
fi

# Eliminar contenedores de Docker detenidos
echo "🔍 Checking for stopped Docker containers..."
STOPPED_DOCKER_CONTAINERS=$(docker ps -aq -f name="agentrouter")

if [ -n "$STOPPED_DOCKER_CONTAINERS" ]; then
    echo "🗑️  Removing stopped Docker containers: $STOPPED_DOCKER_CONTAINERS"
    docker rm $STOPPED_DOCKER_CONTAINERS
    echo "✅ Stopped Docker containers removed successfully"
else
    echo "ℹ️  No stopped AgentRouter MCP Docker containers found"
fi

# Eliminar imágenes de Docker
echo "🔍 Checking for Docker images..."
DOCKER_IMAGES=$(docker images -q agentrouter-backend)

if [ -n "$DOCKER_IMAGES" ]; then
    echo "🗑️  Removing Docker images: $DOCKER_IMAGES"
    docker rmi $DOCKER_IMAGES
    echo "✅ Docker images removed successfully"
else
    echo "ℹ️  No AgentRouter MCP Docker images found"
fi

# Eliminar volúmenes de Docker
echo "🔍 Checking for Docker volumes..."
DOCKER_VOLUMES=$(docker volume ls -q -f name="agentrouter")

if [ -n "$DOCKER_VOLUMES" ]; then
    echo "🗑️  Removing Docker volumes: $DOCKER_VOLUMES"
    docker volume rm $DOCKER_VOLUMES
    echo "✅ Docker volumes removed successfully"
else
    echo "ℹ️  No AgentRouter MCP Docker volumes found"
fi

# Eliminar redes de Docker
echo "🔍 Checking for Docker networks..."
DOCKER_NETWORKS=$(docker network ls -q -f name="agentrouter")

if [ -n "$DOCKER_NETWORKS" ]; then
    echo "🗑️  Removing Docker networks: $DOCKER_NETWORKS"
    docker network rm $DOCKER_NETWORKS
    echo "✅ Docker networks removed successfully"
else
    echo "ℹ️  No AgentRouter MCP Docker networks found"
fi

# Limpiar directorios de construcción
echo "🧹 Cleaning build directories..."
if [ -d "dist" ]; then
    echo "🗑️  Removing dist directory..."
    rm -rf dist
    echo "✅ dist directory removed successfully"
else
    echo "ℹ️  No dist directory found"
fi

if [ -d "build" ]; then
    echo "🗑️  Removing build directory..."
    rm -rf build
    echo "✅ build directory removed successfully"
else
    echo "ℹ️  No build directory found"
fi

# Limpiar node_modules
echo "🧹 Cleaning node_modules..."
if [ -d "node_modules" ]; then
    echo "🗑️  Removing node_modules directory..."
    rm -rf node_modules
    echo "✅ node_modules directory removed successfully"
else
    echo "ℹ️  No node_modules directory found"
fi

# Limpiar archivos de bloqueo
echo "🧹 Cleaning lock files..."
if [ -f "package-lock.json" ]; then
    echo "🗑️  Removing package-lock.json..."
    rm -f package-lock.json
    echo "✅ package-lock.json removed successfully"
else
    echo "ℹ️  No package-lock.json found"
fi

if [ -f "yarn.lock" ]; then
    echo "🗑️  Removing yarn.lock..."
    rm -f yarn.lock
    echo "✅ yarn.lock removed successfully"
else
    echo "ℹ️  No yarn.lock found"
fi

# Limpiar caché de npm
echo "🧹 Cleaning npm cache..."
npm cache clean --force
echo "✅ npm cache cleaned successfully"

# Limpiar caché de yarn
if command -v yarn &> /dev/null; then
    echo "🧹 Cleaning yarn cache..."
    yarn cache clean
    echo "✅ yarn cache cleaned successfully"
fi

echo "🧹 AgentRouter MCP Backend cleaning completed"
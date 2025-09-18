#!/bin/bash

# Script para detener el backend de AgentRouter MCP

echo "🛑 Stopping AgentRouter MCP Backend..."

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "📁 Working directory: $PROJECT_DIR"

# Detener procesos de Node.js
echo "🔍 Looking for running Node.js processes..."
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
    
    echo "✅ Backend stopped successfully"
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

echo "👋 AgentRouter MCP Backend stopped"
#!/bin/bash

# Script para verificar el estado del backend de AgentRouter MCP

echo "🔍 Checking AgentRouter MCP Backend Status..."

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "📁 Working directory: $PROJECT_DIR"

# Verificar si hay procesos de Node.js corriendo
echo "🔍 Checking for running Node.js processes..."
NODE_PROCESSES=$(pgrep -f "node.*agentrouter-backend")

if [ -n "$NODE_PROCESSES" ]; then
    echo "✅ AgentRouter MCP Backend is running with PID(s): $NODE_PROCESSES"
    
    # Mostrar información detallada de los procesos
    for pid in $NODE_PROCESSES; do
        echo "   └─ PID: $pid"
        echo "      ├─ Command: $(ps -p $pid -o args=)"
        echo "      ├─ Start time: $(ps -p $pid -o lstart=)"
        echo "      └─ Memory usage: $(ps -p $pid -o rss=) KB"
    done
else
    echo "❌ AgentRouter MCP Backend is not running"
fi

# Verificar contenedores de Docker si están en uso
echo "🔍 Checking for Docker containers..."
DOCKER_CONTAINERS=$(docker ps -q -f name="agentrouter")

if [ -n "$DOCKER_CONTAINERS" ]; then
    echo "✅ AgentRouter MCP Docker containers are running:"
    docker ps -f name="agentrouter" --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
else
    echo "ℹ️  No AgentRouter MCP Docker containers are running"
fi

# Verificar puertos en uso
echo "🔍 Checking ports in use..."
PORT=${PORT:-3000}
if lsof -Pi :$PORT -sTCP:LISTEN -t >/dev/null ; then
    echo "✅ Port $PORT is in use by AgentRouter MCP Backend"
else
    echo "❌ Port $PORT is not in use"
fi

echo "📋 AgentRouter MCP Backend status check completed"
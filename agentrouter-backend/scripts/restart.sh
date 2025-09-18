#!/bin/bash

# Script para reiniciar el backend de AgentRouter MCP

echo "🔄 Restarting AgentRouter MCP Backend..."

# Directorio del proyecto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

echo "📁 Working directory: $PROJECT_DIR"

# Detener el backend si está corriendo
echo "🛑 Stopping backend if running..."
./scripts/stop.sh

# Iniciar el backend
echo "🚀 Starting backend..."
./scripts/start.sh
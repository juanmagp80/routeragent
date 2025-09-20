#!/bin/bash

# Script para iniciar solo el backend con puerto 3002

echo "Iniciando backend en puerto 3002..."

# Cambiar al directorio del backend
cd agentrouter-backend

# Establecer variables de entorno para el backend
export PORT=3002
export NODE_ENV=development

# Iniciar el backend
npx ts-node src/app.ts
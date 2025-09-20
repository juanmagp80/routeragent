#!/bin/bash

# Script para iniciar ambos servidores correctamente

echo "Iniciando servidores..."

# Iniciar backend
echo "Iniciando backend en puerto 3001..."
cd agentrouter-backend
npm run dev &

# Esperar un momento para que el backend se inicie
sleep 5

# Iniciar frontend
echo "Iniciando frontend en puerto 3000..."
cd ..
npx next dev --turbopack

echo "Servidores iniciados."
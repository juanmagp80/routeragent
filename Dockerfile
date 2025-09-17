# Etapa de construcción
FROM node:18-alpine AS builder

# Crear directorio de trabajo
WORKDIR /app

# Copiar archivos de configuración
COPY package*.json ./
COPY agentrouter-backend/package*.json ./agentrouter-backend/

# Instalar dependencias
RUN npm install --prefix agentrouter-backend

# Copiar código fuente
COPY agentrouter-backend/. ./agentrouter-backend

# Construir la aplicación
RUN npm run build --prefix agentrouter-backend

# Etapa de producción
FROM node:18-alpine AS runner

# Crear directorio de trabajo
WORKDIR /app

# Crear usuario no-root
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 --ingroup nodejs nextjs

# Copiar archivos de configuración
COPY --from=builder /app/agentrouter-backend/package*.json ./agentrouter-backend/
COPY --from=builder /app/agentrouter-backend/next.config.ts ./agentrouter-backend/
COPY --from=builder /app/agentrouter-backend/tsconfig.json ./agentrouter-backend/

# Copiar archivos construidos
COPY --from=builder /app/agentrouter-backend/.next ./agentrouter-backend/.next
COPY --from=builder /app/agentrouter-backend/public ./agentrouter-backend/public

# Instalar dependencias de producción
RUN npm install --production --prefix agentrouter-backend

# Cambiar permisos
RUN chown -R nextjs:nodejs ./agentrouter-backend
USER nextjs

# Exponer puerto
EXPOSE 3001

# Comando de inicio
CMD ["npm", "run", "start", "--prefix", "agentrouter-backend"]
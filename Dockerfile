# ============================================================================
# Dockerfile para CUENTY - Sistema unificado Backend + Frontend
# ============================================================================

# Etapa 1: Build del Frontend Next.js
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copiar archivos de dependencias del frontend
COPY nextjs_space/package*.json ./

# Instalar dependencias
RUN npm ci --omit=dev

# Copiar código del frontend
COPY nextjs_space/ ./

# Build del frontend Next.js
RUN npm run build

# ============================================================================
# Etapa 2: Backend + Frontend combinados
FROM node:18-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    bash \
    curl \
    lsof

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Crear directorio de trabajo
WORKDIR /app

# Copiar dependencias del backend
COPY backend/package*.json ./backend/

# Instalar dependencias del backend
WORKDIR /app/backend
RUN npm ci --omit=dev

# Copiar código del backend
COPY backend/ ./

# Copiar el frontend construido de la etapa anterior
WORKDIR /app
COPY --from=frontend-builder /app/frontend ./nextjs_space

# Copiar script de inicio
COPY start-docker.sh ./
RUN chmod +x start-docker.sh

# Crear directorio de logs
RUN mkdir -p /app/logs && \
    chown -R nodejs:nodejs /app

# Cambiar al usuario no-root
USER nodejs

# Exponer puertos
# 3000: Backend (con proxy al frontend)
# 3001: Frontend Next.js (interno)
EXPOSE 3000 3001

# Variables de entorno
ENV NODE_ENV=production \
    PORT=3000 \
    NEXTJS_PORT=3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

# Comando de inicio
CMD ["./start-docker.sh"]

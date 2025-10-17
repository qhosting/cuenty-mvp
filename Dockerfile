# ============================================================================
# Dockerfile para CUENTY - Sistema unificado Backend + Frontend
# Build secuencial robusto: Backend → Frontend → Imagen Final
# ============================================================================

# ============================================================================
# ETAPA 1: Construcción del Backend
# ============================================================================
FROM node:18-alpine AS backend-builder

WORKDIR /app/backend

# Copiar archivos de dependencias primero (mejor uso de cache de Docker)
COPY backend/package.json backend/package-lock.json ./

# Instalar TODAS las dependencias (incluyendo dev para posibles builds)
RUN npm ci

# Copiar código del backend
COPY backend/ ./

# Verificar que la instalación fue exitosa
RUN echo "✓ Backend dependencies installed successfully" && \
    node --version && \
    npm --version

# ============================================================================
# ETAPA 2: Construcción del Frontend Next.js
# ============================================================================
FROM node:18-alpine AS frontend-builder

WORKDIR /app/frontend

# Copiar archivos de dependencias primero (mejor uso de cache)
COPY nextjs_space/package.json nextjs_space/package-lock.json ./

# Instalar TODAS las dependencias (necesarias para el build)
RUN npm ci

# Copiar código del frontend
COPY nextjs_space/ ./

# Variables de entorno necesarias para el build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production
# Variables para NextAuth durante el build (no se usan en runtime)
ENV BUILDING=true
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_SECRET=build-time-secret-not-used-in-production
ENV DATABASE_URL=file:./build-dummy.db

# Generar Prisma Client ANTES del build de Next.js
RUN npx prisma generate && \
    echo "✓ Prisma Client generated successfully"

# Build del frontend Next.js
RUN npm run build

# Verificar que el build fue exitoso
RUN echo "✓ Frontend build completed successfully" && \
    ls -la .next/ && \
    echo "Build output size:" && \
    du -sh .next/

# ============================================================================
# ETAPA 3: Imagen Final - Backend + Frontend combinados
# ============================================================================
FROM node:18-alpine

# Instalar dependencias del sistema necesarias
RUN apk add --no-cache \
    bash \
    curl \
    lsof \
    tini

# Crear usuario no-root para seguridad
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

# Establecer directorio de trabajo
WORKDIR /app

# ============================================================================
# Copiar Backend construido (solo producción)
# ============================================================================
WORKDIR /app/backend

# Copiar package.json primero
COPY backend/package.json backend/package-lock.json ./

# Instalar SOLO dependencias de producción
RUN npm ci --only=production && \
    echo "✓ Backend production dependencies installed"

# Copiar código del backend desde la etapa builder
COPY --from=backend-builder /app/backend/ ./

# ============================================================================
# Copiar Frontend construido
# ============================================================================
WORKDIR /app

# Copiar el frontend construido completo (con node_modules de producción)
COPY --from=frontend-builder /app/frontend/package.json \
                             /app/frontend/package-lock.json \
                             ./nextjs_space/

# Instalar SOLO dependencias de producción para Next.js
WORKDIR /app/nextjs_space
RUN npm ci --only=production && \
    echo "✓ Frontend production dependencies installed"

# Copiar archivos construidos y necesarios del frontend
COPY --from=frontend-builder /app/frontend/.next ./nextjs_space/.next
COPY --from=frontend-builder /app/frontend/public ./nextjs_space/public
COPY --from=frontend-builder /app/frontend/next.config.js ./nextjs_space/
COPY --from=frontend-builder /app/frontend/.env* ./nextjs_space/ 2>/dev/null || true

# ============================================================================
# Configuración final
# ============================================================================
WORKDIR /app

# Copiar scripts de inicio y healthcheck
COPY start-docker.sh ./
COPY scripts/ ./scripts/
RUN chmod +x start-docker.sh ./scripts/*.sh

# Crear directorios necesarios
RUN mkdir -p /app/logs /app/database && \
    chown -R nodejs:nodejs /app

# Cambiar al usuario no-root
USER nodejs

# Exponer puertos
# 3000: Backend API (con proxy al frontend)
# 3001: Frontend Next.js (interno)
EXPOSE 3000 3001

# Variables de entorno
ENV NODE_ENV=production \
    PORT=3000 \
    NEXTJS_PORT=3001 \
    NEXT_TELEMETRY_DISABLED=1

# Healthcheck mejorado con más tiempo de inicio
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD ./scripts/healthcheck.sh || exit 1

# Usar tini como init system para mejor manejo de señales
ENTRYPOINT ["/sbin/tini", "--"]

# Comando de inicio
CMD ["./start-docker.sh"]

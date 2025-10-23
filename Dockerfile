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

# Generar Prisma Client para el backend
RUN if [ -f "prisma/schema.prisma" ]; then \
        echo "🔄 Generando Prisma Client para el backend..."; \
        npx prisma generate && \
        echo "✓ Prisma Client generado exitosamente para el backend"; \
    else \
        echo "⚠️  No se encontró schema.prisma en el backend"; \
    fi

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
# Indicador de fase de build para NextAuth
ENV BUILDING=true
ENV NEXT_PHASE=phase-production-build
# Variables dummy para NextAuth durante el build (sobrescritas por Easypanel en runtime)
ENV NEXTAUTH_URL=http://localhost:3000
ENV NEXTAUTH_SECRET=dummy-build-secret-must-be-changed-in-production-via-easypanel
# Variable dummy para Prisma durante el build (sobrescrita por Easypanel en runtime)
ENV DATABASE_URL=file:./build-dummy.db
# Variables adicionales que pueden ser requeridas
ENV SKIP_ENV_VALIDATION=true

# Generar Prisma Client ANTES del build de Next.js
# Limpiar directorio .prisma existente para evitar conflictos de permisos
RUN rm -rf ./node_modules/.prisma 2>/dev/null || true && \
    npx prisma generate && \
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

# Copiar scripts de migración del backend (CRÍTICO para migraciones automáticas)
COPY backend/scripts ./scripts
RUN chmod +x ./scripts/*.js ./scripts/*.sh 2>/dev/null || chmod +x ./scripts/*.js && \
    echo "✓ Backend migration scripts copied and marked as executable"

# Generar Prisma Client para el backend en la imagen final
RUN if [ -f "prisma/schema.prisma" ]; then \
        echo "🔄 Regenerando Prisma Client para el backend en producción..."; \
        rm -rf ./node_modules/.prisma 2>/dev/null || true && \
        npx prisma generate && \
        echo "✓ Prisma Client generado para el backend en producción"; \
    else \
        echo "⚠️  No se encontró schema.prisma en el backend"; \
    fi

# ============================================================================
# Copiar Frontend construido
# ============================================================================
WORKDIR /app/nextjs_space

# Copiar package.json y package-lock.json
COPY --from=frontend-builder /app/frontend/package.json \
                             /app/frontend/package-lock.json \
                             ./

# Instalar SOLO dependencias de producción para Next.js
RUN npm ci --only=production && \
    echo "✓ Frontend production dependencies installed"

# Copiar el directorio prisma (necesario para el Cliente de Prisma y migraciones)
COPY --from=frontend-builder /app/frontend/prisma ./prisma

# Generar Prisma Client en la imagen final (con binarios correctos para Alpine)
# Limpiar directorio .prisma existente para evitar conflictos de permisos
RUN rm -rf ./node_modules/.prisma 2>/dev/null || true && \
    npx prisma generate && \
    echo "✓ Prisma Client generated for production"

# Copiar scripts de migración (necesarios para migraciones automáticas en producción)
# IMPORTANTE: Las migraciones se ejecutan automáticamente al iniciar el contenedor
# mediante start-docker.sh antes de iniciar la aplicación
COPY --from=frontend-builder /app/frontend/scripts ./scripts
RUN chmod +x ./scripts/*.sh ./scripts/*.js 2>/dev/null || chmod +x ./scripts/*.js && \
    echo "✓ Migration scripts copied and marked as executable"

# Copiar archivos construidos del frontend en modo standalone
# El modo standalone crea un servidor Node.js optimizado y autocontenido
COPY --from=frontend-builder /app/frontend/.next/standalone ./
COPY --from=frontend-builder /app/frontend/.next/static ./.next/static
COPY --from=frontend-builder /app/frontend/public ./public

# Nota: En modo standalone, Next.js incluye automáticamente:
# - Todas las rutas API (/app/api/*)
# - Todas las páginas y componentes necesarios
# - Las dependencias mínimas requeridas
# - Un server.js optimizado que respeta HOSTNAME=0.0.0.0
# No necesitamos copiar manualmente app/, components/, lib/, types/ ya que
# están incluidos en el bundle standalone optimizado

# ============================================================================
# Configuración final
# ============================================================================
WORKDIR /app

# Copiar scripts de inicio y healthcheck
COPY start-docker.sh ./
COPY scripts/ ./scripts/
RUN chmod +x start-docker.sh ./scripts/*.sh && \
    echo "✓ Scripts copiados y marcados como ejecutables:" && \
    ls -la ./scripts/*.sh

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

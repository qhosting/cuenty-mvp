#!/bin/bash

################################################################################
# Script de Inicio con Migraciones Automáticas para Next.js + Prisma
# 
# Este script ejecuta las migraciones de base de datos ANTES de iniciar
# el servidor Next.js, asegurando que la base de datos esté actualizada.
#
# Características:
# - Ejecuta migraciones automáticamente usando migrate deploy (SEGURO)
# - Genera Prisma Client
# - Manejo robusto de errores
# - Logs detallados
# - Verificación de servicios
################################################################################

set -e  # Detener en caso de error

# Colores para logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Función de log con timestamp
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✓${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ✗${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠${NC} $1"
}

# Función para mostrar banner
show_banner() {
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║       CUENTY - Sistema de Migraciones Automáticas         ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
}

# Función para verificar DATABASE_URL
check_database_url() {
    log "Verificando configuración de base de datos..."
    
    if [ -z "$DATABASE_URL" ]; then
        log_error "DATABASE_URL no está configurada"
        log_error "Por favor, configure la variable de entorno DATABASE_URL"
        exit 1
    fi
    
    # Sanitizar URL para logs (ocultar credenciales)
    SANITIZED_URL=$(echo "$DATABASE_URL" | sed -E 's/:\/\/([^:]+):([^@]+)@/:\/\/***:***@/')
    log_success "Base de datos configurada: $SANITIZED_URL"
}

# Función para esperar a que la base de datos esté lista
wait_for_database() {
    log "Esperando a que la base de datos esté disponible..."
    
    MAX_ATTEMPTS=30
    ATTEMPT=0
    
    while [ $ATTEMPT -lt $MAX_ATTEMPTS ]; do
        if npx prisma db execute --stdin <<< "SELECT 1;" 2>/dev/null; then
            log_success "Base de datos disponible"
            return 0
        fi
        
        ATTEMPT=$((ATTEMPT + 1))
        log_warning "Base de datos no disponible (intento $ATTEMPT/$MAX_ATTEMPTS)..."
        sleep 2
    done
    
    log_error "No se pudo conectar a la base de datos después de $MAX_ATTEMPTS intentos"
    return 1
}

# Función para ejecutar migraciones
run_migrations() {
    log "Ejecutando migraciones de base de datos..."
    log_warning "Modo SEGURO: usando 'prisma migrate deploy' (no resetea datos)"
    
    if node scripts/migrate.js; then
        log_success "Migraciones completadas exitosamente"
        return 0
    else
        log_error "Error al ejecutar migraciones"
        return 1
    fi
}

# Función para iniciar Next.js
start_nextjs() {
    log "Iniciando servidor Next.js..."
    log "Puerto: ${NEXTJS_PORT:-3001}"
    
    # Ejecutar Next.js en modo producción
    exec npm start
}

# Función principal
main() {
    show_banner
    
    log "Inicio del proceso de arranque con migraciones"
    log "Fecha: $(date +'%Y-%m-%d %H:%M:%S')"
    echo ""
    
    # Paso 1: Verificar DATABASE_URL
    check_database_url
    echo ""
    
    # Paso 2: Esperar a que la base de datos esté lista
    if ! wait_for_database; then
        log_error "No se pudo establecer conexión con la base de datos"
        exit 1
    fi
    echo ""
    
    # Paso 3: Ejecutar migraciones
    if ! run_migrations; then
        log_error "Error en el proceso de migraciones"
        log_warning "Iniciando servidor sin aplicar migraciones..."
        log_warning "ADVERTENCIA: La aplicación puede no funcionar correctamente"
        echo ""
    fi
    echo ""
    
    # Paso 4: Iniciar Next.js
    log_success "Todas las verificaciones completadas"
    log "Iniciando aplicación..."
    echo ""
    start_nextjs
}

# Manejador de señales para limpieza
cleanup() {
    log_warning "Señal de terminación recibida, cerrando gracefully..."
    exit 0
}

trap cleanup SIGTERM SIGINT

# Ejecutar función principal
main

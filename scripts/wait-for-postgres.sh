#!/bin/bash

# ============================================================================
# Script de Verificación de Conectividad PostgreSQL
# ============================================================================
# Este script verifica que PostgreSQL esté accesible antes de ejecutar 
# migraciones. Es más robusto que usar Prisma directamente.
#
# Características:
# - Múltiples métodos de verificación (nc, timeout, curl)
# - Hasta 30 reintentos (2.5 minutos de espera)
# - Delay de 5 segundos entre intentos
# - Logs claros de progreso
# - Parse de DATABASE_URL para extraer host y puerto
# ============================================================================

set -e

# Colores para logs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuración
MAX_ATTEMPTS=${1:-30}  # Default: 30 intentos
RETRY_DELAY=${2:-5}     # Default: 5 segundos
START_TIME=$(date +%s)

echo -e "${BLUE}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║  Verificación de Conectividad PostgreSQL                  ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════════╝${NC}"
echo ""

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
    echo -e "${RED}❌ ERROR: DATABASE_URL no está configurada${NC}"
    exit 1
fi

# Parse de DATABASE_URL para extraer host y puerto
# Formato: postgresql://user:password@host:port/database
echo -e "${CYAN}🔍 Analizando DATABASE_URL...${NC}"

# Sanitizar URL para mostrar (ocultar credenciales)
SANITIZED_URL=$(echo "$DATABASE_URL" | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/')
echo -e "${CYAN}   URL: ${SANITIZED_URL}${NC}"

# Extraer host y puerto usando regex
if [[ $DATABASE_URL =~ postgresql://([^:]+):([^@]+)@([^:]+):([0-9]+)/(.+) ]]; then
    DB_USER="${BASH_REMATCH[1]}"
    DB_PASSWORD="${BASH_REMATCH[2]}"
    DB_HOST="${BASH_REMATCH[3]}"
    DB_PORT="${BASH_REMATCH[4]}"
    DB_NAME="${BASH_REMATCH[5]}"
    # Remover parámetros adicionales del nombre de la base de datos
    DB_NAME=$(echo "$DB_NAME" | cut -d'?' -f1)
else
    echo -e "${RED}❌ ERROR: No se pudo parsear DATABASE_URL${NC}"
    echo -e "${YELLOW}   Formato esperado: postgresql://user:password@host:port/database${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Database URL parseada exitosamente:${NC}"
echo -e "${CYAN}   Host: ${DB_HOST}${NC}"
echo -e "${CYAN}   Puerto: ${DB_PORT}${NC}"
echo -e "${CYAN}   Base de datos: ${DB_NAME}${NC}"
echo -e "${CYAN}   Usuario: ${DB_USER}${NC}"
echo ""

# Función para verificar conectividad
check_postgres() {
    local method=$1
    
    case $method in
        "nc")
            # Método 1: netcat (nc) - más rápido
            if command -v nc >/dev/null 2>&1; then
                nc -z -w 2 "$DB_HOST" "$DB_PORT" 2>/dev/null
                return $?
            fi
            return 1
            ;;
        "timeout")
            # Método 2: timeout con /dev/tcp
            timeout 2 bash -c "cat < /dev/null > /dev/tcp/$DB_HOST/$DB_PORT" 2>/dev/null
            return $?
            ;;
        "telnet")
            # Método 3: telnet (si está disponible)
            if command -v telnet >/dev/null 2>&1; then
                timeout 2 telnet "$DB_HOST" "$DB_PORT" </dev/null 2>/dev/null | grep -q "Connected"
                return $?
            fi
            return 1
            ;;
        *)
            return 1
            ;;
    esac
}

# Detectar métodos disponibles
AVAILABLE_METHODS=()
if command -v nc >/dev/null 2>&1; then
    AVAILABLE_METHODS+=("nc")
fi
AVAILABLE_METHODS+=("timeout")
if command -v telnet >/dev/null 2>&1; then
    AVAILABLE_METHODS+=("telnet")
fi

echo -e "${BLUE}🔧 Métodos de verificación disponibles: ${AVAILABLE_METHODS[*]}${NC}"
echo ""

# Loop de verificación
echo -e "${YELLOW}⏳ Esperando a que PostgreSQL esté disponible en ${DB_HOST}:${DB_PORT}...${NC}"
echo -e "${YELLOW}   Máximo de intentos: ${MAX_ATTEMPTS}${NC}"
echo -e "${YELLOW}   Delay entre intentos: ${RETRY_DELAY}s${NC}"
echo ""

for attempt in $(seq 1 $MAX_ATTEMPTS); do
    CURRENT_TIME=$(date +%s)
    ELAPSED=$((CURRENT_TIME - START_TIME))
    
    echo -e "${CYAN}[Intento ${attempt}/${MAX_ATTEMPTS}] [${ELAPSED}s transcurridos]${NC} Verificando conectividad..."
    
    # Intentar con cada método disponible
    CONNECTED=false
    for method in "${AVAILABLE_METHODS[@]}"; do
        if check_postgres "$method"; then
            CONNECTED=true
            echo -e "${GREEN}   ✓ Conexión exitosa usando método: ${method}${NC}"
            break
        fi
    done
    
    if [ "$CONNECTED" = true ]; then
        echo ""
        echo -e "${GREEN}╔═══════════════════════════════════════════════════════════╗${NC}"
        echo -e "${GREEN}║  ✅ PostgreSQL está disponible y aceptando conexiones     ║${NC}"
        echo -e "${GREEN}╚═══════════════════════════════════════════════════════════╝${NC}"
        echo -e "${GREEN}⏱️  Tiempo total de espera: ${ELAPSED} segundos${NC}"
        echo -e "${GREEN}🎯 Host: ${DB_HOST}:${DB_PORT}${NC}"
        echo ""
        exit 0
    fi
    
    if [ $attempt -lt $MAX_ATTEMPTS ]; then
        echo -e "${YELLOW}   ⚠️  No se pudo conectar. Reintentando en ${RETRY_DELAY}s...${NC}"
        sleep $RETRY_DELAY
    fi
done

# Si llegamos aquí, fallaron todos los intentos
CURRENT_TIME=$(date +%s)
ELAPSED=$((CURRENT_TIME - START_TIME))

echo ""
echo -e "${RED}╔═══════════════════════════════════════════════════════════╗${NC}"
echo -e "${RED}║  ❌ No se pudo conectar a PostgreSQL                       ║${NC}"
echo -e "${RED}╚═══════════════════════════════════════════════════════════╝${NC}"
echo -e "${RED}⏱️  Tiempo total transcurrido: ${ELAPSED} segundos${NC}"
echo -e "${RED}🎯 Host objetivo: ${DB_HOST}:${DB_PORT}${NC}"
echo ""
echo -e "${YELLOW}💡 Posibles causas:${NC}"
echo -e "${YELLOW}   1. La base de datos no está corriendo${NC}"
echo -e "${YELLOW}   2. El host o puerto son incorrectos${NC}"
echo -e "${YELLOW}   3. Problemas de red entre contenedores${NC}"
echo -e "${YELLOW}   4. Firewall bloqueando la conexión${NC}"
echo ""
echo -e "${YELLOW}🔧 Sugerencias:${NC}"
echo -e "${YELLOW}   1. Verificar que el contenedor de base de datos esté corriendo${NC}"
echo -e "${YELLOW}   2. Verificar DATABASE_URL: ${SANITIZED_URL}${NC}"
echo -e "${YELLOW}   3. Revisar logs de la base de datos${NC}"
echo -e "${YELLOW}   4. Intentar ping al host: ping ${DB_HOST}${NC}"
echo ""

exit 1

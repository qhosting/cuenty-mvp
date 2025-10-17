#!/bin/bash

# ============================================================================
# CUENTY - Script de inicio unificado
# Inicia Backend (Express) en puerto 3000 y Frontend (Next.js) en puerto 3001
# El backend hace proxy de todas las rutas no-API al frontend
# ============================================================================

set -e  # Salir si algún comando falla

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Directorio base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/nextjs_space"
LOG_DIR="$BASE_DIR/logs"

# Crear directorio de logs si no existe
mkdir -p "$LOG_DIR"

# Banner
echo -e "${CYAN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║                  🎬 CUENTY - Inicio                       ║
║                Sistema Unificado v2.0                     ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

# Función para verificar si un puerto está en uso
check_port() {
    local port=$1
    if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null 2>&1 ; then
        return 0  # Puerto en uso
    else
        return 1  # Puerto libre
    fi
}

# Función para matar proceso en un puerto
kill_port() {
    local port=$1
    echo -e "${YELLOW}⚠️  Puerto $port en uso, liberando...${NC}"
    lsof -ti:$port | xargs kill -9 2>/dev/null || true
    sleep 1
}

# Verificar y liberar puertos si es necesario
if check_port 3000; then
    kill_port 3000
fi

if check_port 3001; then
    kill_port 3001
fi

# Función de limpieza al salir
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Backend detenido${NC}"
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
        echo -e "${GREEN}✅ Frontend detenido${NC}"
    fi
    
    echo -e "${BLUE}👋 ¡Hasta pronto!${NC}"
    exit 0
}

# Registrar función de limpieza
trap cleanup SIGINT SIGTERM EXIT

# ============================================================================
# PASO 1: Verificar estructura del proyecto
# ============================================================================
echo -e "${BLUE}📋 Verificando estructura del proyecto...${NC}"

if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Error: No se encuentra el directorio backend${NC}"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Error: No se encuentra el directorio nextjs_space${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Estructura verificada${NC}"

# ============================================================================
# PASO 2: Instalar dependencias si es necesario
# ============================================================================
echo -e "${BLUE}📦 Verificando dependencias...${NC}"

if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Instalando dependencias del backend...${NC}"
    cd "$BACKEND_DIR"
    npm install
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Instalando dependencias del frontend...${NC}"
    cd "$FRONTEND_DIR"
    npm install
fi

echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# ============================================================================
# PASO 3: Iniciar Frontend (Next.js) en puerto 3001
# ============================================================================
echo ""
echo -e "${BLUE}🎨 Iniciando Frontend (Next.js) en puerto 3001...${NC}"
cd "$FRONTEND_DIR"

# Iniciar Next.js en background
PORT=3001 npm run dev > "$LOG_DIR/frontend.log" 2>&1 &
FRONTEND_PID=$!

echo -e "${GREEN}✅ Frontend iniciado (PID: $FRONTEND_PID)${NC}"
echo -e "   📝 Logs: tail -f $LOG_DIR/frontend.log"

# Esperar a que Next.js esté listo
echo -e "${YELLOW}⏳ Esperando a que Next.js esté listo...${NC}"
sleep 8

# Verificar que el proceso siga corriendo
if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Error: El frontend no se inició correctamente${NC}"
    echo -e "   Revisa el log: tail -f $LOG_DIR/frontend.log"
    exit 1
fi

# ============================================================================
# PASO 4: Iniciar Backend (Express) en puerto 3000
# ============================================================================
echo ""
echo -e "${BLUE}🔧 Iniciando Backend (Express + Proxy) en puerto 3000...${NC}"
cd "$BACKEND_DIR"

# Iniciar backend en background
PORT=3000 NEXTJS_PORT=3001 node server.js > "$LOG_DIR/backend.log" 2>&1 &
BACKEND_PID=$!

echo -e "${GREEN}✅ Backend iniciado (PID: $BACKEND_PID)${NC}"
echo -e "   📝 Logs: tail -f $LOG_DIR/backend.log"

# Esperar a que el backend esté listo
echo -e "${YELLOW}⏳ Esperando a que el backend esté listo...${NC}"
sleep 3

# Verificar que el proceso siga corriendo
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Error: El backend no se inició correctamente${NC}"
    echo -e "   Revisa el log: tail -f $LOG_DIR/backend.log"
    exit 1
fi

# ============================================================================
# PASO 5: Verificar que ambos servicios estén funcionando
# ============================================================================
echo ""
echo -e "${BLUE}🔍 Verificando servicios...${NC}"

# Verificar backend
if curl -s http://localhost:3000/health > /dev/null; then
    echo -e "${GREEN}✅ Backend respondiendo correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  Backend tardando en responder (esto es normal)${NC}"
fi

# Verificar frontend
if curl -s http://localhost:3001 > /dev/null; then
    echo -e "${GREEN}✅ Frontend respondiendo correctamente${NC}"
else
    echo -e "${YELLOW}⚠️  Frontend tardando en responder (esto es normal)${NC}"
fi

# ============================================================================
# SISTEMA LISTO
# ============================================================================
echo ""
echo -e "${GREEN}"
cat << "EOF"
╔═══════════════════════════════════════════════════════════╗
║         ✅ CUENTY - Sistema iniciado correctamente        ║
╚═══════════════════════════════════════════════════════════╝
EOF
echo -e "${NC}"

echo -e "${CYAN}🌐 Accesos principales:${NC}"
echo -e "   ${GREEN}🏠 Sitio Web:        ${BLUE}http://localhost:3000${NC}"
echo -e "   ${GREEN}🛡️  API Info:        ${BLUE}http://localhost:3000/api-info${NC}"
echo -e "   ${GREEN}💊 Health Check:    ${BLUE}http://localhost:3000/health${NC}"
echo -e "   ${GREEN}📚 API Version:     ${BLUE}http://localhost:3000/api/version${NC}"

echo ""
echo -e "${CYAN}🔧 Servicios internos:${NC}"
echo -e "   Backend:  http://localhost:3000 (Express + Proxy)"
echo -e "   Frontend: http://localhost:3001 (Next.js directo)"

echo ""
echo -e "${CYAN}📊 Monitoreo de logs:${NC}"
echo -e "   ${YELLOW}Backend:${NC}  tail -f $LOG_DIR/backend.log"
echo -e "   ${YELLOW}Frontend:${NC} tail -f $LOG_DIR/frontend.log"
echo -e "   ${YELLOW}Ambos:${NC}    tail -f $LOG_DIR/*.log"

echo ""
echo -e "${RED}⏹️  Para detener: Presiona ${YELLOW}Ctrl+C${NC}"
echo ""

# Mantener el script corriendo y mostrar logs
tail -f "$LOG_DIR/backend.log" "$LOG_DIR/frontend.log" &
TAIL_PID=$!

# Esperar indefinidamente (hasta Ctrl+C)
wait

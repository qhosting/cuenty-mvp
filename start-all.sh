#!/bin/bash

# Script para iniciar el backend y frontend de CUENTY simultáneamente
# Autor: CUENTY Team
# Fecha: 2025-10-17

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           🚀 Iniciando CUENTY - Sistema Completo          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

# Colores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Directorio base
BASE_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$BASE_DIR/backend"
FRONTEND_DIR="$BASE_DIR/nextjs_space"

# Verificar que los directorios existan
if [ ! -d "$BACKEND_DIR" ]; then
    echo -e "${RED}❌ Error: No se encuentra el directorio backend${NC}"
    exit 1
fi

if [ ! -d "$FRONTEND_DIR" ]; then
    echo -e "${RED}❌ Error: No se encuentra el directorio nextjs_space${NC}"
    exit 1
fi

# Verificar que node_modules estén instalados
echo -e "${BLUE}📦 Verificando dependencias...${NC}"

if [ ! -d "$BACKEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Instalando dependencias del backend...${NC}"
    cd "$BACKEND_DIR"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error instalando dependencias del backend${NC}"
        exit 1
    fi
fi

if [ ! -d "$FRONTEND_DIR/node_modules" ]; then
    echo -e "${YELLOW}⚠️  Instalando dependencias del frontend...${NC}"
    cd "$FRONTEND_DIR"
    npm install
    if [ $? -ne 0 ]; then
        echo -e "${RED}❌ Error instalando dependencias del frontend${NC}"
        exit 1
    fi
fi

echo -e "${GREEN}✅ Dependencias verificadas${NC}"
echo ""

# Función para manejar la señal de interrupción (Ctrl+C)
cleanup() {
    echo ""
    echo -e "${YELLOW}🛑 Deteniendo servicios...${NC}"
    
    # Matar el proceso del backend si está corriendo
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Backend detenido${NC}"
    fi
    
    # Matar el proceso del frontend si está corriendo
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null
        echo -e "${GREEN}✅ Frontend detenido${NC}"
    fi
    
    echo -e "${BLUE}👋 ¡Hasta pronto!${NC}"
    exit 0
}

# Registrar la función de limpieza para Ctrl+C
trap cleanup SIGINT SIGTERM

# Iniciar Backend
echo -e "${BLUE}🔧 Iniciando Backend (Express API)...${NC}"
cd "$BACKEND_DIR"
node server.js > ../logs/backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✅ Backend iniciado (PID: $BACKEND_PID) - Puerto 3000${NC}"
echo -e "   📝 Logs en: logs/backend.log"
echo ""

# Esperar un poco para que el backend se inicie
sleep 2

# Iniciar Frontend
echo -e "${BLUE}🎨 Iniciando Frontend (Next.js)...${NC}"
cd "$FRONTEND_DIR"
npm run dev > ../logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✅ Frontend iniciado (PID: $FRONTEND_PID) - Puerto 3001${NC}"
echo -e "   📝 Logs en: logs/frontend.log"
echo ""

# Esperar a que los servicios estén listos
echo -e "${YELLOW}⏳ Esperando a que los servicios estén listos...${NC}"
sleep 5

# Verificar que los procesos sigan corriendo
if ! kill -0 $BACKEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Error: El backend no se inició correctamente${NC}"
    echo -e "   Revisa el log en: logs/backend.log"
    exit 1
fi

if ! kill -0 $FRONTEND_PID 2>/dev/null; then
    echo -e "${RED}❌ Error: El frontend no se inició correctamente${NC}"
    echo -e "   Revisa el log en: logs/frontend.log"
    # Limpiar el backend
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# Mensaje de éxito
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║          ✅ CUENTY - Sistema iniciado con éxito           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo -e "${GREEN}🌐 Accesos:${NC}"
echo -e "   🏠 Sitio Principal: ${BLUE}http://localhost:3000${NC}"
echo -e "   👨‍💼 Panel Admin:      ${BLUE}http://localhost:3000/admin${NC}"
echo -e "   📚 API Info:        ${BLUE}http://localhost:3000/api-info${NC}"
echo -e "   💊 Health Check:    ${BLUE}http://localhost:3000/health${NC}"
echo ""
echo -e "${YELLOW}📊 Monitoreo:${NC}"
echo -e "   Backend logs:  ${BLUE}tail -f logs/backend.log${NC}"
echo -e "   Frontend logs: ${BLUE}tail -f logs/frontend.log${NC}"
echo ""
echo -e "${YELLOW}⏹️  Para detener: ${RED}Presiona Ctrl+C${NC}"
echo ""

# Mantener el script corriendo y mostrar logs en tiempo real
tail -f "$BASE_DIR/logs/backend.log" -f "$BASE_DIR/logs/frontend.log" &
TAIL_PID=$!

# Esperar a que se detenga alguno de los procesos
wait $BACKEND_PID $FRONTEND_PID

# Si llegamos aquí, uno de los procesos terminó inesperadamente
echo ""
echo -e "${RED}❌ Error: Uno de los servicios se detuvo inesperadamente${NC}"
cleanup

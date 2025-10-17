#!/bin/bash

# ============================================================================
# CUENTY - Script de inicio para Docker
# Inicia Backend y Frontend en un contenedor Docker
# ============================================================================

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║          🎬 CUENTY Docker - Iniciando Sistema             ║"
echo "╚═══════════════════════════════════════════════════════════╝"

# Función de limpieza
cleanup() {
    echo "🛑 Deteniendo servicios..."
    
    if [ ! -z "$BACKEND_PID" ]; then
        kill $BACKEND_PID 2>/dev/null || true
    fi
    
    if [ ! -z "$FRONTEND_PID" ]; then
        kill $FRONTEND_PID 2>/dev/null || true
    fi
    
    exit 0
}

trap cleanup SIGTERM SIGINT

# Iniciar Frontend Next.js en puerto 3001
echo "🎨 Iniciando Frontend (Next.js)..."
cd /app/nextjs_space
PORT=3001 npm start > /app/logs/frontend.log 2>&1 &
FRONTEND_PID=$!
echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"

# Esperar a que Next.js esté listo
sleep 5

# Iniciar Backend en puerto 3000
echo "🔧 Iniciando Backend (Express)..."
cd /app/backend
PORT=3000 NEXTJS_PORT=3001 node server.js > /app/logs/backend.log 2>&1 &
BACKEND_PID=$!
echo "✅ Backend iniciado (PID: $BACKEND_PID)"

# Esperar a que el backend esté listo
sleep 3

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           ✅ CUENTY - Sistema iniciado en Docker          ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "🌐 Acceso: http://localhost:3000"
echo "🛡️  API:    http://localhost:3000/api-info"
echo "💊 Health: http://localhost:3000/health"
echo ""

# Mantener el contenedor corriendo y mostrar logs
tail -f /app/logs/backend.log /app/logs/frontend.log &
TAIL_PID=$!

# Esperar a que se detenga algún proceso
wait $BACKEND_PID $FRONTEND_PID

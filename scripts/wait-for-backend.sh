#!/bin/bash
# Script para esperar a que el backend esté disponible
# Uso: ./wait-for-backend.sh [timeout_seconds] [port]

TIMEOUT=${1:-60}  # Default: 60 segundos
PORT=${2:-3000}   # Default: puerto 3000
COUNTER=0

echo "⏳ Esperando a que el backend esté disponible en puerto $PORT..."
echo "   Timeout: ${TIMEOUT}s"

while [ $COUNTER -lt $TIMEOUT ]; do
    # Verificar si el puerto está escuchando
    if curl -f -s http://localhost:${PORT}/health > /dev/null 2>&1; then
        echo "✓ Backend está listo! (tomó ${COUNTER}s)"
        exit 0
    fi
    
    # Mostrar progreso cada 5 segundos
    if [ $((COUNTER % 5)) -eq 0 ]; then
        echo "   Esperando... ${COUNTER}s / ${TIMEOUT}s"
    fi
    
    sleep 1
    COUNTER=$((COUNTER + 1))
done

echo "✗ TIMEOUT: Backend no respondió después de ${TIMEOUT}s"
echo "   Revisar logs del backend para más detalles"
exit 1

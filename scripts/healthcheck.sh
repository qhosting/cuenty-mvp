#!/bin/sh
# Script de healthcheck para CUENTY
# Verifica que el backend esté respondiendo correctamente

# Verificar que el backend responda en el puerto 3000
if curl -f -s http://localhost:3000/health > /dev/null 2>&1; then
    echo "✓ Backend health check passed"
    exit 0
else
    echo "✗ Backend health check failed"
    exit 1
fi

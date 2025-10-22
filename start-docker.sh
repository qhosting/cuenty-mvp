#!/bin/bash

# ============================================================================
# CUENTY - Script de inicio para Docker (MEJORADO)
# Inicia Backend PRIMERO, espera a que esté listo, luego Frontend
# ============================================================================

set -e

echo "╔═══════════════════════════════════════════════════════════╗"
echo "║      🎬 CUENTY Docker - Inicio Secuencial Robusto         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📋 Estrategia: Backend → Esperar → Frontend"
echo ""

# Variables de configuración
BACKEND_PORT=${PORT:-3000}
FRONTEND_PORT=${NEXTJS_PORT:-3001}
LOG_DIR="/app/logs"
BACKEND_LOG="${LOG_DIR}/backend.log"
FRONTEND_LOG="${LOG_DIR}/frontend.log"
STARTUP_LOG="${LOG_DIR}/startup.log"

# Crear directorio de logs si no existe
mkdir -p "${LOG_DIR}"

# Redirigir todo a startup.log también
exec > >(tee -a "${STARTUP_LOG}") 2>&1

# Función para verificar si un proceso está corriendo
is_process_running() {
    local pid=$1
    if [ -z "$pid" ]; then
        return 1
    fi
    kill -0 "$pid" 2>/dev/null
}

# Función de limpieza mejorada
cleanup() {
    echo ""
    echo "🛑 Señal de terminación recibida. Deteniendo servicios..."
    
    # Detener frontend primero
    if [ ! -z "$FRONTEND_PID" ] && is_process_running "$FRONTEND_PID"; then
        echo "   Deteniendo Frontend (PID: $FRONTEND_PID)..."
        kill -TERM "$FRONTEND_PID" 2>/dev/null || true
        wait "$FRONTEND_PID" 2>/dev/null || true
        echo "   ✓ Frontend detenido"
    fi
    
    # Luego detener backend
    if [ ! -z "$BACKEND_PID" ] && is_process_running "$BACKEND_PID"; then
        echo "   Deteniendo Backend (PID: $BACKEND_PID)..."
        kill -TERM "$BACKEND_PID" 2>/dev/null || true
        wait "$BACKEND_PID" 2>/dev/null || true
        echo "   ✓ Backend detenido"
    fi
    
    # Detener tail si está corriendo
    if [ ! -z "$TAIL_PID" ] && is_process_running "$TAIL_PID"; then
        kill -TERM "$TAIL_PID" 2>/dev/null || true
    fi
    
    echo "✅ Limpieza completada"
    exit 0
}

trap cleanup SIGTERM SIGINT EXIT

# ============================================================================
# PASO 0: Verificar conectividad con PostgreSQL (NUEVO - MÁS ROBUSTO)
# ============================================================================
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  PASO 0/5: Verificando conectividad con PostgreSQL        ║"
echo "╚═══════════════════════════════════════════════════════════╝"

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL no está configurada"
    echo "   No se puede verificar conectividad con la base de datos"
    exit 1
fi

# Mostrar DATABASE_URL sanitizada para debugging
SANITIZED_DB_URL=$(echo "$DATABASE_URL" | sed 's/:\/\/[^:]*:[^@]*@/:\/\/***:***@/')
echo "📊 DATABASE_URL: $SANITIZED_DB_URL"
echo ""

# Dar permisos de ejecución al script wait-for-postgres
chmod +x /app/scripts/wait-for-postgres.sh 2>/dev/null || true

# Ejecutar script de verificación de conectividad con timeout de 2.5 minutos (30 intentos x 5 segundos)
echo "🔍 Ejecutando wait-for-postgres.sh..."
echo "   → Máximo de espera: 2.5 minutos (30 intentos)"
echo "   → Delay entre intentos: 5 segundos"
echo ""

if /app/scripts/wait-for-postgres.sh 30 5; then
    echo ""
    echo "✅ Conectividad con PostgreSQL verificada exitosamente"
    echo "   → Procediendo con migraciones..."
else
    echo ""
    echo "❌ ERROR CRÍTICO: No se pudo conectar a PostgreSQL"
    echo "   → Las migraciones NO pueden ejecutarse"
    echo "   → El backend NO puede iniciar"
    echo ""
    echo "💡 Verificar:"
    echo "   1. Que el contenedor de base de datos esté corriendo"
    echo "   2. Que la red entre contenedores esté configurada correctamente"
    echo "   3. Que DATABASE_URL sea correcta: $SANITIZED_DB_URL"
    exit 1
fi

# ============================================================================
# PASO 1: Ejecutar migraciones de base de datos del BACKEND (CRÍTICO)
# ============================================================================
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  PASO 1/5: Ejecutando migraciones del BACKEND             ║"
echo "╚═══════════════════════════════════════════════════════════╝"

cd /app/backend

echo "✓ DATABASE_URL configurada"
echo "✓ Conectividad con PostgreSQL verificada"

# Verificar que el script de migración exista
if [ -f "scripts/migrate.js" ]; then
    echo "🔄 Ejecutando migraciones del BACKEND..."
    echo "   → Este proceso es CRÍTICO - el backend NO iniciará sin las tablas"
    echo "   → Usando migrate deploy (modo SEGURO - no elimina datos)"
    
    # Ejecutar migraciones del backend (DEBE tener éxito)
    if node scripts/migrate.js; then
        echo "✅ Migraciones del BACKEND aplicadas correctamente"
        echo "   → Base de datos lista para el backend"
    else
        MIGRATION_EXIT_CODE=$?
        echo "❌ ERROR CRÍTICO: Migraciones del BACKEND fallaron (código: $MIGRATION_EXIT_CODE)"
        echo "   → El backend NO puede iniciar sin las tablas en la base de datos"
        echo ""
        echo "💡 Nota: La conectividad ya fue verificada por wait-for-postgres.sh"
        echo "   El problema puede ser:"
        echo "   1. Archivos de migración inválidos o corruptos"
        echo "   2. Permisos insuficientes en la base de datos"
        echo "   3. Estado inconsistente de la base de datos"
        echo ""
        echo "🔧 Soluciones sugeridas:"
        echo "   1. Revisar logs de la base de datos"
        echo "   2. Verificar que existan archivos en backend/prisma/migrations/"
        echo "   3. Intentar ejecutar manualmente: cd /app/backend && npx prisma migrate deploy"
        echo "   4. Verificar DATABASE_URL: $SANITIZED_DB_URL"
        exit 1
    fi
else
    echo "⚠️  Script de migraciones no encontrado en backend/scripts/migrate.js"
    echo "   Intentando ejecutar migraciones directamente con Prisma..."
    
    # Fallback: intentar ejecutar migraciones directamente
    if npx prisma migrate deploy 2>/dev/null; then
        echo "✅ Migraciones del BACKEND aplicadas (usando prisma CLI)"
    else
        echo "❌ ERROR: No se pudieron ejecutar migraciones del BACKEND"
        echo "   El backend NO puede iniciar sin las tablas"
        exit 1
    fi
fi

echo ""
echo "📊 Verificando Prisma Client del BACKEND:"
# Verificar que el cliente de Prisma esté generado
if [ -d "node_modules/.prisma/client" ]; then
    echo "   ✅ Prisma Client del BACKEND está generado correctamente"
else
    echo "   ⚠️  Prisma Client no encontrado, regenerando..."
    npx prisma generate || {
        echo "   ❌ ERROR: No se pudo generar Prisma Client del BACKEND"
        exit 1
    }
fi

# ============================================================================
# PASO 2: Iniciar Backend
# ============================================================================
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  PASO 2/5: Iniciando Backend (Puerto: $BACKEND_PORT)        ║"
echo "╚═══════════════════════════════════════════════════════════╝"

cd /app/backend

# Verificar que los archivos necesarios existan
if [ ! -f "server.js" ]; then
    echo "❌ ERROR: server.js no encontrado en /app/backend"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "❌ ERROR: node_modules no encontrado en /app/backend"
    exit 1
fi

echo "✓ Archivos del backend verificados"
echo "✓ Base de datos con migraciones aplicadas"
echo "🚀 Iniciando Backend..."

# Iniciar backend en background
PORT=$BACKEND_PORT \
NEXTJS_PORT=$FRONTEND_PORT \
NODE_ENV=production \
node server.js > "$BACKEND_LOG" 2>&1 &
BACKEND_PID=$!

echo "✅ Backend iniciado (PID: $BACKEND_PID)"
echo "📝 Logs: $BACKEND_LOG"

# ============================================================================
# PASO 3: Esperar a que Backend esté listo
# ============================================================================
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  PASO 3/5: Esperando a que Backend esté disponible        ║"
echo "╚═══════════════════════════════════════════════════════════╝"

# Dar permisos de ejecución al script wait-for-backend
chmod +x /app/scripts/wait-for-backend.sh 2>/dev/null || true

# Esperar hasta 60 segundos
if /app/scripts/wait-for-backend.sh 60 $BACKEND_PORT; then
    echo "✅ Backend responde correctamente en puerto $BACKEND_PORT"
else
    echo "❌ ERROR: Backend no respondió después de 60s"
    echo "📋 Últimas líneas del log del backend:"
    tail -n 20 "$BACKEND_LOG" || echo "   (no se pudo leer el log)"
    exit 1
fi

# Verificar que el proceso backend siga corriendo
if ! is_process_running "$BACKEND_PID"; then
    echo "❌ ERROR: Backend se detuvo inesperadamente"
    echo "📋 Log completo del backend:"
    cat "$BACKEND_LOG"
    exit 1
fi

# ============================================================================
# PASO 4: Ejecutar migraciones de base de datos del FRONTEND (AUTOMÁTICAS)
# ============================================================================
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  PASO 4/5: Ejecutando migraciones del FRONTEND            ║"
echo "╚═══════════════════════════════════════════════════════════╝"

cd /app/nextjs_space

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  ADVERTENCIA: DATABASE_URL no está configurada"
    echo "   Las migraciones no se ejecutarán"
else
    echo "✓ DATABASE_URL configurada"
    
    # Verificar que el script de migración exista
    if [ -f "scripts/migrate.js" ]; then
        echo "🔄 Ejecutando migraciones de Prisma (modo SEGURO - migrate deploy)..."
        echo "   → Este proceso NO elimina datos existentes"
        echo "   → Solo aplica migraciones pendientes"
        
        # Ejecutar migraciones (no falla si no hay migraciones pendientes)
        if node scripts/migrate.js; then
            echo "✅ Migraciones aplicadas correctamente"
        else
            MIGRATION_EXIT_CODE=$?
            echo "⚠️  ADVERTENCIA: Error al ejecutar migraciones (código: $MIGRATION_EXIT_CODE)"
            echo "   La aplicación intentará continuar, pero puede haber problemas"
            echo "   Verifica los logs de migración para más detalles"
            echo ""
            echo "💡 Posibles causas:"
            echo "   - Base de datos no está accesible"
            echo "   - Credenciales incorrectas"
            echo "   - No hay migraciones pendientes (esto es normal)"
        fi
    else
        echo "⚠️  Script de migraciones no encontrado en scripts/migrate.js"
        echo "   Intentando ejecutar migraciones directamente con Prisma..."
        
        # Fallback: intentar ejecutar migraciones directamente
        if npx prisma migrate deploy 2>/dev/null; then
            echo "✅ Migraciones aplicadas correctamente (usando prisma CLI)"
        else
            echo "⚠️  No se pudieron ejecutar migraciones automáticas"
            echo "   Continuando sin migraciones..."
        fi
    fi
fi

echo ""
echo "📊 Estado de Prisma Client:"
# Verificar que el cliente de Prisma esté generado
if [ -d "node_modules/.prisma/client" ]; then
    echo "   ✅ Prisma Client está generado correctamente"
else
    echo "   ⚠️  Prisma Client no encontrado, regenerando..."
    npx prisma generate || echo "   ⚠️  Error al generar Prisma Client"
fi

# ============================================================================
# PASO 5: Iniciar Frontend
# ============================================================================
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  PASO 5/5: Iniciando Frontend (Puerto: $FRONTEND_PORT)      ║"
echo "╚═══════════════════════════════════════════════════════════╝"

cd /app/nextjs_space

# Verificar que los archivos necesarios existan
if [ ! -d ".next" ]; then
    echo "❌ ERROR: .next no encontrado en /app/nextjs_space"
    echo "   El build del frontend no se completó correctamente"
    exit 1
fi

if [ ! -d "node_modules" ]; then
    echo "❌ ERROR: node_modules no encontrado en /app/nextjs_space"
    exit 1
fi

echo "✓ Archivos del frontend verificados"
echo "🚀 Iniciando Frontend..."

# Iniciar frontend en background
PORT=$FRONTEND_PORT \
NODE_ENV=production \
npm start > "$FRONTEND_LOG" 2>&1 &
FRONTEND_PID=$!

echo "✅ Frontend iniciado (PID: $FRONTEND_PID)"
echo "📝 Logs: $FRONTEND_LOG"

# Dar tiempo al frontend para iniciar
echo "⏳ Esperando 10s para que Frontend inicie..."
sleep 10

# Verificar que el proceso frontend siga corriendo
if ! is_process_running "$FRONTEND_PID"; then
    echo "⚠️  ADVERTENCIA: Frontend se detuvo inesperadamente"
    echo "📋 Últimas líneas del log del frontend:"
    tail -n 20 "$FRONTEND_LOG" || echo "   (no se pudo leer el log)"
    # No salir - el backend puede seguir funcionando
fi

# ============================================================================
# Sistema Iniciado
# ============================================================================
echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║           ✅ CUENTY - Sistema Completamente Iniciado       ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""
echo "📊 Estado de Servicios:"
echo "   🔧 Backend:  $(is_process_running "$BACKEND_PID" && echo "✅ CORRIENDO (PID: $BACKEND_PID)" || echo "❌ DETENIDO")"
echo "   🎨 Frontend: $(is_process_running "$FRONTEND_PID" && echo "✅ CORRIENDO (PID: $FRONTEND_PID)" || echo "❌ DETENIDO")"
echo ""
echo "🌐 Accesos:"
echo "   → Web:     http://localhost:$BACKEND_PORT"
echo "   → API:     http://localhost:$BACKEND_PORT/api-info"
echo "   → Health:  http://localhost:$BACKEND_PORT/health"
echo ""
echo "📝 Logs en tiempo real:"
echo "   → Backend:  $BACKEND_LOG"
echo "   → Frontend: $FRONTEND_LOG"
echo "   → Startup:  $STARTUP_LOG"
echo ""
echo "🔄 Siguiendo logs (Ctrl+C para detener)..."
echo "═══════════════════════════════════════════════════════════"
echo ""

# Seguir logs de ambos servicios
tail -f "$BACKEND_LOG" "$FRONTEND_LOG" 2>/dev/null &
TAIL_PID=$!

# Función para monitorear procesos
monitor_processes() {
    while true; do
        sleep 30
        
        # Verificar backend
        if ! is_process_running "$BACKEND_PID"; then
            echo "❌ ERROR CRÍTICO: Backend se detuvo inesperadamente"
            echo "📋 Últimas líneas del log:"
            tail -n 30 "$BACKEND_LOG"
            cleanup
            exit 1
        fi
        
        # Verificar frontend (no crítico)
        if ! is_process_running "$FRONTEND_PID"; then
            echo "⚠️  ADVERTENCIA: Frontend se detuvo"
            # No salir, el backend sigue funcionando
        fi
    done
}

# Iniciar monitor en background
monitor_processes &
MONITOR_PID=$!

# Esperar a que los procesos terminen
wait $BACKEND_PID $FRONTEND_PID

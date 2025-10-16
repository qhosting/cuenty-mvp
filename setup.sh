#!/bin/bash

# =============================================================================
# CUENTY MVP - Script de Configuración Inicial
# =============================================================================

set -e

echo "🎬 =========================================="
echo "   CUENTY MVP - Setup Inicial"
echo "=========================================="
echo ""

# Verificar Docker
if ! command -v docker &> /dev/null; then
    echo "❌ Docker no está instalado"
    echo "   Instala Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

if ! command -v docker-compose &> /dev/null; then
    echo "❌ Docker Compose no está instalado"
    echo "   Instala Docker Compose: https://docs.docker.com/compose/install/"
    exit 1
fi

echo "✅ Docker y Docker Compose instalados"
echo ""

# Crear archivo .env si no existe
if [ ! -f .env ]; then
    echo "📝 Creando archivo .env..."
    cp .env.example .env
    
    # Generar secretos aleatorios
    JWT_SECRET=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
    WEBHOOK_SECRET=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
    DB_PASSWORD=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
    
    # Reemplazar en .env
    sed -i "s|cambiar_este_secreto_por_uno_aleatorio_y_seguro_minimo_32_caracteres|$JWT_SECRET|g" .env
    sed -i "s|cambiar_esta_clave_de_encriptacion_por_una_aleatoria_segura_32_chars|$ENCRYPTION_KEY|g" .env
    sed -i "s|cambiar_secret_compartido_con_n8n|$WEBHOOK_SECRET|g" .env
    sed -i "s|cambiar_password_seguro_aqui|$DB_PASSWORD|g" .env
    
    echo "✅ Archivo .env creado con secretos aleatorios"
else
    echo "ℹ️  Archivo .env ya existe, omitiendo creación"
fi

echo ""
echo "🐳 Iniciando servicios con Docker Compose..."
docker-compose up -d

echo ""
echo "⏳ Esperando que los servicios estén listos..."
sleep 10

# Verificar salud de servicios
echo ""
echo "🔍 Verificando servicios..."

if docker-compose ps | grep -q "Up"; then
    echo "✅ Servicios Docker corriendo"
else
    echo "❌ Error: Servicios no están corriendo"
    echo "   Ver logs: docker-compose logs"
    exit 1
fi

# Verificar API
if curl -s http://localhost:3000/health | grep -q "ok"; then
    echo "✅ API respondiendo correctamente"
else
    echo "⚠️  API aún no responde, puede tardar unos segundos más..."
fi

echo ""
echo "🎉 =========================================="
echo "   ¡Configuración Completada!"
echo "=========================================="
echo ""
echo "📍 URLs de Acceso:"
echo "   🌐 Frontend Cliente:  http://localhost:3000"
echo "   👨‍💼 Panel Admin:       http://localhost:3000/admin"
echo "   🔧 API:              http://localhost:3000/api"
echo ""
echo "🔐 Credenciales por Defecto:"
echo "   Usuario: admin"
echo "   Password: admin123"
echo ""
echo "⚠️  IMPORTANTE:"
echo "   1. Cambia las credenciales de admin en producción"
echo "   2. Revisa el archivo .env y actualiza si es necesario"
echo "   3. Configura tu dominio en producción"
echo ""
echo "📚 Comandos Útiles:"
echo "   Ver logs:       docker-compose logs -f"
echo "   Detener:        docker-compose down"
echo "   Reiniciar:      docker-compose restart"
echo ""
echo "✨ ¡Disfruta usando CUENTY!"

#!/bin/bash

# ============================================================================
# Script para generar Prisma Client de forma robusta
# Maneja limpieza de archivos existentes y permisos
# ============================================================================

set -e

echo "🔧 Iniciando generación de Prisma Client..."

# Función para limpiar directorio .prisma con manejo de errores
cleanup_prisma() {
    local prisma_dir="$1"
    
    if [ -d "$prisma_dir" ]; then
        echo "🧹 Limpiando directorio existente: $prisma_dir"
        
        # Intentar eliminar con rm primero
        if rm -rf "$prisma_dir" 2>/dev/null; then
            echo "   ✓ Directorio eliminado exitosamente"
            return 0
        fi
        
        # Si falla, intentar cambiar permisos primero
        echo "   ⚠️  Intento inicial falló, cambiando permisos..."
        if chmod -R u+w "$prisma_dir" 2>/dev/null; then
            echo "   ✓ Permisos actualizados"
            if rm -rf "$prisma_dir" 2>/dev/null; then
                echo "   ✓ Directorio eliminado exitosamente"
                return 0
            fi
        fi
        
        # Si todo falla, intentar eliminar archivo por archivo
        echo "   ⚠️  Intentando eliminación recursiva de archivos..."
        find "$prisma_dir" -type f -exec rm -f {} \; 2>/dev/null || true
        find "$prisma_dir" -type d -exec rmdir {} \; 2>/dev/null || true
        
        # Verificar si aún existe
        if [ -d "$prisma_dir" ]; then
            echo "   ⚠️  No se pudo eliminar completamente, pero continuaremos"
        else
            echo "   ✓ Directorio eliminado"
        fi
    else
        echo "✓ No hay directorio .prisma existente (esto es normal en la primera ejecución)"
    fi
}

# Detectar directorio de node_modules
if [ -d "./node_modules" ]; then
    PRISMA_CLIENT_DIR="./node_modules/.prisma"
    echo "📁 Usando directorio local: $PRISMA_CLIENT_DIR"
elif [ -d "../node_modules" ]; then
    PRISMA_CLIENT_DIR="../node_modules/.prisma"
    echo "📁 Usando directorio padre: $PRISMA_CLIENT_DIR"
else
    echo "⚠️  No se encontró directorio node_modules, continuando de todas formas..."
    PRISMA_CLIENT_DIR="./node_modules/.prisma"
fi

# Limpiar directorio .prisma existente
cleanup_prisma "$PRISMA_CLIENT_DIR"

# Verificar que el schema.prisma existe
if [ ! -f "./prisma/schema.prisma" ] && [ ! -f "../prisma/schema.prisma" ]; then
    echo "❌ ERROR: No se encontró prisma/schema.prisma"
    exit 1
fi

echo "✓ Schema de Prisma encontrado"

# Generar Prisma Client
echo "⚙️  Generando Prisma Client..."

# Generar el cliente (la limpieza previa asegura que no haya conflictos)
if npx prisma generate; then
    echo "✅ Prisma Client generado exitosamente"
    
    # Verificar que se generó correctamente
    if [ -d "$PRISMA_CLIENT_DIR/client" ]; then
        echo "✓ Verificación: Cliente generado en $PRISMA_CLIENT_DIR/client"
        echo "✓ Tamaño del directorio: $(du -sh "$PRISMA_CLIENT_DIR/client" 2>/dev/null || echo 'N/A')"
    else
        echo "⚠️  El cliente se generó pero no se encontró en la ubicación esperada"
    fi
else
    echo "❌ ERROR: Falló la generación de Prisma Client"
    exit 1
fi

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║      ✅ Prisma Client generado correctamente              ║"
echo "╚═══════════════════════════════════════════════════════════╝"

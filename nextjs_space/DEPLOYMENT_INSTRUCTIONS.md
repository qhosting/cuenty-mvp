# 🚀 Instrucciones de Deployment - Corrección de Carga Parcial

**Fecha:** 18 de octubre de 2025  
**Cambios:** Corrección de componentes que no cargaban contenido

---

## ✅ Estado Actual

- ✅ **Código corregido** - 4 componentes actualizados
- ✅ **Endpoint /api/version creado**
- ✅ **Build local exitoso** - Sin errores
- ✅ **Cambios pushed a GitHub** - Commit `2e123df`
- ⏳ **Deployment a producción** - PENDIENTE

---

## 🔧 Pasos para Desplegar a Producción

### Opción 1: Deployment Manual (Recomendado)

**Conectarse al servidor de producción:**

```bash
# 1. Conectar por SSH a tu servidor (VPS, cloud, etc.)
ssh usuario@cuenty.top
# o
ssh usuario@tu-servidor-ip
```

**Navegar al directorio del proyecto:**

```bash
# 2. Ir al directorio del proyecto
cd /ruta/al/proyecto/cuenty-mvp/nextjs_space
# Nota: La ruta exacta depende de dónde esté instalado tu proyecto
```

**Hacer pull de los cambios:**

```bash
# 3. Hacer pull de los cambios más recientes
git pull origin main

# Deberías ver un mensaje como:
# Updating e5833c9..2e123df
# Fast-forward
#  app/api/version/route.ts                    | 7 +++++++
#  components/hero-section-ecommerce.tsx       | 24 +-----
#  components/how-it-works-ecommerce.tsx       | 35 +-------
#  components/services-section.tsx             | 26 +-----
#  components/why-choose-us.tsx                | 26 +-----
#  5 files changed, 8 insertions(+), 103 deletions(-)
```

**Rebuildar el proyecto:**

```bash
# 4. Instalar dependencias (si es necesario)
npm install

# 5. Hacer build del proyecto
npm run build

# Deberías ver:
# ✓ Compiled successfully
# Route (app)                              Size     First Load JS
# ┌ ○ /                                    8.98 kB         126 kB
# └ ○ /api/version                         0 B                0 B
# ...
```

**Reiniciar el servidor:**

```bash
# 6. Reiniciar el servidor de producción
# Si usas PM2:
pm2 restart cuenty
pm2 logs cuenty --lines 50

# Si usas systemd:
sudo systemctl restart cuenty
sudo systemctl status cuenty

# Si usas otro método, ajustar según tu configuración
```

---

### Opción 2: Usar Script de Deployment Automático

**Crear archivo de deployment:**

```bash
# En el servidor de producción
cd /ruta/al/proyecto/cuenty-mvp/nextjs_space
nano deploy.sh
```

**Contenido del script:**

```bash
#!/bin/bash

echo "🚀 Iniciando deployment..."

# Colores para output
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Pull cambios
echo "📥 Descargando cambios de GitHub..."
git pull origin main
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al hacer git pull${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Cambios descargados${NC}"

# 2. Instalar dependencias
echo "📦 Instalando dependencias..."
npm install
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al instalar dependencias${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Dependencias instaladas${NC}"

# 3. Build
echo "🔨 Construyendo proyecto..."
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error en el build${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build completado${NC}"

# 4. Reiniciar servidor (ajustar según tu configuración)
echo "🔄 Reiniciando servidor..."
pm2 restart cuenty
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Error al reiniciar servidor${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Servidor reiniciado${NC}"

echo -e "${GREEN}🎉 Deployment completado exitosamente!${NC}"
echo "🌐 Verifica el sitio en: https://cuenty.top"
```

**Dar permisos de ejecución:**

```bash
chmod +x deploy.sh
```

**Ejecutar:**

```bash
./deploy.sh
```

---

## 🔍 Verificación Post-Deployment

### 1. Verificar que el sitio carga correctamente

**Visitar:** https://cuenty.top

**Verificar que se muestran:**
- ✅ Hero Section con texto "Streaming Premium Sin Límites"
- ✅ Services Section con 6 servicios (Netflix, Disney+, etc.)
- ✅ Why Choose Us con 6 beneficios
- ✅ How It Works con 4 pasos
- ✅ Footer con información completa

### 2. Limpiar caché del navegador

```
Windows/Linux: Ctrl + Shift + R
Mac: Cmd + Shift + R

O usar modo incógnito: Ctrl + Shift + N
```

### 3. Verificar en consola del navegador

1. Presionar `F12` para abrir DevTools
2. Ir a pestaña "Console"
3. Verificar que NO aparezcan:
   - ❌ Errores 404 para `/api/version`
   - ❌ Errores de componentes

### 4. Verificar logs del servidor

```bash
# Si usas PM2
pm2 logs cuenty --lines 100

# Si usas systemd
sudo journalctl -u cuenty -n 100 -f

# Verificar que no haya errores recientes
```

---

## 🛠️ Troubleshooting

### Problema: "Los cambios no se ven"

**Soluciones:**

1. **Limpiar caché del navegador completamente**
   ```
   Chrome: Settings > Privacy and Security > Clear browsing data
   - Seleccionar "Cached images and files"
   - Time range: "All time"
   ```

2. **Verificar que el build se completó**
   ```bash
   cd /ruta/al/proyecto/cuenty-mvp/nextjs_space
   ls -la .next/
   # Deberías ver archivos recientes (fecha de hoy)
   ```

3. **Verificar que el servidor se reinició**
   ```bash
   pm2 list
   # Verificar que "cuenty" esté "online" y el uptime sea reciente
   ```

### Problema: "Error al hacer git pull"

**Soluciones:**

```bash
# Ver el estado del repositorio
git status

# Si hay cambios locales conflictivos
git stash
git pull origin main
git stash pop

# Si hay conflictos más complejos
git fetch origin
git reset --hard origin/main
```

### Problema: "Error en npm run build"

**Soluciones:**

```bash
# Limpiar caché de npm
npm cache clean --force

# Eliminar node_modules y reinstalar
rm -rf node_modules package-lock.json
npm install

# Intentar build nuevamente
npm run build
```

### Problema: "El servidor no reinicia"

**Soluciones:**

```bash
# Si usas PM2
pm2 stop cuenty
pm2 delete cuenty
pm2 start npm --name "cuenty" -- start

# Verificar logs
pm2 logs cuenty --lines 50
```

---

## 📝 Notas Importantes

### Cambios Realizados en el Código

1. **Componentes Modificados:**
   - `components/hero-section-ecommerce.tsx`
   - `components/services-section.tsx`
   - `components/why-choose-us.tsx`
   - `components/how-it-works-ecommerce.tsx`

2. **Archivos Nuevos:**
   - `app/api/version/route.ts`

3. **Qué se corrigió:**
   - Eliminada lógica de `mounted` que causaba que los componentes quedaran en loading
   - Renderizado directo del contenido sin verificaciones innecesarias
   - Creado endpoint `/api/version` para eliminar errores 404

### Impacto en el Usuario Final

- ✅ **Mejor experiencia:** El contenido aparece inmediatamente
- ✅ **Más rápido:** Sin retrasos de renderizado
- ✅ **Menos errores:** Sin errores 404 en la consola
- ✅ **SEO mejorado:** Contenido disponible para crawlers inmediatamente

---

## 🎯 Checklist Final

Antes de considerar el deployment completado, verificar:

- [ ] Git pull ejecutado exitosamente
- [ ] npm install ejecutado sin errores
- [ ] npm run build completado sin errores
- [ ] Servidor reiniciado correctamente
- [ ] Sitio carga en https://cuenty.top
- [ ] Hero Section muestra contenido completo
- [ ] Services Section muestra 6 servicios con logos
- [ ] Why Choose Us muestra 6 beneficios
- [ ] How It Works muestra 4 pasos
- [ ] Footer funciona correctamente
- [ ] No hay errores en la consola del navegador
- [ ] Navegación entre secciones funciona

---

## 📞 Soporte

Si tienes problemas durante el deployment:

1. **Revisar logs:**
   ```bash
   pm2 logs cuenty --lines 200
   ```

2. **Verificar proceso:**
   ```bash
   pm2 list
   ps aux | grep node
   ```

3. **Reintentar deployment:**
   ```bash
   ./deploy.sh
   ```

4. **Contactar con:**
   - Screenshots de errores
   - Output de comandos
   - Logs del servidor

---

## 🔗 Enlaces Útiles

- **Repositorio GitHub:** https://github.com/qhosting/cuenty-mvp
- **Commit con cambios:** https://github.com/qhosting/cuenty-mvp/commit/2e123df
- **Sitio en producción:** https://cuenty.top
- **Documentación completa:** `FIX_LOADING_ISSUES.md`

---

**Preparado por:** DeepAgent  
**Fecha:** 18 de octubre de 2025  
**Versión:** 1.0

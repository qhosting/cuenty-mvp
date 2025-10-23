# 🚀 CUENTY MVP - Guía de Despliegue en Easypanel

## 📋 Arquitectura del Sistema

CUENTY utiliza una arquitectura de **Backend como Reverse Proxy**:

```
Internet → Easypanel → Puerto 3000 (Backend Express) → Puerto 3001 (Frontend Next.js)
                                ↓
                           API Routes (/api/*)
```

### Componentes:

1. **Backend Express** (Puerto 3000)
   - Servidor Express con API REST
   - Actúa como reverse proxy para el frontend
   - Maneja todas las rutas `/api/*`
   - Proxy transparente para todas las demás rutas → Frontend Next.js

2. **Frontend Next.js** (Puerto 3001) 
   - Aplicación Next.js en modo standalone
   - Solo accesible internamente desde el backend
   - Sirve la interfaz de usuario y rutas cliente

## ⚙️ Configuración Correcta en Easypanel

### 🎯 Puerto Público

**IMPORTANTE**: Easypanel debe exponer el **Puerto 3000 (Backend)**, NO el 3001.

```yaml
Configuración en Easypanel:
  Puerto expuesto: 3000
  Dominio: cuenty.top → puerto 3000
```

### 🔑 Variables de Entorno Requeridas

```bash
# Base de datos (CRÍTICO)
DATABASE_URL=postgresql://user:password@host:5432/dbname

# Autenticación NextAuth
NEXTAUTH_URL=https://cuenty.top
NEXTAUTH_SECRET=<secret_key_fuerte>

# JWT para backend
JWT_SECRET=<secret_key_fuerte>

# Puertos internos (predeterminados)
PORT=3000           # Backend (puerto público)
NEXTJS_PORT=3001    # Frontend (interno)

# Entorno
NODE_ENV=production

# N8N Webhooks (opcional)
N8N_WEBHOOK_URL=<url_de_n8n>

# CORS (opcional)
CORS_ORIGIN=*
```

## 🔧 Cambios Realizados para Solucionar Accesibilidad

### 1. Backend Server (`backend/server.js`)

**Problema Original:**
```javascript
app.listen(PORT, () => {  // ❌ Escucha solo en localhost
```

**Solución:**
```javascript
app.listen(PORT, '0.0.0.0', () => {  // ✅ Accesible públicamente
```

### 2. Frontend Server (`start-docker.sh`)

Ya estaba configurado correctamente:
```bash
PORT=$FRONTEND_PORT \
HOSTNAME=0.0.0.0 \      # ✅ Next.js accesible desde backend
NODE_ENV=production \
node server.js
```

### 3. Dockerfile

No requiere cambios - los puertos ya están correctamente expuestos:
```dockerfile
EXPOSE 3000 3001
```

## 🧪 Verificación del Despliegue

### 1. Verificar que el contenedor esté corriendo

```bash
docker ps | grep cuenty
```

### 2. Verificar logs del contenedor

```bash
docker logs <container_id> --tail 100 -f
```

Deberías ver:
```
✅ Backend iniciado (PID: xxx)
🌐 Hostname: 0.0.0.0 (accesible públicamente)
✅ Frontend iniciado (PID: xxx)
🌐 Escuchando en: 0.0.0.0:3001 (accesible públicamente)
```

### 3. Verificar endpoints desde dentro del contenedor

```bash
# Entrar al contenedor
docker exec -it <container_id> /bin/bash

# Verificar backend
curl http://localhost:3000/health
# Respuesta: {"status":"ok","message":"CUENTY API is running"}

# Verificar frontend (interno)
curl http://localhost:3001
# Respuesta: HTML de Next.js
```

### 4. Verificar acceso externo

```bash
# Backend health
curl https://cuenty.top/health

# API info
curl https://cuenty.top/api-info

# Frontend (proxied desde backend)
curl https://cuenty.top/
```

## 🚨 Solución de Problemas

### Problema: "Site can't be reached"

**Causa**: Backend no escucha en 0.0.0.0  
**Solución**: ✅ Ya corregido en `backend/server.js` (línea 207)

### Problema: "503 Frontend no disponible"

**Causas posibles**:
1. Frontend no inició correctamente
2. Frontend crasheó después de iniciar
3. `DATABASE_URL` no configurada

**Diagnóstico**:
```bash
docker logs <container_id> | grep -A 20 "PASO 5/5"
```

**Verificar que veas**:
```
✅ Frontend iniciado (PID: xxx)
🌐 Escuchando en: 0.0.0.0:3001
```

### Problema: Errores de migración de base de datos

**Verificar**:
1. Que `DATABASE_URL` sea correcta
2. Que PostgreSQL esté accesible desde el contenedor
3. Revisar logs de migraciones:

```bash
docker logs <container_id> | grep -A 30 "PASO 1/5"
```

### Problema: NextAuth errors

**Verificar**:
1. `NEXTAUTH_URL` debe ser `https://cuenty.top` (sin trailing slash)
2. `NEXTAUTH_SECRET` debe ser una clave fuerte
3. `DATABASE_URL` debe estar configurada correctamente

## 📊 Flujo de Requests

### Solicitud a la Raíz (`/`)

```
Cliente → https://cuenty.top/
    ↓
Easypanel (Puerto 3000)
    ↓
Backend Express (línea 141-177 de server.js)
    ↓
Proxy a http://localhost:3001
    ↓
Frontend Next.js
    ↓
Response HTML
```

### Solicitud a la API (`/api/*`)

```
Cliente → https://cuenty.top/api/servicios
    ↓
Easypanel (Puerto 3000)
    ↓
Backend Express (línea 48)
    ↓
Route Handler
    ↓
Response JSON
```

## 🔄 Redeploy después de cambios

1. **Commit y push los cambios**:
```bash
git add .
git commit -m "fix: Backend escucha en 0.0.0.0 para accesibilidad pública"
git push origin main
```

2. **Rebuild en Easypanel**:
   - Ve al servicio en Easypanel
   - Click en "Rebuild"
   - Espera a que el build complete
   - El contenedor se reiniciará automáticamente

3. **Verificar deployment**:
```bash
# Espera 1-2 minutos para que inicien ambos servicios
curl https://cuenty.top/health
curl https://cuenty.top/
```

## ✅ Checklist de Configuración

- [ ] **Puerto público en Easypanel**: 3000 (Backend)
- [ ] **Variables de entorno configuradas**:
  - [ ] `DATABASE_URL`
  - [ ] `NEXTAUTH_URL` (https://cuenty.top)
  - [ ] `NEXTAUTH_SECRET`
  - [ ] `JWT_SECRET`
- [ ] **Backend escucha en 0.0.0.0**: ✅ Corregido
- [ ] **Frontend escucha en 0.0.0.0**: ✅ Ya estaba correcto
- [ ] **Dockerfile expone puertos correctos**: ✅ 3000 y 3001
- [ ] **start-docker.sh configura HOSTNAME**: ✅ Ya estaba correcto

## 🎬 Resultado Esperado

Después de aplicar estos cambios y redesplegar:

1. ✅ https://cuenty.top/ → **Carga el frontend Next.js**
2. ✅ https://cuenty.top/api-info → **Muestra información de la API**
3. ✅ https://cuenty.top/health → **{"status":"ok"}**
4. ✅ https://cuenty.top/api/* → **API responses**

---

**Última actualización**: 2025-10-23  
**Cambios críticos realizados**:
- ✅ Backend ahora escucha en `0.0.0.0:3000` (anteriormente solo `localhost`)
- ✅ Frontend ya escuchaba en `0.0.0.0:3001`
- ✅ Documentación de arquitectura y deployment creada

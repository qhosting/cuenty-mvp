# 🚀 Guía de Deployment - CUENTY MVP

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Sistema de Migraciones Automáticas](#sistema-de-migraciones-automáticas)
3. [Proceso de Deployment](#proceso-de-deployment)
4. [Variables de Entorno Requeridas](#variables-de-entorno-requeridas)
5. [Verificación Post-Deployment](#verificación-post-deployment)
6. [Troubleshooting](#troubleshooting)
7. [Changelog Reciente](#changelog-reciente)

---

## 🎯 Resumen Ejecutivo

**Estado Actual:** Versión 1.0.9
**Último Commit:** `cdc8a35` - Corrección de nombres de modelo Prisma Client
**Repositorio:** https://github.com/qhosting/cuenty-mvp.git

### ✅ Sistema de Migraciones Configurado

CUENTY ya tiene configurado un **sistema robusto de migraciones automáticas** que se ejecuta en cada deployment. NO necesitas ejecutar migraciones manualmente.

### 🔄 Flujo de Deployment

```
Git Push → Build Docker → Iniciar Container → 
  ↓
  ├─ Verificar PostgreSQL (wait-for-postgres.sh)
  ├─ Aplicar Migraciones Backend (prisma migrate deploy)
  ├─ Aplicar Migraciones Frontend (prisma migrate deploy)
  ├─ Generar Prisma Client
  ├─ Iniciar Backend (puerto 3000)
  └─ Iniciar Frontend (puerto 3001)
```

---

## 🔧 Sistema de Migraciones Automáticas

### Cómo Funciona

El sistema está configurado en **`start-docker.sh`** que se ejecuta al iniciar el contenedor:

#### PASO 0: Verificación de Conectividad
```bash
/app/scripts/wait-for-postgres.sh 30 5
```
- Intenta conectar a PostgreSQL 30 veces con 5 segundos entre intentos
- Máximo 2.5 minutos de espera
- Si falla, el deployment se detiene (previene errores de migración)

#### PASO 1: Migraciones del Backend
```bash
cd /app/backend
node scripts/migrate.js
```
- Usa `prisma migrate deploy` (modo SEGURO - NO elimina datos)
- Aplica solo migraciones pendientes
- Si todas están aplicadas, no hace cambios
- Tiene 3 reintentos automáticos
- Genera Prisma Client después de las migraciones

#### PASO 2: Inicio del Backend
```bash
PORT=3000 node server.js
```

#### PASO 3: Verificación del Backend
```bash
/app/scripts/wait-for-backend.sh 60 3000
```
- Espera hasta 60 segundos a que el backend responda

#### PASO 4: Migraciones del Frontend
```bash
cd /app/nextjs_space
node scripts/migrate.js
```
- Similar al backend, aplica migraciones pendientes
- Genera Prisma Client

#### PASO 5: Inicio del Frontend
```bash
PORT=3001 HOSTNAME=0.0.0.0 node server.js
```

### Scripts de Migración

#### Backend: `/app/backend/scripts/migrate.js`
- **Modo:** `prisma migrate deploy` (SEGURO)
- **Reintentos:** 3 intentos con 3 segundos de delay
- **Logs detallados:** Muestra qué migraciones se aplican
- **Manejo de errores:** Exit code 1 si falla (detiene el deployment)

#### Frontend: `/app/nextjs_space/scripts/migrate.js`
- Similar al backend
- No-crítico: si falla, el deployment continúa con advertencia

### Directorio de Migraciones

```
backend/prisma/migrations/
├── 20251021042116_init/
│   └── migration.sql
├── 20251021165212_add_password_to_usuario/
│   └── migration.sql
└── migration_lock.toml

nextjs_space/prisma/migrations/
├── 20251018015515_init/
│   └── migration.sql
├── 20251021000000_add_user_fields/
│   └── migration.sql
└── migration_lock.toml
```

---

## 🚀 Proceso de Deployment

### Deployment en Easypanel (Recomendado)

#### 1. Hacer Cambios en el Código
```bash
# Trabajar en tu código localmente
git add .
git commit -m "feat: descripción de cambios"
```

#### 2. Si Hay Cambios en el Schema de Prisma
```bash
# Crear migración en desarrollo
cd backend  # o nextjs_space
npx prisma migrate dev --name descripcion_del_cambio

# Esto crea:
# - Un nuevo directorio en prisma/migrations/
# - Un archivo migration.sql con los cambios SQL
# - Actualiza migration_lock.toml
```

#### 3. Commitear y Pushear TODO
```bash
git add .
git commit -m "feat: agregar nueva funcionalidad + migración de base de datos"
git push origin main
```

#### 4. Easypanel Deploy Automático
Easypanel detectará el push y:
- ✅ Hará pull del código actualizado
- ✅ Reconstruirá la imagen Docker
- ✅ Iniciará el contenedor
- ✅ Ejecutará `start-docker.sh` automáticamente
- ✅ Aplicará las migraciones AUTOMÁTICAMENTE
- ✅ Iniciará los servicios

### Verificar el Deployment

```bash
# Ver logs del contenedor en Easypanel
# Buscar estas líneas:

🔄 Ejecutando migraciones del BACKEND...
✅ Migraciones del BACKEND aplicadas correctamente
✅ Backend iniciado (PID: XXX)
🔄 Ejecutando migraciones del FRONTEND...
✅ Migraciones aplicadas correctamente
✅ Frontend iniciado (PID: XXX)
✅ CUENTY - Sistema Completamente Iniciado
```

---

## 🔐 Variables de Entorno Requeridas

### Configuración en Easypanel

Asegúrate de tener configuradas estas variables de entorno en Easypanel:

#### Base de Datos (CRÍTICO)
```env
DATABASE_URL=postgresql://usuario:password@host:puerto/database?schema=public
```
**Formato completo:**
```
postgresql://[usuario]:[password]@[host]:[puerto]/[database]?schema=public
```

#### Autenticación (CRÍTICO)
```env
JWT_SECRET=tu-secreto-jwt-seguro-aqui
ENCRYPTION_KEY=tu-clave-de-encriptacion-segura-aqui
```

#### NextAuth (CRÍTICO para Frontend)
```env
NEXTAUTH_URL=https://tu-dominio.com
NEXTAUTH_SECRET=tu-secreto-nextauth-seguro-aqui
```

#### n8n Webhooks (Opcional)
```env
N8N_WEBHOOK_SECRET=tu-secreto-webhook
N8N_WEBHOOK_ENTREGA_CUENTA=https://n8n.example.com/webhook/entrega
N8N_WEBHOOK_RESPUESTA_AGENTE=https://n8n.example.com/webhook/respuesta
```

#### Otras Configuraciones
```env
NODE_ENV=production
PORT=3000
NEXTJS_PORT=3001
CORS_ORIGIN=*
```

### ⚠️ Importante

- **NUNCA** commitees estas variables al repositorio
- Usa el panel de Easypanel para configurarlas
- `DATABASE_URL` es la ÚNICA variable necesaria para las migraciones
- Si `DATABASE_URL` no está configurada, el deployment fallará

---

## ✅ Verificación Post-Deployment

### 1. Verificar Estado del Sistema

**Endpoint de Health Check:**
```bash
curl https://tu-dominio.com/health
```

**Respuesta esperada:**
```json
{
  "status": "ok",
  "timestamp": "2024-10-23T...",
  "database": "connected",
  "version": "1.0.9"
}
```

### 2. Verificar Migraciones Aplicadas

En los logs de Easypanel, busca:
```
✅ Migraciones del BACKEND aplicadas correctamente
✅ Base de datos del BACKEND está al día - no hay migraciones pendientes
```

### 3. Verificar Funcionalidad

1. **Login de Admin:**
   ```
   POST https://tu-dominio.com/api/auth/admin/login
   {
     "loginIdentifier": "admin",
     "password": "tu-password"
   }
   ```

2. **Acceso al Frontend:**
   ```
   https://tu-dominio.com/
   ```

3. **Panel de Admin:**
   ```
   https://tu-dominio.com/admin
   ```

---

## 🔧 Troubleshooting

### Problema: No Veo los Cambios en Producción

#### Causas Posibles:

1. **Cache del Navegador**
   - Solución: Ctrl+Shift+R (hard refresh)
   - O: Abrir en ventana de incógnito

2. **Cambios NO Pusheados a GitHub**
   ```bash
   # Verificar estado
   git status
   
   # Ver últimos commits
   git log --oneline -5
   
   # Hacer push
   git push origin main
   ```

3. **Easypanel NO Detectó el Push**
   - Ir a Easypanel → Tu Aplicación → Deployments
   - Verificar si hay un nuevo deployment
   - Si no, hacer **Manual Deploy**

4. **Build Falló**
   - Revisar logs de build en Easypanel
   - Buscar errores de compilación

5. **Migraciones Fallaron**
   - Revisar logs del contenedor
   - Buscar: `❌ ERROR: No se pudieron ejecutar migraciones`
   - Verificar `DATABASE_URL`

### Problema: Error de Prisma Client

```
Property 'admin' does not exist on type 'PrismaClient'
```

**Solución:** Ya corregido en commit `cdc8a35`
- Usar `prisma.admins` en lugar de `prisma.admin`
- Usar `fecha_creacion` en lugar de `fechaCreacion`

### Problema: Migraciones No Se Aplican

#### Verificar Conectividad
```bash
# En el contenedor (via Easypanel terminal)
node -e "console.log(process.env.DATABASE_URL)"
```

#### Ejecutar Migraciones Manualmente
```bash
# Backend
cd /app/backend
npx prisma migrate status
npx prisma migrate deploy

# Frontend
cd /app/nextjs_space
npx prisma migrate status
npx prisma migrate deploy
```

#### Regenerar Prisma Client
```bash
cd /app/backend
npx prisma generate

cd /app/nextjs_space
npx prisma generate
```

### Problema: Base de Datos Externa No Conecta

#### Verificar Formato de DATABASE_URL
```
postgresql://usuario:password@host:puerto/database?schema=public
```

#### Verificar Conectividad de Red
```bash
# En el contenedor
apt-get update && apt-get install -y postgresql-client
psql $DATABASE_URL -c "SELECT version();"
```

#### Logs Útiles
```
📊 DATABASE_URL: postgresql://***:***@host:puerto/database
✅ Conectividad con PostgreSQL verificada exitosamente
🔄 Ejecutando migraciones del BACKEND...
```

### Problema: Frontend No Carga Rutas API

**Causa:** En modo standalone, Next.js incluye las rutas API automáticamente

**Verificar:**
```bash
# En el contenedor
ls -la /app/nextjs_space/.next/standalone/app/api/
```

Si no existen, verificar `next.config.js`:
```javascript
module.exports = {
  output: 'standalone',
  // ...
}
```

---

## 📝 Changelog Reciente

### Versión 1.0.9 (Actual)

**Commit:** `cdc8a35` - 2024-10-23

#### Correcciones
- ✅ Corregir nombres de modelo Prisma Client (admin → admins)
- ✅ Corregir nombres de campos (fechaCreacion → fecha_creacion)
- ✅ Actualizar authController.js
- ✅ Actualizar init-admin.js

#### Agregados
- ✅ Reporte de actualización de versión
- ✅ Reporte de análisis de deployment

---

### Versión 1.0.8

**Commit:** `74b5408` - 2024-10-23

#### Documentación
- ✅ Documentación completa de deployment
- ✅ Guía de troubleshooting

---

### Versión 1.0.7

**Commit:** `f5ecaea` - 2024-10-23

#### Funcionalidades
- ✅ Páginas "Cómo funciona" y "Soporte"
- ✅ Contenido completo de marketing

---

## 🎯 Resumen de Acción para Deploy

### Checklist Rápido

1. ☑️ **Hacer cambios en el código**
2. ☑️ **Si hay cambios en schema.prisma:**
   - Ejecutar `npx prisma migrate dev --name descripcion`
3. ☑️ **Commitear TODO:**
   - Código
   - Migraciones (backend/prisma/migrations/)
   - package.json si hay cambios de versión
4. ☑️ **Push a GitHub:**
   - `git push origin main`
5. ☑️ **Verificar en Easypanel:**
   - Que el deployment inició automáticamente
   - Revisar logs de build
   - Revisar logs del contenedor
6. ☑️ **Verificar migraciones aplicadas:**
   - Buscar "✅ Migraciones aplicadas correctamente" en los logs
7. ☑️ **Verificar funcionalidad:**
   - Hacer hard refresh (Ctrl+Shift+R)
   - Probar funcionalidades nuevas

### Comandos Útiles

```bash
# Ver estado de Git
git status
git log --oneline -5

# Ver estado de migraciones
cd backend && npx prisma migrate status
cd nextjs_space && npx prisma migrate status

# Crear nueva migración (desarrollo)
npx prisma migrate dev --name descripcion_cambio

# Aplicar migraciones (producción - automático)
npx prisma migrate deploy

# Regenerar Prisma Client
npx prisma generate
```

---

## 📞 Contacto y Soporte

- **Repositorio:** https://github.com/qhosting/cuenty-mvp
- **Versión Actual:** 1.0.9
- **Último Commit:** cdc8a35

---

**Nota:** Esta guía asume que estás usando Easypanel como plataforma de deployment. Si usas otra plataforma (Heroku, Render, Railway, etc.), el proceso es similar pero puede requerir ajustes en la configuración de variables de entorno y comandos de deployment.

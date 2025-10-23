# 🔍 Diagnóstico de Deployment - CUENTY MVP

> **Fecha:** 2025-10-23  
> **Versión:** 1.0.9  
> **Estado:** Los cambios están en GitHub pero no se visualizan en producción

---

## 📊 Resumen del Análisis

### ✅ Estado del Código

- **Commits verificados en GitHub:**
  - `f5ecaea` - "chore: Actualizar versión a 1.0.9 y confirmar migraciones aplicadas"
  - `21c600b` - "feat: Agregar páginas 'Cómo funciona' y 'Soporte' con contenido completo"
- **Último push:** 2025-10-23 08:06:34 UTC
- **Repositorio:** `qhosting/cuenty-mvp`
- **Branch:** `main`

### ✅ Estado de Migraciones

**Backend (2 migraciones):**
- `20251021042116_init` - Migración inicial
- `20251021165212_add_password_to_usuario` - Agregar campo password

**Frontend (2 migraciones):**
- `20251018015515_init` - Migración inicial
- `20251021000000_add_user_fields` - Agregar campos de usuario

### ✅ Sistema de Migraciones Automáticas

**Estado:** 🟢 **CONFIGURADO Y FUNCIONAL**

El proyecto **YA tiene** toda la configuración necesaria para aplicar migraciones automáticamente:

- ✅ `start-docker.sh` - Script principal con migraciones automáticas
- ✅ `backend/scripts/migrate.js` - Script de migraciones del backend
- ✅ `nextjs_space/scripts/migrate.js` - Script de migraciones del frontend
- ✅ `scripts/wait-for-postgres.sh` - Verificación de conectividad
- ✅ `scripts/wait-for-backend.sh` - Verificación del backend
- ✅ `Dockerfile` - Incluye todos los scripts necesarios
- ✅ `docker-compose.yml` - Configuración para desarrollo local

---

## 🎯 Problema Identificado

### Los cambios NO se visualizan en producción

Aunque el código está en GitHub y el sistema de migraciones está configurado, **los cambios no se están reflejando en el entorno de producción**.

### Posibles causas (ordenadas por probabilidad)

#### 1. 🔴 El servicio de hosting NO está usando la última versión del código

**Síntomas:**
- Los commits están en GitHub
- El código local está actualizado
- El sitio en producción muestra versión antigua

**Causas comunes:**
- El servicio (Easypanel, Railway, etc.) no detectó el push automáticamente
- El auto-deploy está deshabilitado
- El build falló silenciosamente
- El servicio está usando una imagen Docker cacheada

**Solución:**
```bash
# Opción A: Forzar rebuild en el dashboard del servicio
# 1. Ir al dashboard de Easypanel/Railway
# 2. Buscar opción "Rebuild" o "Redeploy"
# 3. Activar "No cache" o "Clean build"
# 4. Deploy

# Opción B: Forzar push y rebuild desde local
git commit --allow-empty -m "chore: Force rebuild - deploy version 1.0.9"
git push origin main
```

#### 2. 🟠 Las migraciones NO se están ejecutando en producción

**Síntomas:**
- El código se despliega
- Pero los cambios de base de datos no se aplican
- Errores relacionados con columnas faltantes

**Causas comunes:**
- `start-docker.sh` no se está ejecutando
- El servicio está usando un comando de inicio diferente
- El `CMD` del Dockerfile no se está respetando

**Verificación:**
```bash
# Ver qué comando está usando el contenedor en producción
# En Easypanel/Railway, revisar:
# - "Start Command" o "Run Command"
# - Debe estar VACÍO o usar: ./start-docker.sh

# Si está configurado diferente (ej: npm start, node server.js)
# Está IGNORANDO el sistema de migraciones automáticas
```

**Solución:**
1. Ir a la configuración del servicio
2. Buscar "Start Command" o "Command Override"
3. **Dejarlo VACÍO** para usar el `CMD` del Dockerfile
4. O configurar explícitamente: `./start-docker.sh`
5. Redeploy

#### 3. 🟡 Cache del navegador

**Síntomas:**
- Otros usuarios ven los cambios
- Tú no los ves
- Funciona en modo incógnito

**Solución:**
```bash
# Limpiar cache del navegador
# Chrome/Edge: Ctrl+Shift+Delete (Windows) o Cmd+Shift+Delete (Mac)
# O simplemente: Ctrl+Shift+R (hard refresh)

# Verificar en modo incógnito
# Si funciona en incógnito = es cache del navegador
```

#### 4. 🟡 Variables de entorno incorrectas o faltantes

**Síntomas:**
- El sitio carga pero faltan funcionalidades
- Errores en logs sobre variables undefined
- NextAuth no funciona

**Verificación:**
```bash
# Verificar que estén configuradas TODAS las variables críticas:
DATABASE_URL=postgresql://...?schema=public
JWT_SECRET=...
ENCRYPTION_KEY=...
NEXTAUTH_SECRET=...
NEXTAUTH_URL=https://tu-dominio.com
NODE_ENV=production
PORT=3000
NEXTJS_PORT=3001
```

**Solución:**
1. Ir a configuración de variables de entorno
2. Verificar que todas existan
3. Especialmente `DATABASE_URL` debe terminar en `?schema=public`
4. Restart del servicio después de cambiar variables

#### 5. 🟢 El Dockerfile no se está usando

**Síntomas:**
- El servicio detecta el `package.json`
- Usa build de Node.js en lugar de Docker
- Ignora el `Dockerfile` completamente

**Verificación:**
En la configuración del servicio, buscar:
- **Build Method:** Debe ser "Dockerfile" o "Docker"
- **Dockerfile Path:** Debe ser `./Dockerfile` o `Dockerfile`

**Solución:**
1. Cambiar Build Method a "Dockerfile"
2. Especificar ruta: `./Dockerfile`
3. Limpiar cache
4. Rebuild completo

---

## 🛠️ Plan de Acción Recomendado

### Paso 1: Verificar configuración del servicio de hosting

**Para Easypanel:**

1. Acceder al dashboard de Easypanel
2. Ir al proyecto CUENTY
3. Verificar:
   ```
   Build:
   ├─ Source: GitHub - qhosting/cuenty-mvp
   ├─ Branch: main
   ├─ Build Method: Dockerfile
   └─ Dockerfile Path: ./Dockerfile
   
   Deploy:
   ├─ Start Command: [VACÍO] o ./start-docker.sh
   ├─ Port: 3000
   └─ Auto Deploy: Enabled
   
   Environment Variables:
   ├─ DATABASE_URL (REQUERIDO)
   ├─ JWT_SECRET (REQUERIDO)
   ├─ ENCRYPTION_KEY (REQUERIDO)
   ├─ NEXTAUTH_SECRET (REQUERIDO)
   ├─ NEXTAUTH_URL (REQUERIDO)
   └─ NODE_ENV=production
   ```

**Para Railway:**

1. Acceder al dashboard de Railway
2. Ir al servicio CUENTY
3. Verificar:
   ```
   Settings:
   ├─ Build Command: [VACÍO]
   ├─ Start Command: [VACÍO]
   └─ Watch Paths: [TODOS]
   
   Variables:
   ├─ DATABASE_URL (con ?schema=public)
   ├─ JWT_SECRET
   ├─ ENCRYPTION_KEY
   ├─ NEXTAUTH_SECRET
   └─ NEXTAUTH_URL
   ```

### Paso 2: Forzar rebuild limpio

```bash
# Opción A: Desde el dashboard del servicio
1. Ir a "Deployments"
2. Click en "⋮" (menú)
3. Seleccionar "Rebuild"
4. Activar "Clear build cache" si existe
5. Confirmar

# Opción B: Desde Git (trigger automático)
git commit --allow-empty -m "chore: Force production rebuild"
git push origin main

# Opción C: Usando Docker localmente (para validar)
docker build --no-cache -t cuenty-mvp:test .
docker run -it --rm \
  -e DATABASE_URL="postgresql://..." \
  -e JWT_SECRET="test" \
  -e ENCRYPTION_KEY="test" \
  -e NEXTAUTH_SECRET="test" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -p 3000:3000 \
  cuenty-mvp:test
```

### Paso 3: Verificar logs de deployment

Durante el deployment, buscar estos mensajes clave:

```log
✅ Mensajes que DEBEN aparecer:
════════════════════════════════════════════════════════════════
╔═══════════════════════════════════════════════════════════╗
║      🎬 CUENTY Docker - Inicio Secuencial Robusto         ║
╚═══════════════════════════════════════════════════════════╝

PASO 0/5: Verificando conectividad con PostgreSQL
✅ Conectividad con PostgreSQL verificada exitosamente

PASO 1/5: Ejecutando migraciones del BACKEND
✅ Migraciones del BACKEND aplicadas correctamente

PASO 2/5: Iniciando Backend (Puerto: 3000)
✅ Backend iniciado (PID: ...)

PASO 3/5: Esperando a que Backend esté disponible
✅ Backend responde correctamente en puerto 3000

PASO 4/5: Ejecutando migraciones del FRONTEND
✅ Migraciones del FRONTEND aplicadas correctamente

PASO 5/5: Iniciando Frontend (Puerto: 3001)
✅ Frontend iniciado (PID: ...)

╔═══════════════════════════════════════════════════════════╗
║           ✅ CUENTY - Sistema Completamente Iniciado       ║
╚═══════════════════════════════════════════════════════════╝
```

```log
❌ Mensajes de ERROR que NO deben aparecer:
════════════════════════════════════════════════════════════════
❌ ERROR: DATABASE_URL no está configurada
❌ ERROR CRÍTICO: No se pudo conectar a PostgreSQL
❌ ERROR CRÍTICO: Migraciones del BACKEND fallaron
❌ ERROR: Backend no respondió después de 60s
❌ ERROR: Frontend se detuvo inesperadamente
```

### Paso 4: Verificar que los cambios se aplicaron

**A. Verificar versión de la API:**

```bash
curl https://tu-dominio.com/api/version
# Debe mostrar: { "version": "1.0.9", ... }
```

**B. Verificar páginas nuevas:**

1. Acceder a `https://tu-dominio.com/como-funciona`
   - Debe cargar la página "Cómo funciona"
   - Debe mostrar contenido completo con secciones

2. Acceder a `https://tu-dominio.com/soporte`
   - Debe cargar la página "Soporte"
   - Debe mostrar formulario de contacto y FAQs

**C. Verificar migraciones en la base de datos:**

```bash
# Conectar a la base de datos
psql "$DATABASE_URL"

# Verificar migraciones aplicadas
SELECT migration_name, finished_at 
FROM "_prisma_migrations" 
ORDER BY finished_at DESC 
LIMIT 10;

# Debe mostrar:
# - 20251021165212_add_password_to_usuario
# - 20251021000000_add_user_fields
# - Y otras migraciones anteriores

# Verificar columnas nuevas en la tabla usuarios
\d usuarios
# Debe incluir columna: password | character varying(255) |
```

### Paso 5: Si todo falla, reiniciar desde cero

```bash
# 1. Eliminar deployment actual
# En el dashboard del servicio: Delete deployment

# 2. Crear nuevo deployment
# Conectar nuevamente el repositorio
# Configurar variables de entorno
# Seleccionar Dockerfile como método de build

# 3. Deploy inicial
# Esperar a que complete
# Verificar logs

# 4. Si sigue fallando, verificar permisos de GitHub
# Ir a: https://github.com/apps/abacusai/installations/select_target
# Asegurar que el repo qhosting/cuenty-mvp tenga acceso
```

---

## 📋 Checklist de Verificación

### Pre-deployment ✅

- [x] Código commiteado y pusheado a GitHub
- [x] Commits verificados en remoto (f5ecaea, 21c600b)
- [x] Migraciones creadas en backend/prisma/migrations/
- [x] Migraciones creadas en nextjs_space/prisma/migrations/
- [x] Scripts de migración existen y tienen permisos de ejecución
- [x] start-docker.sh configurado correctamente
- [x] Dockerfile incluye todos los scripts necesarios

### Durante deployment ⏳ (POR VERIFICAR)

- [ ] El servicio detectó el push a GitHub
- [ ] Build inició automáticamente
- [ ] Build usó el Dockerfile (no package.json)
- [ ] Build completó sin errores
- [ ] Imagen Docker se creó correctamente
- [ ] Variables de entorno están configuradas
- [ ] Contenedor se inició exitosamente

### Post-deployment ⏳ (POR VERIFICAR)

- [ ] Logs muestran: "🎬 CUENTY Docker - Inicio Secuencial Robusto"
- [ ] Logs muestran: "✅ Conectividad con PostgreSQL verificada"
- [ ] Logs muestran: "✅ Migraciones del BACKEND aplicadas"
- [ ] Logs muestran: "✅ Migraciones del FRONTEND aplicadas"
- [ ] Logs muestran: "✅ CUENTY - Sistema Completamente Iniciado"
- [ ] `/api/version` devuelve versión 1.0.9
- [ ] `/como-funciona` carga correctamente
- [ ] `/soporte` carga correctamente
- [ ] La base de datos tiene las nuevas columnas
- [ ] No hay errores en los logs

---

## 🎯 Acciones Inmediatas Recomendadas

### Acción 1: Verificar configuración del servicio de hosting

**Prioridad: 🔴 ALTA**

1. Acceder al dashboard de tu servicio de hosting
2. Verificar que:
   - El método de build sea "Dockerfile"
   - El comando de inicio esté vacío o sea `./start-docker.sh`
   - Las variables de entorno estén configuradas
   - El auto-deploy esté habilitado

### Acción 2: Forzar rebuild sin cache

**Prioridad: 🔴 ALTA**

```bash
# Opción más simple: Desde el dashboard
1. Ir a Deployments
2. Click en "Rebuild"
3. Activar "No cache" si existe
4. Deploy

# Alternativa: Commit vacío
git commit --allow-empty -m "chore: Force production rebuild v1.0.9"
git push origin main
```

### Acción 3: Monitorear logs durante el deployment

**Prioridad: 🟠 MEDIA**

1. Iniciar el deployment
2. Ver logs en tiempo real
3. Buscar mensajes de éxito/error
4. Tomar screenshot de cualquier error
5. Compartir logs si hay problemas

### Acción 4: Verificar base de datos

**Prioridad: 🟡 BAJA** (solo si las acciones anteriores no funcionan)

```bash
# Conectar a la base de datos
psql "$DATABASE_URL"

# Ver estado de migraciones
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 5;

# Ver tablas actuales
\dt

# Verificar columnas de usuarios
\d usuarios
\d "User"
```

---

## 🔍 Comandos de Diagnóstico

### Verificar código local vs GitHub

```bash
cd /home/ubuntu/cuenty_mvp

# Ver últimos commits locales
git log --oneline -5

# Ver últimos commits en GitHub
git fetch origin
git log origin/main --oneline -5

# Ver diferencias (no debería haber)
git diff origin/main

# Ver estado actual
git status
```

### Verificar estructura de migraciones

```bash
# Backend
echo "=== Backend Migrations ==="
ls -la /home/ubuntu/cuenty_mvp/backend/prisma/migrations/
echo ""
echo "=== Latest Backend Migration ==="
cat /home/ubuntu/cuenty_mvp/backend/prisma/migrations/20251021165212_add_password_to_usuario/migration.sql

# Frontend
echo ""
echo "=== Frontend Migrations ==="
ls -la /home/ubuntu/cuenty_mvp/nextjs_space/prisma/migrations/
echo ""
echo "=== Latest Frontend Migration ==="
cat /home/ubuntu/cuenty_mvp/nextjs_space/prisma/migrations/20251021000000_add_user_fields/migration.sql
```

### Verificar scripts de migración

```bash
# Verificar que los scripts existan
ls -la /home/ubuntu/cuenty_mvp/backend/scripts/migrate.js
ls -la /home/ubuntu/cuenty_mvp/nextjs_space/scripts/migrate.js
ls -la /home/ubuntu/cuenty_mvp/scripts/wait-for-postgres.sh
ls -la /home/ubuntu/cuenty_mvp/scripts/wait-for-backend.sh
ls -la /home/ubuntu/cuenty_mvp/start-docker.sh

# Verificar permisos de ejecución
find /home/ubuntu/cuenty_mvp -name "*.sh" -type f -exec ls -l {} \;
```

### Simular proceso de deployment localmente

```bash
cd /home/ubuntu/cuenty_mvp

# Build de la imagen Docker
docker build --no-cache -t cuenty-mvp:test .

# Ejecutar contenedor (reemplazar DATABASE_URL con tu valor)
docker run -it --rm \
  -e DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public" \
  -e JWT_SECRET="test-secret-min-32-chars-long-string" \
  -e ENCRYPTION_KEY="test-encryption-min-32-chars-long" \
  -e NEXTAUTH_SECRET="test-nextauth-min-32-chars-long-key" \
  -e NEXTAUTH_URL="http://localhost:3000" \
  -e NODE_ENV="production" \
  -e PORT="3000" \
  -e NEXTJS_PORT="3001" \
  -p 3000:3000 \
  cuenty-mvp:test

# Observar los logs
# Debe mostrar todo el proceso de migraciones e inicio
```

---

## 📚 Documentación Adicional

- **Guía completa de deployment:** Ver `DEPLOYMENT_GUIDE.md`
- **Repositorio:** https://github.com/qhosting/cuenty-mvp
- **Última versión:** 1.0.9 (commit f5ecaea)

---

## 🆘 Necesitas Ayuda?

Si después de seguir todos estos pasos aún tienes problemas:

1. **Toma screenshots de:**
   - Configuración del servicio de hosting
   - Logs del deployment
   - Variables de entorno configuradas
   - Cualquier mensaje de error

2. **Recopila información:**
   ```bash
   # Versión de Docker
   docker --version
   
   # Ver imagen actual
   docker images | grep cuenty
   
   # Ver contenedores corriendo
   docker ps -a | grep cuenty
   
   # Logs del contenedor
   docker logs [container-id] > deployment_logs.txt
   ```

3. **Comparte:**
   - Los screenshots
   - Los logs
   - La configuración de variables de entorno (SIN los valores secretos)

---

**Próximo paso recomendado:** Ejecutar [Acción 1](#acción-1-verificar-configuración-del-servicio-de-hosting) inmediatamente.

---

**Fecha de creación:** 2025-10-23  
**Última actualización:** 2025-10-23  
**Versión del documento:** 1.0.0

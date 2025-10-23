# 🚀 Guía de Deployment - CUENTY MVP

> **Versión actual:** 1.0.9  
> **Última actualización:** 2025-10-23  
> **Estado del sistema de migraciones:** ✅ Configurado y funcional

---

## 📋 Tabla de Contenidos

1. [Resumen Ejecutivo](#resumen-ejecutivo)
2. [Arquitectura del Sistema](#arquitectura-del-sistema)
3. [Sistema de Migraciones Automáticas](#sistema-de-migraciones-automáticas)
4. [Configuración de Variables de Entorno](#configuración-de-variables-de-entorno)
5. [Proceso de Deployment](#proceso-de-deployment)
6. [Troubleshooting](#troubleshooting)
7. [Checklist de Deployment](#checklist-de-deployment)

---

## 🎯 Resumen Ejecutivo

CUENTY MVP es una aplicación full-stack con **sistema de migraciones automáticas** integrado. El sistema está configurado para aplicar migraciones de base de datos automáticamente cada vez que se inicia el contenedor Docker, garantizando que la base de datos esté siempre sincronizada con el código.

### Características Principales

- ✅ **Migraciones automáticas** en cada deployment (modo seguro - no elimina datos)
- ✅ **Verificación de conectividad** con PostgreSQL antes de aplicar migraciones
- ✅ **Dual Prisma Schema**: Backend y Frontend con migraciones independientes
- ✅ **Reintentos automáticos** en caso de fallos transitorios
- ✅ **Logs detallados** de todo el proceso de inicio
- ✅ **Base de datos externa** configurada mediante variable de entorno

---

## 🏗️ Arquitectura del Sistema

### Estructura del Proyecto

```
cuenty_mvp/
├── backend/                    # Backend Express.js
│   ├── prisma/
│   │   ├── schema.prisma      # Schema del backend
│   │   └── migrations/        # Migraciones del backend
│   │       ├── 20251021042116_init/
│   │       └── 20251021165212_add_password_to_usuario/
│   └── scripts/
│       └── migrate.js         # Script de migraciones del backend
│
├── nextjs_space/              # Frontend Next.js
│   ├── prisma/
│   │   ├── schema.prisma      # Schema del frontend
│   │   └── migrations/        # Migraciones del frontend
│   │       ├── 20251018015515_init/
│   │       └── 20251021000000_add_user_fields/
│   └── scripts/
│       └── migrate.js         # Script de migraciones del frontend
│
├── scripts/                   # Scripts auxiliares
│   ├── wait-for-postgres.sh  # Verificación de conectividad PostgreSQL
│   ├── wait-for-backend.sh   # Verificación del backend
│   └── healthcheck.sh         # Healthcheck del contenedor
│
├── start-docker.sh            # 🔥 SCRIPT PRINCIPAL DE INICIO
├── Dockerfile                 # Imagen Docker optimizada
└── docker-compose.yml         # Orquestación (desarrollo local)
```

### Flujo de Inicio (start-docker.sh)

```mermaid
graph TD
    A[Inicio] --> B[Paso 0: Verificar PostgreSQL]
    B --> C[wait-for-postgres.sh]
    C -->|✅ Conectado| D[Paso 1: Migraciones Backend]
    C -->|❌ Fallo| Z[Exit 1]
    D --> E[backend/scripts/migrate.js]
    E -->|✅ OK| F[Paso 2: Iniciar Backend]
    E -->|❌ Fallo| Z
    F --> G[Paso 3: Esperar Backend]
    G --> H[wait-for-backend.sh]
    H -->|✅ OK| I[Paso 4: Migraciones Frontend]
    H -->|❌ Fallo| Z
    I --> J[nextjs_space/scripts/migrate.js]
    J --> K[Paso 5: Iniciar Frontend]
    K --> L[Sistema Listo]
```

---

## 🔄 Sistema de Migraciones Automáticas

### ¿Cómo funciona?

El sistema ejecuta **automáticamente** las siguientes acciones cada vez que se inicia el contenedor:

1. **Verifica conectividad con PostgreSQL** (hasta 2.5 minutos de espera)
2. **Aplica migraciones del BACKEND** usando `prisma migrate deploy`
3. **Genera Prisma Client del BACKEND**
4. **Inicia el servidor Backend**
5. **Espera a que el Backend esté disponible** (hasta 60 segundos)
6. **Aplica migraciones del FRONTEND** usando `prisma migrate deploy`
7. **Genera Prisma Client del FRONTEND**
8. **Inicia el servidor Frontend**

### Modo Seguro

Las migraciones utilizan `prisma migrate deploy` que:

- ✅ **NO resetea la base de datos**
- ✅ **NO elimina datos existentes**
- ✅ Solo aplica migraciones pendientes
- ✅ Es idempotente (puede ejecutarse múltiples veces sin problemas)
- ✅ Ignora migraciones ya aplicadas

### Scripts de Migración

#### Backend: `/app/backend/scripts/migrate.js`

```javascript
// Características:
// - 3 reintentos automáticos
// - Delay de 3 segundos entre reintentos
// - Logs detallados con colores
// - Verificación de DATABASE_URL
// - Generación automática de Prisma Client
```

#### Frontend: `/app/nextjs_space/scripts/migrate.js`

```javascript
// Características:
// - 3 reintentos automáticos
// - Delay de 5 segundos entre reintentos
// - Logs detallados con colores
// - Verificación de DATABASE_URL
// - Generación automática de Prisma Client
```

### Verificación de Conectividad

#### Script: `wait-for-postgres.sh`

Verifica que PostgreSQL esté accesible antes de ejecutar migraciones:

- **Métodos de verificación:** netcat, timeout, telnet
- **Reintentos:** 30 intentos (2.5 minutos máximo)
- **Delay:** 5 segundos entre intentos
- **Parse automático** de DATABASE_URL para extraer host y puerto

---

## ⚙️ Configuración de Variables de Entorno

### Variables Críticas (REQUERIDAS)

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `DATABASE_URL` | URL completa de conexión a PostgreSQL | `postgresql://user:pass@host:5432/dbname?schema=public` |
| `JWT_SECRET` | Secreto para tokens JWT | String aleatorio de al menos 32 caracteres |
| `ENCRYPTION_KEY` | Clave para encriptación de datos sensibles | String aleatorio de al menos 32 caracteres |
| `NEXTAUTH_SECRET` | Secreto para NextAuth.js | String aleatorio de al menos 32 caracteres |
| `NEXTAUTH_URL` | URL pública de la aplicación | `https://cuenty.example.com` |

### Variables Opcionales

| Variable | Descripción | Default |
|----------|-------------|---------|
| `NODE_ENV` | Entorno de ejecución | `production` |
| `PORT` | Puerto del backend | `3000` |
| `NEXTJS_PORT` | Puerto del frontend | `3001` |
| `CORS_ORIGIN` | Origen permitido para CORS | `*` |
| `N8N_WEBHOOK_SECRET` | Secreto para webhooks de n8n | - |
| `N8N_WEBHOOK_ENTREGA_CUENTA` | URL del webhook de entrega | - |
| `N8N_WEBHOOK_RESPUESTA_AGENTE` | URL del webhook de respuesta | - |

### Formato de DATABASE_URL

```bash
# Formato general
postgresql://[usuario]:[contraseña]@[host]:[puerto]/[nombre_db]?schema=public

# Ejemplo para base de datos local
DATABASE_URL="postgresql://cuenty_user:password123@localhost:5432/cuenty_db?schema=public"

# Ejemplo para base de datos externa (Railway, Supabase, etc.)
DATABASE_URL="postgresql://user:pass@db.railway.app:5432/railway?schema=public"

# Ejemplo para Easypanel con base de datos externa
DATABASE_URL="postgresql://postgres:securepass@external-db.com:5432/cuenty?schema=public"
```

### ⚠️ Importante

- **Siempre incluir `?schema=public`** al final de la URL
- **NO usar espacios** en la URL
- **Escapar caracteres especiales** en contraseñas (usar `%XX` encoding)
- **Verificar que el host sea accesible** desde el contenedor Docker

---

## 🚢 Proceso de Deployment

### Opción 1: Docker Compose (Desarrollo/Testing)

```bash
# 1. Clonar repositorio
git clone https://github.com/qhosting/cuenty-mvp.git
cd cuenty-mvp

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus valores

# 3. Iniciar servicios (incluye PostgreSQL local)
docker-compose up -d

# 4. Ver logs
docker-compose logs -f app

# 5. Acceder a la aplicación
# http://localhost:3000
```

### Opción 2: Dockerfile + Base de datos externa (Producción)

Este es el método recomendado para despliegues en servicios como **Easypanel**, **Railway**, **Render**, etc.

#### Configuración en Easypanel

1. **Crear nueva aplicación**
   - Tipo: Docker
   - Repositorio: `https://github.com/qhosting/cuenty-mvp.git`
   - Branch: `main`
   - Dockerfile path: `./Dockerfile`

2. **Configurar variables de entorno**
   
   Variables críticas mínimas:
   ```env
   DATABASE_URL=postgresql://user:pass@external-db.com:5432/dbname?schema=public
   JWT_SECRET=your-super-secret-jwt-key-min-32-chars
   ENCRYPTION_KEY=your-super-secret-encryption-key-min-32-chars
   NEXTAUTH_SECRET=your-super-secret-nextauth-key-min-32-chars
   NEXTAUTH_URL=https://your-domain.com
   NODE_ENV=production
   PORT=3000
   NEXTJS_PORT=3001
   ```

3. **Configurar puertos**
   - Puerto expuesto: `3000`
   - Protocolo: HTTP

4. **Configurar dominio**
   - Agregar tu dominio personalizado
   - Configurar SSL/TLS automático

5. **Desplegar**
   - Click en "Deploy"
   - Esperar a que el build complete
   - Verificar logs de inicio

#### Configuración en Railway

1. **Nuevo proyecto desde GitHub**
   - Conectar repositorio: `qhosting/cuenty-mvp`
   - Railway detectará el Dockerfile automáticamente

2. **Agregar base de datos PostgreSQL**
   - Agregar servicio PostgreSQL
   - Railway generará `DATABASE_URL` automáticamente
   - Copiar el valor de `DATABASE_URL`

3. **Configurar variables de entorno**
   
   En el servicio de la aplicación, agregar:
   ```env
   DATABASE_URL=${{Postgres.DATABASE_URL}}?schema=public
   JWT_SECRET=your-jwt-secret
   ENCRYPTION_KEY=your-encryption-key
   NEXTAUTH_SECRET=your-nextauth-secret
   NEXTAUTH_URL=${{RAILWAY_PUBLIC_DOMAIN}}
   NODE_ENV=production
   ```

4. **Desplegar**
   - Railway desplegará automáticamente
   - Verificar logs en el dashboard

### Opción 3: Docker manual

```bash
# 1. Build de la imagen
docker build -t cuenty-mvp:latest .

# 2. Ejecutar contenedor
docker run -d \
  --name cuenty-app \
  -p 3000:3000 \
  -e DATABASE_URL="postgresql://user:pass@db-host:5432/dbname?schema=public" \
  -e JWT_SECRET="your-jwt-secret" \
  -e ENCRYPTION_KEY="your-encryption-key" \
  -e NEXTAUTH_SECRET="your-nextauth-secret" \
  -e NEXTAUTH_URL="https://your-domain.com" \
  -e NODE_ENV="production" \
  cuenty-mvp:latest

# 3. Ver logs
docker logs -f cuenty-app
```

---

## 🔍 Troubleshooting

### Problema 1: "Los cambios no se visualizan en producción"

#### Posibles causas:

1. **Cache del navegador**
   - Solución: Limpiar cache del navegador (Ctrl+Shift+R o Cmd+Shift+R)
   - Verificar en modo incógnito

2. **El deployment no usó la última versión del código**
   - Verificar en GitHub que los commits estén presentes
   - Forzar rebuild sin cache: `docker build --no-cache -t cuenty-mvp .`

3. **Las migraciones no se ejecutaron**
   - Revisar logs del contenedor durante el inicio
   - Buscar mensajes como "✅ Migraciones del BACKEND aplicadas"
   - Buscar mensajes como "✅ Migraciones del FRONTEND aplicadas"

4. **Variables de entorno incorrectas**
   - Verificar que `DATABASE_URL` sea correcta
   - Verificar que termine con `?schema=public`
   - Verificar que el host de la base de datos sea accesible desde el contenedor

5. **El servicio de hosting no está usando el Dockerfile**
   - Verificar que el build command esté vacío o use Dockerfile
   - Verificar que no haya un `package.json` interfiriendo con el build

#### Pasos de diagnóstico:

```bash
# 1. Verificar que los commits estén en GitHub
git log --oneline -5

# 2. Verificar el contenido de las migraciones
ls -la backend/prisma/migrations/
ls -la nextjs_space/prisma/migrations/

# 3. Si estás usando Docker local, reconstruir sin cache
docker-compose down
docker-compose build --no-cache
docker-compose up -d

# 4. Ver logs detallados del inicio
docker-compose logs -f app

# 5. Verificar logs específicos de migraciones
docker exec -it cuenty-app tail -f /app/logs/startup.log
```

### Problema 2: "ERROR: No se pudo conectar a PostgreSQL"

#### Diagnóstico:

```bash
# Verificar que DATABASE_URL esté configurada
docker exec -it cuenty-app printenv DATABASE_URL

# Intentar conexión manual desde el contenedor
docker exec -it cuenty-app bash
# Dentro del contenedor:
nc -zv db-host 5432  # Verificar conectividad TCP
psql "$DATABASE_URL"  # Intentar conexión con psql
```

#### Soluciones:

1. **Base de datos no accesible desde el contenedor**
   - Verificar que el host sea correcto
   - Si usas `localhost`, cambiar a la IP del host o nombre del contenedor
   - Si usas Docker Compose, usar el nombre del servicio (`postgres` en vez de `localhost`)

2. **Firewall bloqueando conexión**
   - Verificar reglas de firewall en el servidor de base de datos
   - Permitir conexiones desde la IP del contenedor

3. **Credenciales incorrectas**
   - Verificar usuario y contraseña en DATABASE_URL
   - Crear el usuario si no existe

4. **Base de datos no existe**
   - Crear la base de datos manualmente antes del deployment
   - O usar un servicio que la cree automáticamente (Railway, Supabase, etc.)

### Problema 3: "Migraciones fallidas"

#### Mensajes comunes:

- `Error: P1001: Can't reach database server`
  - Solución: Verificar conectividad (ver Problema 2)

- `Error: P3009: migrate.lock file should not be edited manually`
  - Solución: Resetear estado de migraciones o usar `prisma migrate resolve`

- `Error: P3005: The database schema is not empty`
  - Solución: Normal si la base de datos ya tiene tablas. `migrate deploy` manejará esto.

#### Pasos de recuperación:

```bash
# 1. Entrar al contenedor
docker exec -it cuenty-app bash

# 2. Verificar estado de migraciones del backend
cd /app/backend
npx prisma migrate status

# 3. Verificar estado de migraciones del frontend
cd /app/nextjs_space
npx prisma migrate status

# 4. Si hay problemas, intentar aplicar manualmente
cd /app/backend
npx prisma migrate deploy

cd /app/nextjs_space
npx prisma migrate deploy

# 5. Si todo falla, verificar el schema
cd /app/backend
npx prisma db pull  # Traer schema actual de la DB
```

### Problema 4: "Frontend no carga / Error 502"

#### Posibles causas:

1. **Frontend no se inició correctamente**
   - Verificar logs: `docker logs cuenty-app | grep Frontend`
   - Buscar errores en `/app/logs/frontend.log`

2. **Build del frontend falló**
   - Verificar que exista `.next/standalone/server.js`
   - Rebuild sin cache

3. **Variables de entorno incorrectas**
   - Verificar `NEXTAUTH_URL` y `NEXTAUTH_SECRET`

#### Solución rápida:

```bash
# Reiniciar el contenedor
docker restart cuenty-app

# Ver logs en tiempo real
docker logs -f cuenty-app
```

### Problema 5: "Database connection pool exhausted"

Si ves errores de pool de conexiones:

```bash
# Aumentar el pool de conexiones en DATABASE_URL
DATABASE_URL="postgresql://user:pass@host:5432/db?schema=public&connection_limit=20&pool_timeout=20"
```

O editar el schema de Prisma:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  
  // Configuración del pool de conexiones
  relationMode = "prisma"
  directUrl = env("DATABASE_URL")
  shadowDatabaseUrl = env("SHADOW_DATABASE_URL")
  
  // Pool settings
  connectionLimit = 20
  poolTimeout = 20
}
```

---

## ✅ Checklist de Deployment

### Pre-deployment

- [ ] Código commiteado y pusheado a GitHub
- [ ] Migraciones creadas y testeadas localmente
- [ ] Variables de entorno documentadas
- [ ] Base de datos de producción creada y accesible
- [ ] DATABASE_URL validada (incluye `?schema=public`)
- [ ] Secretos generados (JWT, ENCRYPTION, NEXTAUTH)

### Durante el deployment

- [ ] Servicio detecta el Dockerfile correctamente
- [ ] Build completa sin errores
- [ ] Variables de entorno configuradas
- [ ] Puerto 3000 expuesto
- [ ] Dominio configurado (si aplica)

### Post-deployment

- [ ] Contenedor arranca exitosamente
- [ ] Logs muestran: "✅ CUENTY - Sistema Completamente Iniciado"
- [ ] Logs muestran: "✅ Migraciones del BACKEND aplicadas"
- [ ] Logs muestran: "✅ Migraciones del FRONTEND aplicadas"
- [ ] Backend responde en `/health`
- [ ] Backend responde en `/api-info`
- [ ] Frontend carga correctamente
- [ ] Autenticación funciona
- [ ] Nuevas páginas/features visibles

### Verificación de migraciones

```bash
# Conectar a la base de datos y verificar tablas
psql "$DATABASE_URL"

# Ver tablas
\dt

# Verificar tabla de migraciones
SELECT * FROM "_prisma_migrations" ORDER BY finished_at DESC LIMIT 5;

# Verificar que las columnas nuevas existan
\d usuarios  -- Para el backend
\d "User"    -- Para el frontend
```

---

## 📝 Logs Importantes

### Ubicación de logs en el contenedor

```bash
/app/logs/
├── startup.log      # Log completo del inicio
├── backend.log      # Logs del servidor backend
└── frontend.log     # Logs del servidor frontend
```

### Ver logs desde fuera del contenedor

```bash
# Ver todos los logs del contenedor
docker logs cuenty-app

# Seguir logs en tiempo real
docker logs -f cuenty-app

# Últimas 100 líneas
docker logs --tail 100 cuenty-app

# Filtrar por tipo
docker logs cuenty-app 2>&1 | grep "Migra"
docker logs cuenty-app 2>&1 | grep "ERROR"
```

### Ver logs desde dentro del contenedor

```bash
# Entrar al contenedor
docker exec -it cuenty-app bash

# Ver logs individuales
tail -f /app/logs/startup.log
tail -f /app/logs/backend.log
tail -f /app/logs/frontend.log

# Ver todos los logs
tail -f /app/logs/*.log
```

---

## 🔐 Seguridad

### Generación de secretos seguros

```bash
# Generar secretos aleatorios (Linux/Mac)
openssl rand -base64 32

# O usando Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# O usando Python
python3 -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Variables que DEBEN ser únicas y secretas

- `JWT_SECRET`: Para autenticación
- `ENCRYPTION_KEY`: Para datos encriptados
- `NEXTAUTH_SECRET`: Para sesiones de NextAuth
- `N8N_WEBHOOK_SECRET`: Para webhooks de n8n

### Rotación de secretos

Si necesitas cambiar secretos en producción:

1. Actualizar la variable de entorno
2. Reiniciar el contenedor
3. Los usuarios existentes tendrán que volver a loguearse

---

## 📞 Soporte

### Recursos

- **Repositorio:** https://github.com/qhosting/cuenty-mvp
- **Documentación Prisma:** https://www.prisma.io/docs
- **Documentación Next.js:** https://nextjs.org/docs
- **Documentación Docker:** https://docs.docker.com

### Información del Sistema

```bash
# Versión de la aplicación
curl http://localhost:3000/api/version

# Health check
curl http://localhost:3000/health

# Información de la API
curl http://localhost:3000/api-info
```

---

## 📊 Monitoreo

### Endpoints de monitoreo

- `GET /health` - Health check del backend
- `GET /api/version` - Versión de la aplicación
- `GET /api-info` - Información de la API

### Verificación automática

El contenedor incluye un healthcheck automático que verifica cada 30 segundos que el backend esté respondiendo. Si falla 3 veces consecutivas, Docker marcará el contenedor como "unhealthy".

---

## 🎉 ¡Deployment Exitoso!

Si todos los pasos anteriores completaron exitosamente, tu aplicación CUENTY MVP está lista y funcionando con:

- ✅ Base de datos sincronizada con las últimas migraciones
- ✅ Backend API funcionando
- ✅ Frontend Next.js funcionando
- ✅ Autenticación configurada
- ✅ Sistema de migraciones automáticas para futuros deployments

**Próximos pasos:**

1. Verificar que todas las funcionalidades trabajen correctamente
2. Configurar backups automáticos de la base de datos
3. Configurar monitoreo y alertas
4. Implementar CI/CD para deployments automatizados

---

**Fecha de creación:** 2025-10-23  
**Última actualización:** 2025-10-23  
**Versión del documento:** 1.0.0

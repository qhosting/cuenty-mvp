# 🔄 Sistema de Migraciones Automáticas de CUENTY

## 📋 Tabla de Contenidos

1. [Descripción General](#descripción-general)
2. [Cómo Funcionan las Migraciones Automáticas](#cómo-funcionan-las-migraciones-automáticas)
3. [Scripts Disponibles](#scripts-disponibles)
4. [Crear Nuevas Migraciones en Desarrollo](#crear-nuevas-migraciones-en-desarrollo)
5. [Migraciones en Producción](#migraciones-en-producción)
6. [Diferencia: migrate deploy vs migrate dev](#diferencia-migrate-deploy-vs-migrate-dev)
7. [Cómo Revertir Migraciones](#cómo-revertir-migraciones)
8. [Solución de Problemas](#solución-de-problemas)
9. [Mejores Prácticas](#mejores-prácticas)

---

## 📖 Descripción General

CUENTY ahora incluye un **sistema de migraciones automáticas** usando Prisma que garantiza:

- ✅ **Seguridad de Datos**: Las migraciones NUNCA borran datos en producción
- ✅ **Automatización**: Se ejecutan automáticamente al iniciar el contenedor Docker
- ✅ **Idempotencia**: Pueden ejecutarse múltiples veces sin causar errores
- ✅ **Trazabilidad**: Cada cambio en la base de datos está versionado

### 🏗️ Estructura de Archivos

```
nextjs_space/
├── prisma/
│   ├── schema.prisma                    # Schema de la base de datos
│   └── migrations/                      # Historial de migraciones
│       ├── migration_lock.toml          # Lock file (PostgreSQL)
│       └── YYYYMMDDHHMMSS_nombre/       # Cada migración
│           └── migration.sql            # SQL de la migración
├── scripts/
│   ├── migrate.js                       # Script de migración segura
│   └── start-with-migrations.sh         # Script de inicio con migraciones
└── package.json                         # Scripts npm actualizados
```

---

## 🔄 Cómo Funcionan las Migraciones Automáticas

### En Docker (Producción)

Cuando el contenedor Docker inicia:

1. **Backend inicia** primero (puerto 3000)
2. **Verifica conexión** a la base de datos
3. **Ejecuta migraciones** automáticamente usando `prisma migrate deploy`
   - Este comando aplica SOLO las migraciones pendientes
   - NO resetea la base de datos
   - NO borra datos existentes
4. **Genera Prisma Client** actualizado
5. **Frontend inicia** (puerto 3001)

### Flujo Visual

```
┌─────────────────┐
│  Docker Start   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Backend Init   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Check DB URL   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Run Migrations  │ ◄── migrate deploy (SAFE)
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Generate Client │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│ Frontend Start  │
└─────────────────┘
```

---

## 📜 Scripts Disponibles

### En `package.json` (nextjs_space)

```json
{
  "scripts": {
    // Producción (Automático en Docker)
    "start:migrate": "node scripts/migrate.js && npm start",
    "migrate": "prisma migrate deploy",
    
    // Desarrollo
    "migrate:dev": "prisma migrate dev",
    "migrate:create": "prisma migrate dev --name",
    "migrate:status": "prisma migrate status",
    
    // Utilidades
    "migrate:reset": "prisma migrate reset",
    "db:push": "prisma db push",
    "prisma:generate": "prisma generate",
    "prisma:studio": "prisma studio"
  }
}
```

### Scripts Personalizados

#### `scripts/migrate.js`
Script Node.js que:
- Verifica `DATABASE_URL`
- Ejecuta `prisma migrate deploy` con reintentos
- Genera Prisma Client
- Logs detallados y coloridos
- Manejo robusto de errores

#### `scripts/start-with-migrations.sh`
Script Bash que:
- Espera a que la base de datos esté disponible
- Ejecuta migraciones antes de iniciar
- Inicia el servidor Next.js
- Manejo graceful de señales SIGTERM/SIGINT

---

## 🛠️ Crear Nuevas Migraciones en Desarrollo

### Opción 1: Migración Completa (Recomendado)

Cuando cambias el `schema.prisma`:

```bash
cd nextjs_space

# Crear migración con nombre descriptivo
npm run migrate:create mi_nueva_migracion

# Ejemplo concreto
npm run migrate:create agregar_campo_telefono_usuario
```

Esto:
1. Detecta cambios en `schema.prisma`
2. Genera el archivo SQL automáticamente
3. Aplica la migración a tu base de datos local
4. Actualiza Prisma Client

### Opción 2: Prototipar Cambios (Solo Desarrollo)

Para probar cambios rápidamente sin crear migración:

```bash
npm run db:push
```

⚠️ **ADVERTENCIA**: `db:push` NO crea archivos de migración. Úsalo solo para prototipado.

### Proceso Completo: Cambiar el Schema

```bash
# 1. Editar el schema
code prisma/schema.prisma

# 2. Crear la migración
npm run migrate:create agregar_nueva_tabla

# 3. Verificar el SQL generado
cat prisma/migrations/YYYYMMDDHHMMSS_agregar_nueva_tabla/migration.sql

# 4. Verificar estado
npm run migrate:status

# 5. Commit los cambios
git add prisma/
git commit -m "feat: agregar nueva tabla para funcionalidad X"
```

---

## 🚀 Migraciones en Producción

### Automáticas (Docker)

Las migraciones se ejecutan **automáticamente** al iniciar el contenedor:

```bash
# El Dockerfile ya está configurado
docker-compose up -d

# Las migraciones se ejecutan automáticamente en:
# PASO 3/4: Ejecutando migraciones de base de datos
```

### Manuales (Si es necesario)

Si necesitas ejecutar migraciones manualmente en producción:

```bash
# Dentro del contenedor
docker exec -it cuenty_mvp /bin/bash
cd /app/nextjs_space
node scripts/migrate.js

# O desde fuera del contenedor
docker-compose exec cuenty_mvp /bin/bash -c "cd /app/nextjs_space && node scripts/migrate.js"
```

### Verificar Estado de Migraciones

```bash
# Ver qué migraciones están aplicadas
npm run migrate:status

# O en Docker
docker-compose exec cuenty_mvp /bin/bash -c "cd /app/nextjs_space && npm run migrate:status"
```

---

## ⚖️ Diferencia: migrate deploy vs migrate dev

### `prisma migrate deploy` (Producción) ✅

**Usado en**: Docker, Producción, CI/CD

**Comportamiento**:
- ✅ Aplica SOLO migraciones pendientes
- ✅ NO resetea la base de datos
- ✅ NO borra datos
- ✅ NO requiere interacción del usuario
- ✅ Idempotente (seguro ejecutar múltiples veces)
- ✅ Lee migraciones de `prisma/migrations/`

**Cuándo usar**:
- En producción (Docker)
- En staging
- En CI/CD pipelines
- Cuando hay datos importantes que NO se deben perder

### `prisma migrate dev` (Desarrollo) ⚠️

**Usado en**: Desarrollo local únicamente

**Comportamiento**:
- ⚠️ Puede resetear la base de datos si detecta drift
- ⚠️ Puede pedir confirmación para resetear
- ⚠️ Genera nuevos archivos de migración
- ⚠️ Aplica cambios inmediatamente

**Cuándo usar**:
- Solo en tu máquina de desarrollo local
- Cuando estás creando nuevas migraciones
- Cuando estás prototipando el schema

### Comparación Visual

```
DESARROLLO                      PRODUCCIÓN
═══════════════════════════════════════════════════

schema.prisma                   Docker Container
     │                                │
     ▼                                ▼
migrate dev                     migrate deploy
     │                                │
     ├─ Detecta cambios               ├─ Lee migrations/
     ├─ Puede resetear DB ⚠️          ├─ Solo aplica pendientes ✅
     ├─ Genera migration.sql          ├─ NO resetea ✅
     └─ Aplica cambios                └─ Preserva datos ✅
```

---

## ⏮️ Cómo Revertir Migraciones

Prisma NO tiene un comando directo de "rollback". Las opciones son:

### Opción 1: Crear Migración de Reversión (Recomendado)

```bash
# 1. Edita schema.prisma para revertir el cambio
code prisma/schema.prisma

# 2. Crea una nueva migración
npm run migrate:create revertir_cambio_x

# 3. Verifica el SQL generado
cat prisma/migrations/YYYYMMDDHHMMSS_revertir_cambio_x/migration.sql

# 4. Aplica la migración de reversión
npm run migrate:dev
```

### Opción 2: Editar SQL Manualmente

```bash
# 1. Crea una nueva migración vacía
npm run migrate:create revertir_manualmente

# 2. Edita el SQL generado
code prisma/migrations/YYYYMMDDHHMMSS_revertir_manualmente/migration.sql

# Ejemplo: Si agregaste una columna
ALTER TABLE "User" DROP COLUMN "telefono";

# 3. Aplica la migración
npm run migrate:deploy
```

### Opción 3: Restaurar Backup (Última Opción)

Si tienes un backup de la base de datos:

```bash
# Restaurar desde backup
psql -h cloudmx_cuenty-db -U postgres -d cuenty-db < backup.sql

# Luego, marcar las migraciones como aplicadas
npx prisma migrate resolve --applied YYYYMMDDHHMMSS_nombre_migracion
```

---

## 🔧 Solución de Problemas

### Error: "Can't reach database server"

**Causa**: `DATABASE_URL` no está configurado o es incorrecto.

**Solución**:
```bash
# Verifica que DATABASE_URL esté en .env
cat .env | grep DATABASE_URL

# Debe ser algo como:
# DATABASE_URL=postgresql://postgres:password@host:5432/cuenty-db
```

### Error: "Migration engine failed"

**Causa**: La base de datos tiene cambios manuales (drift).

**Solución**:
```bash
# Ver el estado de las migraciones
npm run migrate:status

# Opciones:
# 1. Marcar migración como aplicada (si ya está en la DB)
npx prisma migrate resolve --applied YYYYMMDDHHMMSS_nombre

# 2. Marcar como revertida (si necesitas reaplicar)
npx prisma migrate resolve --rolled-back YYYYMMDDHHMMSS_nombre
```

### Error: "Prisma Client not generated"

**Causa**: Prisma Client no está generado.

**Solución**:
```bash
npm run prisma:generate
```

### Migraciones no se aplican en Docker

**Verificar**:
```bash
# 1. Ver logs del contenedor
docker-compose logs cuenty_mvp

# 2. Verificar que scripts estén en la imagen
docker exec -it cuenty_mvp ls -la /app/nextjs_space/scripts/

# 3. Ejecutar migraciones manualmente
docker exec -it cuenty_mvp /bin/bash -c "cd /app/nextjs_space && node scripts/migrate.js"
```

### Base de datos tiene datos pero no migraciones

**Situación**: La base de datos ya existe con tablas, pero no hay historial de migraciones.

**Solución**: Marcar la migración inicial como ya aplicada
```bash
# Marcar la migración init como aplicada (sin ejecutarla)
npx prisma migrate resolve --applied 20251018015515_init

# Verificar estado
npm run migrate:status
```

---

## 🎯 Mejores Prácticas

### ✅ DO (Hacer)

1. **Siempre crea migraciones en desarrollo**
   ```bash
   npm run migrate:create nombre_descriptivo
   ```

2. **Revisa el SQL generado antes de aplicar**
   ```bash
   cat prisma/migrations/LATEST/migration.sql
   ```

3. **Commit las migraciones al repositorio**
   ```bash
   git add prisma/migrations/
   git commit -m "feat: agregar nueva funcionalidad"
   ```

4. **Usa nombres descriptivos para migraciones**
   - ✅ `agregar_campo_telefono_usuario`
   - ✅ `crear_tabla_notificaciones`
   - ❌ `fix`
   - ❌ `update`

5. **Haz migraciones pequeñas y frecuentes**
   - Una migración = un cambio lógico
   - Más fácil de revertir
   - Más fácil de entender

6. **Prueba las migraciones localmente primero**
   ```bash
   # En desarrollo
   npm run migrate:dev
   
   # Verifica que funcione
   npm run dev
   ```

7. **Haz backup antes de grandes cambios**
   ```bash
   pg_dump -h host -U postgres -d cuenty-db > backup_$(date +%Y%m%d).sql
   ```

### ❌ DON'T (No Hacer)

1. **NO uses `migrate dev` en producción**
   - Puede resetear datos
   - Usa solo `migrate deploy`

2. **NO edites migraciones ya aplicadas**
   - Una vez aplicada, la migración es inmutable
   - Crea una nueva migración para cambios

3. **NO hagas cambios manuales en la base de datos de producción**
   - Siempre usa migraciones
   - Mantiene consistencia

4. **NO uses `migrate reset` en producción**
   - BORRA TODOS LOS DATOS
   - Solo para desarrollo

5. **NO ignores errores de migración**
   - Investiga y resuelve
   - No marques como aplicada sin verificar

6. **NO uses `db push` en producción**
   - No crea historial de migraciones
   - Solo para prototipado en desarrollo

---

## 📊 Ejemplo de Flujo Completo

### Escenario: Agregar campo "telefono" a User

```bash
# ==========================================
# PASO 1: Desarrollo Local
# ==========================================

# 1. Editar schema.prisma
code prisma/schema.prisma

# Agregar:
# model User {
#   ...
#   telefono String?
# }

# 2. Crear migración
npm run migrate:create agregar_telefono_usuario

# 3. Verificar SQL generado
cat prisma/migrations/*/agregar_telefono_usuario/migration.sql

# Debería contener:
# ALTER TABLE "User" ADD COLUMN "telefono" TEXT;

# 4. Probar localmente
npm run dev

# 5. Commit
git add prisma/
git commit -m "feat: agregar campo telefono a User"
git push origin main

# ==========================================
# PASO 2: Producción (Automático)
# ==========================================

# Rebuild de Docker con los nuevos cambios
docker-compose down
docker-compose up --build -d

# Las migraciones se aplican automáticamente en:
# PASO 3/4: Ejecutando migraciones de base de datos
# ✅ Migraciones aplicadas correctamente

# Verificar logs
docker-compose logs -f cuenty_mvp

# ==========================================
# PASO 3: Verificación
# ==========================================

# Verificar estado de migraciones
docker exec -it cuenty_mvp /bin/bash -c \
  "cd /app/nextjs_space && npm run migrate:status"

# Verificar en Prisma Studio (opcional)
npm run prisma:studio
```

---

## 🔗 Referencias Útiles

- [Documentación oficial de Prisma Migrate](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Guía de Deployment de Prisma](https://www.prisma.io/docs/guides/deployment/deploy-prisma-to-production)
- [Solución de problemas de migraciones](https://www.prisma.io/docs/guides/database/troubleshooting-orm)

---

## 📝 Resumen

- ✅ **Migraciones automáticas** en Docker usando `prisma migrate deploy`
- ✅ **Datos preservados** - NUNCA se resetean en producción
- ✅ **Scripts robustos** con reintentos y manejo de errores
- ✅ **Documentación completa** de cómo usar el sistema
- ✅ **Mejores prácticas** establecidas

**Comando más importante**: 
```bash
# En desarrollo (crear migración)
npm run migrate:create nombre_descriptivo

# En producción (aplicar migración) - AUTOMÁTICO en Docker
npm run migrate
```

---

**Última actualización**: Octubre 18, 2025  
**Versión del sistema**: CUENTY v1.0

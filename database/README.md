# Scripts SQL de Respaldo - CUENTY

Este directorio contiene scripts SQL generados automáticamente desde el schema de Prisma.

## 📁 Archivos

- `init-backend-tables.sql` - Script SQL para crear todas las tablas del backend manualmente

## 🚨 Cuándo usar estos scripts

Estos scripts son de **RESPALDO** y solo deben usarse si:

1. Las migraciones automáticas de Prisma fallan
2. Necesitas crear las tablas manualmente en una base de datos existente
3. Necesitas restaurar la estructura de la base de datos

## ⚠️ ADVERTENCIA

**NO ejecutes estos scripts si:**
- Ya tienes datos en la base de datos
- Las migraciones automáticas funcionan correctamente
- No estás seguro del estado actual de la base de datos

Estos scripts **CREARÁN** las tablas desde cero. Si ya existen, obtendrás errores.

## 🔧 Cómo usar

### Opción 1: Desde el contenedor de PostgreSQL

```bash
# Copiar el archivo SQL al contenedor de base de datos
docker cp database/init-backend-tables.sql <db-container-name>:/tmp/

# Ejecutar el script
docker exec -it <db-container-name> psql -U postgres -d cuenty-db -f /tmp/init-backend-tables.sql
```

### Opción 2: Desde psql local

```bash
psql postgresql://postgres:password@host:5432/cuenty-db -f database/init-backend-tables.sql
```

### Opción 3: Usar con el cliente psql

```bash
# Conectar a la base de datos
psql postgresql://postgres:51056d26ddf0ddbbc77a@cloudmx_cuenty-db:5432/cuenty-db

# Ejecutar el script
\i /path/to/init-backend-tables.sql
```

## 📝 Regenerar los scripts

Si necesitas regenerar estos scripts después de cambios en el schema de Prisma:

```bash
cd backend
npx prisma migrate diff --from-empty --to-schema-datamodel prisma/schema.prisma --script > ../database/init-backend-tables.sql
```

## 🎯 Recomendación

**SIEMPRE prefiere usar las migraciones automáticas de Prisma** que se ejecutan al iniciar el contenedor. Estos scripts SQL son solo un último recurso.

Para ejecutar migraciones manualmente:

```bash
# Desde el contenedor del backend
cd /app/backend
node scripts/migrate.js

# O directamente con Prisma CLI
npx prisma migrate deploy
```

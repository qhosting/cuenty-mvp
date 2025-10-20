# Sistema de Migraciones Automáticas de Prisma

## 📋 Descripción

El proyecto CUENTY está configurado para ejecutar **migraciones automáticas de Prisma** cada vez que se inicia el contenedor Docker. Esto asegura que la base de datos siempre esté actualizada con el esquema más reciente sin intervención manual.

## 🔄 Cómo Funciona

### 1. Al Iniciar el Contenedor

Cuando el contenedor Docker se inicia, el proceso es el siguiente:

```
1. Inicio del Backend
2. Verificación de que Backend está listo
3. ✨ EJECUCIÓN AUTOMÁTICA DE MIGRACIONES ✨
4. Inicio del Frontend
```

### 2. Proceso de Migración

Las migraciones se ejecutan mediante el script `start-docker.sh` en el **PASO 3**:

- ✅ Verifica que `DATABASE_URL` esté configurada
- ✅ Ejecuta el script `nextjs_space/scripts/migrate.js`
- ✅ Usa `prisma migrate deploy` (modo SEGURO - no elimina datos)
- ✅ Aplica solo migraciones pendientes
- ✅ Genera el Prisma Client si es necesario
- ✅ Manejo robusto de errores con reintentos

### 3. Modo Seguro

El sistema usa **`prisma migrate deploy`** en lugar de `prisma migrate dev`:

- ❌ **NO** resetea la base de datos
- ❌ **NO** elimina datos existentes
- ✅ **SOLO** aplica migraciones pendientes
- ✅ **SEGURO** para producción

## 🛠️ Archivos Involucrados

### 1. `Dockerfile`
```dockerfile
# Copia el directorio prisma/ con los archivos de migración
COPY --from=frontend-builder /app/frontend/prisma ./prisma

# Copia los scripts de migración
COPY --from=frontend-builder /app/frontend/scripts ./scripts
```

### 2. `start-docker.sh`
```bash
# PASO 3: Ejecutar migraciones de base de datos (AUTOMÁTICAS)
cd /app/nextjs_space
if node scripts/migrate.js; then
    echo "✅ Migraciones aplicadas correctamente"
fi
```

### 3. `nextjs_space/scripts/migrate.js`
Script Node.js que:
- Verifica la conexión a la base de datos
- Ejecuta `prisma migrate deploy`
- Genera el Prisma Client
- Reintentos automáticos (3 intentos)
- Logs detallados del proceso

## 📝 Scripts Disponibles en package.json

```json
{
  "scripts": {
    "migrate": "prisma migrate deploy",
    "migrate:dev": "prisma migrate dev",
    "migrate:create": "prisma migrate dev --name",
    "migrate:status": "prisma migrate status",
    "migrate:reset": "prisma migrate reset",
    "start:migrate": "node scripts/migrate.js && npm start"
  }
}
```

## 🚀 Crear Nueva Migración

### Desarrollo Local

```bash
cd nextjs_space
npm run migrate:create -- mi_nueva_migracion
```

Esto creará una nueva migración en `prisma/migrations/` con el nombre especificado.

### Aplicar en Producción

Las migraciones se aplican **automáticamente** al:
1. Hacer push del código con las nuevas migraciones
2. Reiniciar el contenedor Docker
3. El sistema detecta y aplica las migraciones pendientes

## ⚙️ Variables de Entorno Requeridas

```env
DATABASE_URL="postgresql://user:password@host:5432/database?schema=public"
```

Si `DATABASE_URL` no está configurada, las migraciones no se ejecutarán y se mostrará una advertencia.

## 🔍 Verificar Estado de Migraciones

### Dentro del contenedor:
```bash
docker exec -it <container_id> bash
cd /app/nextjs_space
npx prisma migrate status
```

### Logs de migraciones:
Los logs se encuentran en:
- `/app/logs/startup.log` - Log general del inicio
- Salida de consola durante el inicio del contenedor

## 🐛 Solución de Problemas

### Las migraciones no se aplican

1. **Verificar DATABASE_URL**:
   ```bash
   docker exec <container_id> printenv DATABASE_URL
   ```

2. **Verificar logs**:
   ```bash
   docker logs <container_id> | grep -A 20 "PASO 3"
   ```

3. **Ejecutar manualmente**:
   ```bash
   docker exec -it <container_id> bash
   cd /app/nextjs_space
   node scripts/migrate.js
   ```

### Error: "No pending migrations"

Esto **NO es un error**. Significa que todas las migraciones ya están aplicadas. ✅

### Error: "Database connection failed"

- Verificar que PostgreSQL esté accesible
- Verificar credenciales en `DATABASE_URL`
- Verificar red Docker si es necesario

## 📊 Ventajas del Sistema

✅ **Automático**: No requiere intervención manual
✅ **Seguro**: No elimina datos existentes
✅ **Robusto**: Manejo de errores y reintentos
✅ **Documentado**: Logs detallados del proceso
✅ **DevOps-friendly**: Perfecto para CI/CD
✅ **Zero-downtime**: Las migraciones se aplican antes de iniciar la app

## 🔒 Seguridad

- Las migraciones se ejecutan con `migrate deploy` (modo producción)
- No se exponen credenciales en los logs (se sanitizan)
- Reintentos automáticos evitan fallos por problemas temporales
- La aplicación solo inicia si las migraciones son exitosas

## 📚 Referencias

- [Prisma Migrate Deploy](https://www.prisma.io/docs/concepts/components/prisma-migrate/migrate-development-production#production-and-testing-environments)
- [Prisma Migrations](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

**Última actualización**: Octubre 2025
**Versión**: 1.0.0

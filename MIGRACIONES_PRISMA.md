# 🔄 Configuración de Migraciones de Prisma - CUENTY

## ✅ Estado Actual

Las migraciones de Prisma están **completamente configuradas** y se aplicarán **automáticamente** al desplegar con Docker.

---

## 📂 Migraciones Creadas

### 1️⃣ Migración Inicial: `20251018015515_init`
**Ubicación:** `nextjs_space/prisma/migrations/20251018015515_init/migration.sql`

**Crea las siguientes tablas:**
- ✅ `Account` - Cuentas de autenticación (NextAuth)
- ✅ `Session` - Sesiones de usuario (NextAuth)
- ✅ `User` - Usuarios de la plataforma
- ✅ `VerificationToken` - Tokens de verificación (NextAuth)
- ✅ `Product` - Productos/servicios de streaming
- ✅ `Order` - Órdenes de compra
- ✅ `ContactForm` - Formularios de contacto
- ✅ `SiteConfig` - Configuración del sitio

**Enums creados:**
- ✅ `OrderStatus` - Estados de órdenes (PENDING, PAID, PROCESSING, COMPLETED, CANCELLED, EXPIRED)

**Foreign Keys:**
- `Account.userId` → `User.id` (CASCADE)
- `Session.userId` → `User.id` (CASCADE)
- `Order.userId` → `User.id` (RESTRICT)
- `Order.productId` → `Product.id` (RESTRICT)

**Índices únicos:**
- `Account`: (provider, providerAccountId)
- `Session`: sessionToken
- `User`: email
- `VerificationToken`: token, (identifier, token)

---

### 2️⃣ Nueva Migración: `20251021000000_add_user_fields`
**Ubicación:** `nextjs_space/prisma/migrations/20251021000000_add_user_fields/migration.sql`

**Cambios realizados:**
1. ✅ Agrega campo `password` al modelo `User` (para autenticación por credenciales)
2. ✅ Agrega constraint `UNIQUE` al campo `phone` del modelo `User`

**SQL ejecutado:**
```sql
-- AlterTable: Add password field to User table
ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "password" TEXT;

-- CreateIndex: Add unique constraint to phone field
CREATE UNIQUE INDEX IF NOT EXISTS "User_phone_key" ON "User"("phone");
```

**Características de seguridad:**
- ✅ Usa `IF NOT EXISTS` para evitar errores si ya existe
- ✅ No elimina datos existentes
- ✅ Compatible con despliegues múltiples

---

## 🐳 Configuración de Docker

### Dockerfile
**Ubicación:** `Dockerfile`

El Dockerfile está configurado para:
1. ✅ Copiar el directorio `prisma/` con todas las migraciones
2. ✅ Copiar los scripts de migración en `scripts/`
3. ✅ Generar el Prisma Client durante el build
4. ✅ Dar permisos de ejecución a los scripts

**Líneas relevantes en el Dockerfile:**
```dockerfile
# Copiar el directorio prisma (necesario para el Cliente de Prisma y migraciones)
COPY --from=frontend-builder /app/frontend/prisma ./prisma

# Copiar scripts de migración (necesarios para migraciones automáticas en producción)
COPY --from=frontend-builder /app/frontend/scripts ./scripts
RUN chmod +x ./scripts/*.sh ./scripts/*.js 2>/dev/null || chmod +x ./scripts/*.js
```

---

### Script de Inicio: `start-docker.sh`
**Ubicación:** `start-docker.sh`

El script `start-docker.sh` ejecuta las migraciones **automáticamente** antes de iniciar la aplicación:

**Flujo de inicio:**
1. ✅ **Paso 1:** Inicia el Backend (Puerto 3000)
2. ✅ **Paso 2:** Espera a que el Backend esté disponible
3. ✅ **Paso 3:** 🔄 **EJECUTA MIGRACIONES AUTOMÁTICAS**
4. ✅ **Paso 4:** Inicia el Frontend (Puerto 3001)

**Código relevante en start-docker.sh:**
```bash
# PASO 3: Ejecutar migraciones de base de datos (AUTOMÁTICAS)
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║  PASO 3/4: Ejecutando migraciones automáticas de BD       ║"
echo "╚═══════════════════════════════════════════════════════════╝"

cd /app/nextjs_space

# Verificar que DATABASE_URL esté configurada
if [ -z "$DATABASE_URL" ]; then
    echo "⚠️  ADVERTENCIA: DATABASE_URL no está configurada"
else
    echo "✓ DATABASE_URL configurada"
    
    # Ejecutar migraciones (no falla si no hay migraciones pendientes)
    if node scripts/migrate.js; then
        echo "✅ Migraciones aplicadas correctamente"
    else
        echo "⚠️  ADVERTENCIA: Error al ejecutar migraciones"
    fi
fi
```

---

### Script de Migración: `migrate.js`
**Ubicación:** `nextjs_space/scripts/migrate.js`

**Características del script:**
- ✅ Usa `prisma migrate deploy` (SEGURO - no resetea datos)
- ✅ **NO** usa `prisma migrate dev` (que puede eliminar datos)
- ✅ Reintentos automáticos (3 intentos con 5 segundos de espera)
- ✅ Logs detallados del proceso
- ✅ Verifica que `DATABASE_URL` esté configurada
- ✅ Genera el Prisma Client después de las migraciones

**Comando ejecutado internamente:**
```bash
npx prisma migrate deploy
```

---

## 🔐 Variables de Entorno Requeridas

Para que las migraciones se ejecuten correctamente, es **necesario** configurar:

```bash
DATABASE_URL="postgresql://usuario:contraseña@host:puerto/database?sslmode=disable"
```

**Ejemplo (base de datos de producción):**
```bash
DATABASE_URL="postgresql://postgres:51056d26ddf0ddbbc77a@cloudmx_cuenty-db:5432/cuenty-db?sslmode=disable"
```

⚠️ **IMPORTANTE:** Esta variable debe estar configurada en Easypanel como variable de entorno del servicio.

---

## 📋 ¿Cómo Funciona en Producción?

Cuando despliegas en Docker (Easypanel):

1. 🔧 **Build:** El Dockerfile construye la imagen con todas las migraciones incluidas
2. 🚀 **Inicio:** El contenedor ejecuta `start-docker.sh`
3. 🔄 **Migraciones:** El script ejecuta `node scripts/migrate.js`
4. ✅ **Resultado:** Las migraciones pendientes se aplican automáticamente
5. 🎉 **Aplicación:** La aplicación inicia con la base de datos actualizada

**Proceso automático:**
```
Docker Build → Copiar migraciones → Iniciar contenedor → Ejecutar start-docker.sh
   → Iniciar Backend → ✅ APLICAR MIGRACIONES → Iniciar Frontend → App lista
```

---

## 🔍 Verificación en GitHub

Las migraciones **YA están versionadas** en GitHub:

```bash
$ git ls-tree -r HEAD --name-only | grep "prisma/migrations"
nextjs_space/prisma/migrations/20251018015515_init/migration.sql
nextjs_space/prisma/migrations/20251021000000_add_user_fields/migration.sql
nextjs_space/prisma/migrations/migration_lock.toml
```

✅ **Commit:** `feat: Agregar migración para campos adicionales del modelo User (password y phone unique)`

🔗 **Repositorio:** https://github.com/qhosting/cuenty-mvp

---

## ✅ .gitignore - Migraciones NO están ignoradas

El archivo `.gitignore` **NO** incluye `prisma/migrations/`, lo que significa que las migraciones se versionan correctamente en Git.

Líneas relevantes en `.gitignore`:
```gitignore
# Database
*.sqlite
*.sqlite3
*.db
```

✅ Las migraciones de Prisma están incluidas en el control de versiones.

---

## 📊 Resumen Final

| Aspecto | Estado | Detalles |
|---------|--------|----------|
| 📂 Migraciones creadas | ✅ | 2 migraciones (init + add_user_fields) |
| 🐙 Migraciones en GitHub | ✅ | Versionadas en `nextjs_space/prisma/migrations/` |
| 🐳 Dockerfile configurado | ✅ | Copia migraciones y scripts |
| 🚀 Script de inicio | ✅ | `start-docker.sh` ejecuta migraciones automáticamente |
| 🔧 Script de migración | ✅ | `migrate.js` usa `prisma migrate deploy` (seguro) |
| 📝 .gitignore | ✅ | Migraciones NO están ignoradas |
| 🔐 Variables de entorno | ⚠️ | Requiere `DATABASE_URL` en Easypanel |

---

## 🎯 Próximos Pasos

1. ✅ **Migraciones versionadas en GitHub** - ✅ COMPLETADO
2. ✅ **Dockerfile configurado** - ✅ COMPLETADO
3. ✅ **Scripts de migración listos** - ✅ COMPLETADO
4. 📦 **Desplegar en Easypanel** - Verificar que `DATABASE_URL` esté configurada
5. 🔍 **Verificar logs** - Confirmar que las migraciones se aplican correctamente al iniciar

---

## 🆘 Troubleshooting

### ❌ Error: "DATABASE_URL no está configurada"
**Solución:** Configurar la variable de entorno `DATABASE_URL` en Easypanel.

### ❌ Error: "No se pudieron aplicar migraciones"
**Posibles causas:**
1. Base de datos no está accesible
2. Credenciales incorrectas en `DATABASE_URL`
3. Problema de red entre el contenedor y la base de datos

**Solución:** Verificar logs del contenedor y conectividad de red.

### ❌ Error: "Prisma Client no está generado"
**Solución:** El Dockerfile ya incluye `npx prisma generate`. Verificar que el build se completó correctamente.

---

## 📞 Contacto

Para más información sobre la configuración de migraciones de Prisma:
- 📖 [Documentación oficial de Prisma](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- 🐙 [Repositorio CUENTY](https://github.com/qhosting/cuenty-mvp)

---

**Última actualización:** 21 de octubre de 2025
**Estado:** ✅ CONFIGURACIÓN COMPLETADA

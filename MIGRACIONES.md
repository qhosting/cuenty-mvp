# 🔄 Sistema de Migraciones Automáticas de Prisma

## 📋 Resumen

CUENTY MVP tiene configurado un **sistema de migraciones automáticas** que aplica cambios en la base de datos cada vez que se reconstruye el contenedor Docker. Este documento explica cómo funciona y cómo trabajar con él.

---

## ✅ ¿Qué ya está configurado?

### 1. **Migraciones en Git** ✅
- ✅ Las carpetas `backend/prisma/migrations/` y `nextjs_space/prisma/migrations/` **están en Git**
- ✅ NO están en `.gitignore`
- ✅ Actualmente hay:
  - **Backend**: 2 migraciones
  - **Frontend**: 2 migraciones

### 2. **Scripts de Migración Automática** ✅
- ✅ `backend/scripts/migrate.js` - Aplica migraciones del backend
- ✅ `nextjs_space/scripts/migrate.js` - Aplica migraciones del frontend
- ✅ Ambos usan `prisma migrate deploy` (modo seguro para producción)

### 3. **Integración en Docker** ✅
- ✅ El script `start-docker.sh` ejecuta automáticamente las migraciones en cada inicio
- ✅ Orden de ejecución:
  1. Verifica conectividad con PostgreSQL
  2. Aplica migraciones del BACKEND (crítico)
  3. Inicia el Backend
  4. Aplica migraciones del FRONTEND (automático)
  5. Inicia el Frontend

---

## 🔄 Flujo de Trabajo Completo

```
┌─────────────────────────────────────────────────────────────┐
│                  DESARROLLO LOCAL                            │
└─────────────────────────────────────────────────────────────┘
                         ↓
    1. Modificas schema.prisma (backend o frontend)
                         ↓
    2. Creas migración:
       cd backend  (o nextjs_space)
       npx prisma migrate dev --name nombre_descriptivo
                         ↓
    3. Se genera carpeta en prisma/migrations/
                         ↓
    4. Git add + commit + push
                         ↓
┌─────────────────────────────────────────────────────────────┐
│                  REPOSITORIO GITHUB                          │
└─────────────────────────────────────────────────────────────┘
                         ↓
    5. Pull / Clone en servidor
                         ↓
    6. Reconstruir contenedor Docker
                         ↓
┌─────────────────────────────────────────────────────────────┐
│              APLICACIÓN AUTOMÁTICA EN DOCKER                 │
└─────────────────────────────────────────────────────────────┘
                         ↓
    7. start-docker.sh ejecuta migrate.js
                         ↓
    8. prisma migrate deploy aplica solo las nuevas migraciones
                         ↓
    ✅ Base de datos actualizada automáticamente!
```

---

## 🛠️ Cómo Crear Nuevas Migraciones

### Opción 1: En Desarrollo (Recomendado)

#### Para Backend:
```bash
cd /home/ubuntu/cuenty_mvp/backend

# 1. Modificar prisma/schema.prisma
# 2. Crear migración
npx prisma migrate dev --name descripcion_del_cambio

# Ejemplo:
npx prisma migrate dev --name add_email_to_usuario
```

#### Para Frontend:
```bash
cd /home/ubuntu/cuenty_mvp/nextjs_space

# 1. Modificar prisma/schema.prisma
# 2. Crear migración
npx prisma migrate dev --name descripcion_del_cambio

# Ejemplo:
npx prisma migrate dev --name add_profile_picture
```

### Opción 2: Sin Base de Datos Local

Si NO tienes una base de datos local, puedes crear el archivo SQL manualmente:

```bash
# 1. Crear carpeta de migración
mkdir -p backend/prisma/migrations/$(date +%Y%m%d%H%M%S)_nombre_cambio

# 2. Crear migration.sql manualmente con tus cambios SQL
# 3. Luego en servidor con DB: npx prisma migrate resolve --applied nombre_migracion
```

---

## 📊 Comandos Útiles

### Ver estado de migraciones:
```bash
# Backend
cd backend
npx prisma migrate status

# Frontend
cd nextjs_space
npx prisma migrate status
```

### Ver historia de migraciones en Git:
```bash
git log --oneline -- backend/prisma/migrations/
git log --oneline -- nextjs_space/prisma/migrations/
```

### Listar migraciones disponibles:
```bash
# Backend
ls -la backend/prisma/migrations/

# Frontend
ls -la nextjs_space/prisma/migrations/
```

### Probar migraciones manualmente:
```bash
# Backend
cd backend
npx prisma migrate deploy

# Frontend
cd nextjs_space
npx prisma migrate deploy
```

---

## ⚠️ Diferencias Importantes

### `migrate dev` vs `migrate deploy`

| Comando | Uso | Comportamiento |
|---------|-----|----------------|
| `migrate dev` | **Desarrollo** | - Crea nuevas migraciones<br>- Puede RESETEAR la base de datos<br>- Regenera Prisma Client |
| `migrate deploy` | **Producción** | - SOLO aplica migraciones existentes<br>- NUNCA resetea la base de datos<br>- Seguro para producción |

**🚨 IMPORTANTE**: En producción (Docker) SIEMPRE usamos `migrate deploy` para no perder datos.

---

## 🔍 Verificación de Migraciones

El sistema de logging mejorado te mostrará:

```
📋 Total de migraciones encontradas en BACKEND: 2
   1. 20251021042116_init
   2. 20251021165212_add_password_to_usuario

🚀 Aplicando migraciones pendientes...
   → Esto solo aplicará las migraciones que NO estén en la base de datos
   → Si todas ya están aplicadas, no hará cambios

✅ Base de datos del BACKEND está al día - no hay migraciones pendientes
```

---

## 🐛 Solución de Problemas

### Problema: "2 migrations found pero no se aplican"

**Causa**: Las migraciones ya están aplicadas en la base de datos.

**Solución**: Esto es normal. `migrate deploy` solo aplica migraciones nuevas.

### Problema: "Migration failed"

**Causas comunes**:
1. Base de datos no accesible
2. Credenciales incorrectas
3. Migración SQL inválida

**Solución**:
```bash
# 1. Verificar conectividad
docker exec -it cuenty_container node /app/backend/scripts/migrate.js

# 2. Ver logs detallados
docker logs cuenty_container | grep -A 20 "migración"

# 3. Verificar DATABASE_URL
echo $DATABASE_URL
```

### Problema: "Schema drift detected"

**Causa**: El schema.prisma no coincide con la base de datos.

**Solución**:
```bash
# Opción 1: Crear nueva migración
npx prisma migrate dev --name fix_schema_drift

# Opción 2: Forzar resolución (CUIDADO)
npx prisma migrate resolve --applied nombre_migracion
```

---

## 📝 Mejores Prácticas

### ✅ DO (Hacer):
- ✅ Commitear las carpetas de migraciones a Git
- ✅ Usar nombres descriptivos para migraciones
- ✅ Probar migraciones en desarrollo antes de producción
- ✅ Hacer backup de la base de datos antes de cambios grandes
- ✅ Revisar el SQL generado antes de aplicar

### ❌ DON'T (No Hacer):
- ❌ Modificar migraciones ya aplicadas
- ❌ Borrar carpetas de migraciones antiguas
- ❌ Agregar prisma/migrations/ al .gitignore
- ❌ Usar `migrate dev` en producción
- ❌ Resetear la base de datos en producción

---

## 🔐 Seguridad y Backups

### Antes de aplicar migraciones grandes:

```bash
# 1. Backup de la base de datos
docker exec postgres_container pg_dump -U usuario cuenty_db > backup_$(date +%Y%m%d).sql

# 2. Probar migración
npx prisma migrate deploy --preview-feature

# 3. Aplicar migración
npx prisma migrate deploy

# 4. Verificar resultado
npx prisma migrate status
```

---

## 📞 Soporte

Si tienes problemas con las migraciones:

1. **Revisa logs**: `docker logs cuenty_container`
2. **Verifica status**: `npx prisma migrate status`
3. **Consulta docs**: https://www.prisma.io/docs/concepts/components/prisma-migrate

---

## 📚 Referencias

- [Prisma Migrate Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Prisma Deploy Docs](https://www.prisma.io/docs/reference/api-reference/command-reference#migrate-deploy)
- [Schema.prisma Reference](https://www.prisma.io/docs/reference/api-reference/prisma-schema-reference)

---

**Última actualización**: 23 de Octubre, 2025
**Versión**: 1.0.0

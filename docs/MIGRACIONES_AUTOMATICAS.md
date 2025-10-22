# 🔄 Sistema de Migraciones Automáticas de Prisma

## 📋 Descripción General

CUENTY MVP utiliza un sistema de migraciones automáticas que asegura que la base de datos PostgreSQL esté siempre sincronizada con los esquemas de Prisma en cada despliegue. Este proceso es completamente automático y seguro.

---

## 🎯 Objetivos del Sistema

1. **Automatización total**: Las migraciones se aplican automáticamente en cada despliegue
2. **Seguridad de datos**: Usa `prisma migrate deploy` que NUNCA elimina datos
3. **Idempotencia**: Puede ejecutarse múltiples veces sin problemas
4. **Visibilidad**: Logs detallados del proceso de migración
5. **Doble esquema**: Soporta esquemas independientes para backend y frontend

---

## 🏗️ Arquitectura del Sistema

### Componentes Principales

```
cuenty_mvp/
├── backend/
│   ├── prisma/
│   │   ├── schema.prisma           # Esquema de base de datos del backend
│   │   └── migrations/             # 📁 DEBE estar en Git
│   │       ├── 20251021042116_init/
│   │       ├── 20251021165212_add_password_to_usuario/
│   │       └── migration_lock.toml
│   └── scripts/
│       └── migrate.js              # Script de migración del backend
│
├── nextjs_space/
│   ├── prisma/
│   │   ├── schema.prisma           # Esquema de base de datos del frontend
│   │   └── migrations/             # 📁 DEBE estar en Git
│   │       ├── 20251018015515_init/
│   │       ├── 20251021000000_add_user_fields/
│   │       └── migration_lock.toml
│   └── scripts/
│       └── migrate.js              # Script de migración del frontend
│
└── start-docker.sh                 # Orquesta las migraciones al iniciar
```

---

## 🔁 Flujo de Trabajo: Desarrollo → Producción

### 1️⃣ En Desarrollo (Local)

#### Crear una nueva migración

```bash
# Para BACKEND
cd backend
npx prisma migrate dev --name descripcion_del_cambio

# Para FRONTEND
cd nextjs_space
npx prisma migrate dev --name descripcion_del_cambio
```

**¿Qué hace `migrate dev`?**
- Genera archivos SQL en `prisma/migrations/`
- Aplica la migración a tu base de datos local
- Actualiza el Prisma Client

**⚠️ IMPORTANTE**: `migrate dev` es SOLO para desarrollo. Puede resetear datos si hay conflictos.

---

### 2️⃣ Agregar Migraciones a Git

```bash
# Las migraciones DEBEN estar en Git para funcionar en producción
git add backend/prisma/migrations/
git add nextjs_space/prisma/migrations/
git commit -m "feat: agregar migración [descripción]"
git push origin main
```

**🚨 CRÍTICO**: Si las migraciones no están en Git, no se aplicarán en producción.

---

### 3️⃣ En Producción (Docker/Easypanel)

Cuando se despliega el proyecto en Docker:

1. **Docker construye la imagen** con las migraciones incluidas
2. **start-docker.sh se ejecuta** y hace lo siguiente:

```bash
# PASO 1: Esperar a que PostgreSQL esté listo
./wait-for-postgres.sh

# PASO 2: Ejecutar migraciones del BACKEND
node backend/scripts/migrate.js
# - Lista las migraciones disponibles
# - Ejecuta "prisma migrate deploy" (modo seguro)
# - Genera el Prisma Client

# PASO 3: Iniciar servidor backend

# PASO 4: Ejecutar migraciones del FRONTEND
node nextjs_space/scripts/migrate.js
# - Lista las migraciones disponibles
# - Ejecuta "prisma migrate deploy" (modo seguro)
# - Genera el Prisma Client

# PASO 5: Iniciar aplicación Next.js
```

---

## 🛡️ Seguridad y Modo de Operación

### `prisma migrate deploy` vs `prisma migrate dev`

| Característica | `migrate dev` (Desarrollo) | `migrate deploy` (Producción) |
|----------------|---------------------------|------------------------------|
| **Puede resetear datos** | ✅ SÍ | ❌ NO |
| **Genera migraciones** | ✅ SÍ | ❌ NO |
| **Aplica migraciones** | ✅ SÍ | ✅ SÍ |
| **Requiere confirmación** | ✅ SÍ | ❌ NO (automático) |
| **Modo** | Interactivo | No interactivo |
| **Uso** | Local | Producción/CI/CD |

### ✅ Por qué es Seguro

1. **Solo aplica migraciones existentes**: No crea ni modifica archivos
2. **Nunca resetea datos**: A diferencia de `migrate dev`
3. **Idempotente**: Si una migración ya fue aplicada, la salta
4. **Transaccional**: Si falla, hace rollback
5. **Reintentos**: Los scripts tienen lógica de reintento en caso de fallo temporal

---

## 📊 Logs y Monitoreo

### Qué información verás en los logs

```
============================================================
ℹ 🚀 Iniciando proceso de migración segura de Prisma - BACKEND
ℹ 📅 Fecha: 2025-10-22T10:30:00.000Z
============================================================

ℹ Verificando configuración de base de datos (BACKEND)...
✓ Base de datos configurada: postgresql://***:***@postgres:5432/cuenty

============================================================
ℹ 🔌 Asumiendo conectividad verificada por wait-for-postgres.sh
============================================================

ℹ Ejecutando migraciones del BACKEND (intento 1/3)...
⚠ Usando "prisma migrate deploy" - Modo SEGURO (no resetea datos)
ℹ 📋 Migraciones encontradas en BACKEND: 2
ℹ    1. 20251021042116_init
ℹ    2. 20251021165212_add_password_to_usuario

ℹ 🚀 Aplicando migraciones pendientes...

Prisma Migrate applied the following migration(s):

migrations/
  └─ 20251021165212_add_password_to_usuario/
      └─ migration.sql

✓ Migraciones del BACKEND aplicadas exitosamente

============================================================
ℹ Generando Prisma Client para el BACKEND...
✓ Prisma Client del BACKEND generado exitosamente

============================================================
✓ ✅ Proceso de migración del BACKEND completado exitosamente
ℹ ⏱️  Duración total: 3.45 segundos
✓ 🎉 El servidor backend puede iniciar de forma segura
============================================================
```

### Interpretación de los logs

- **`2 migrations found`**: Número total de migraciones en el directorio
- **`Prisma Migrate applied...`**: Migraciones que se aplicaron en esta ejecución
- **`No pending migrations`**: Todas las migraciones ya estaban aplicadas (normal)

---

## 🔧 Solución de Problemas

### Problema: "No se encontraron migraciones"

**Causa**: Las migraciones no están en Git o no se copiaron al contenedor Docker.

**Solución**:
```bash
# Verificar que las migraciones estén en Git
git ls-files backend/prisma/migrations/
git ls-files nextjs_space/prisma/migrations/

# Si no están, agregarlas
git add backend/prisma/migrations/
git add nextjs_space/prisma/migrations/
git commit -m "feat: agregar migraciones de Prisma"
git push
```

---

### Problema: "Error al ejecutar migraciones"

**Causa**: Problemas de conectividad con PostgreSQL o migraciones conflictivas.

**Solución**:
1. Verificar logs de PostgreSQL
2. Verificar que `DATABASE_URL` sea correcta
3. Verificar que las migraciones sean válidas:
   ```bash
   cd backend  # o nextjs_space
   npx prisma migrate status
   ```

---

### Problema: "Migration failed to apply cleanly"

**Causa**: La base de datos tiene cambios manuales que entran en conflicto.

**Solución**:
```bash
# En desarrollo, puedes resetear (CUIDADO: elimina datos)
npx prisma migrate reset

# En producción, necesitas resolver manualmente:
# 1. Revisar el SQL de la migración fallida
# 2. Aplicar cambios manualmente si es necesario
# 3. Marcar la migración como aplicada:
npx prisma migrate resolve --applied <migration_name>
```

---

## 📚 Ejemplos Prácticos

### Ejemplo 1: Agregar una nueva tabla

```bash
# 1. Modificar schema.prisma
# backend/prisma/schema.prisma
model NuevaTabla {
  id        Int      @id @default(autoincrement())
  nombre    String
  createdAt DateTime @default(now())
}

# 2. Crear migración
cd backend
npx prisma migrate dev --name agregar_nueva_tabla

# 3. Verificar que se creó
ls -la prisma/migrations/

# 4. Agregar a Git
git add prisma/migrations/
git commit -m "feat: agregar tabla NuevaTabla"
git push

# 5. En el próximo despliegue, la migración se aplicará automáticamente
```

---

### Ejemplo 2: Modificar una columna existente

```bash
# 1. Modificar schema.prisma
# Cambiar tipo de dato o agregar constraint
model Usuario {
  id       Int     @id @default(autoincrement())
  email    String  @unique  # ← Agregamos @unique
  password String
}

# 2. Crear migración
cd backend
npx prisma migrate dev --name agregar_unique_a_email

# 3. Git workflow
git add prisma/migrations/
git commit -m "feat: agregar constraint unique a email"
git push

# 4. La migración se aplicará automáticamente en producción
```

---

### Ejemplo 3: Verificar estado de migraciones

```bash
# Ver qué migraciones están aplicadas
cd backend  # o nextjs_space
npx prisma migrate status

# Salida esperada:
# Database schema is up to date!
# └─ 20251021042116_init
# └─ 20251021165212_add_password_to_usuario
```

---

## 🎓 Mejores Prácticas

### ✅ SÍ hacer

1. **Siempre crear migraciones con `migrate dev` en local**
   ```bash
   npx prisma migrate dev --name descripcion_clara
   ```

2. **Agregar migraciones a Git inmediatamente**
   ```bash
   git add prisma/migrations/
   git commit -m "feat: [descripción de la migración]"
   ```

3. **Usar nombres descriptivos**
   - ✅ `add_password_to_usuario`
   - ✅ `create_subscriptions_table`
   - ❌ `update1`, `fix`, `test`

4. **Probar localmente antes de hacer push**
   ```bash
   # Aplicar migración
   npx prisma migrate dev
   
   # Verificar que funciona
   npm run dev
   ```

5. **Revisar el SQL generado**
   ```bash
   cat prisma/migrations/[timestamp]_[name]/migration.sql
   ```

---

### ❌ NO hacer

1. **NO usar `migrate dev` en producción**
   - Puede resetear datos
   - Solo usar en desarrollo

2. **NO modificar migraciones ya aplicadas**
   - Una vez en Git y aplicada, es inmutable
   - Crear nueva migración en su lugar

3. **NO eliminar carpeta `migrations/`**
   - Prisma necesita el historial completo
   - Si se elimina, habrá conflictos

4. **NO hacer cambios manuales en la BD sin migración**
   - Crea inconsistencias
   - Usar siempre Prisma para cambios de esquema

5. **NO agregar `prisma/migrations/` a `.gitignore`**
   - Las migraciones DEBEN estar en Git

---

## 🔍 Comandos Útiles

```bash
# Ver estado de migraciones
npx prisma migrate status

# Ver historial de migraciones
ls -la prisma/migrations/

# Generar Prisma Client (sin migrar)
npx prisma generate

# Ver el esquema actual de la BD
npx prisma db pull

# Formatear schema.prisma
npx prisma format

# Validar schema.prisma
npx prisma validate

# Ver qué SQL se ejecutará (dry run)
npx prisma migrate diff \
  --from-schema-datamodel prisma/schema.prisma \
  --to-schema-datasource prisma/schema.prisma \
  --script
```

---

## 🌟 Resumen del Flujo

```
┌─────────────────────────────────────────────────────────────┐
│                    DESARROLLO LOCAL                          │
├─────────────────────────────────────────────────────────────┤
│  1. Modificar schema.prisma                                  │
│  2. npx prisma migrate dev --name descripcion                │
│  3. Probar la aplicación                                     │
│  4. git add + commit + push                                  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ git push
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                      GITHUB                                  │
├─────────────────────────────────────────────────────────────┤
│  • Código actualizado                                        │
│  • Migraciones incluidas en repo                             │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ deploy
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  DOCKER / EASYPANEL                          │
├─────────────────────────────────────────────────────────────┤
│  1. Construir imagen Docker                                  │
│  2. Iniciar contenedores                                     │
│  3. wait-for-postgres.sh                                     │
│  4. ✅ node backend/scripts/migrate.js                       │
│     • Lista migraciones                                      │
│     • Ejecuta "prisma migrate deploy"                        │
│     • Genera Prisma Client                                   │
│  5. Iniciar backend                                          │
│  6. ✅ node nextjs_space/scripts/migrate.js                  │
│     • Lista migraciones                                      │
│     • Ejecuta "prisma migrate deploy"                        │
│     • Genera Prisma Client                                   │
│  7. Iniciar frontend                                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📞 Soporte

Si encuentras problemas con las migraciones:

1. Revisar logs del contenedor Docker
2. Verificar que las migraciones estén en Git
3. Verificar conectividad con PostgreSQL
4. Consultar esta documentación
5. Revisar [documentación oficial de Prisma](https://www.prisma.io/docs/concepts/components/prisma-migrate)

---

## 📝 Notas Adicionales

- **Migraciones son inmutables**: Una vez aplicadas, no se deben modificar
- **Git es la fuente de verdad**: Solo las migraciones en Git se aplicarán
- **Cada entorno es independiente**: Las migraciones se aplican según lo que esté en la base de datos
- **Reintentos automáticos**: Los scripts reintentan hasta 3 veces en caso de fallo temporal
- **Zero-downtime**: Las migraciones se aplican antes de iniciar los servicios

---

**Última actualización**: 22 de octubre de 2025  
**Versión del documento**: 1.0.0

# 🚀 Guía Rápida: Migraciones de Prisma

## Comandos Esenciales

### Crear Nueva Migración (Desarrollo)
```bash
# Backend
cd backend
npx prisma migrate dev --name nombre_descriptivo

# Frontend
cd nextjs_space
npx prisma migrate dev --name nombre_descriptivo
```

### Agregar a Git (OBLIGATORIO)
```bash
git add backend/prisma/migrations/
git add nextjs_space/prisma/migrations/
git commit -m "feat: [descripción]"
git push
```

### Ver Estado
```bash
npx prisma migrate status
```

---

## Flujo de Trabajo en 4 Pasos

1. **Editar** `schema.prisma`
2. **Migrar** con `npx prisma migrate dev --name descripcion`
3. **Git** add + commit + push
4. **Deploy** automático aplicará las migraciones

---

## ⚠️ Reglas Críticas

- ✅ **SÍ**: Usar `migrate dev` en desarrollo
- ✅ **SÍ**: Agregar migraciones a Git SIEMPRE
- ✅ **SÍ**: Nombres descriptivos para migraciones
- ❌ **NO**: Usar `migrate dev` en producción
- ❌ **NO**: Modificar migraciones ya aplicadas
- ❌ **NO**: Agregar `migrations/` a `.gitignore`

---

## 🔍 Verificación

```bash
# ¿Las migraciones están en Git?
git ls-files backend/prisma/migrations/
git ls-files nextjs_space/prisma/migrations/

# ¿Están aplicadas en la BD?
npx prisma migrate status
```

---

## 🛠️ Solución Rápida

### No se aplican las migraciones en producción
```bash
# Verificar que estén en Git
git add prisma/migrations/
git commit -m "feat: agregar migraciones"
git push
```

### Error al migrar
```bash
# Ver estado
npx prisma migrate status

# Ver logs del contenedor
docker logs <container_name>
```

---

## 📚 Documentación Completa

Para información detallada, consulta: [`MIGRACIONES_AUTOMATICAS.md`](./MIGRACIONES_AUTOMATICAS.md)

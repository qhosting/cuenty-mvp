# 📝 Documentación del Script seed-users.js

## ✅ Tarea Completada

Se ha creado exitosamente el archivo `scripts/seed-users.js` para crear usuarios administradores iniciales en la base de datos de CUENTY.

---

## 📋 Resumen de Cambios

### Archivo Creado
- **Ubicación**: `/home/ubuntu/cuenty_mvp/scripts/seed-users.js`
- **Permisos**: Ejecutable (`chmod +x`)
- **Estado Git**: ✅ Committed y pushed a GitHub

### Commit Details
- **Commit Hash**: `6cf5715`
- **Branch**: `main`
- **Repositorio**: `https://github.com/qhosting/cuenty-mvp.git`

---

## 🎯 Funcionalidad del Script

El script `seed-users.js` proporciona las siguientes funcionalidades:

### 1. ✅ Usa Prisma Client
- Importa y utiliza Prisma Client desde `nextjs_space/node_modules/.prisma/client`
- Se conecta a PostgreSQL usando la configuración de `DATABASE_URL`

### 2. 🔒 Hashea Contraseñas con bcrypt
- Utiliza `bcryptjs` para hashear contraseñas de forma segura
- Usa 10 salt rounds para el hashing

### 3. 👥 Usuarios Administradores por Defecto
El script incluye dos usuarios administradores iniciales:

**Usuario 1:**
- Nombre: Administrador CUENTY
- Email: admin@cuenty.com
- Teléfono: +5215512345678
- Contraseña: CuentyAdmin2025! (⚠️ CAMBIAR EN PRODUCCIÓN)

**Usuario 2:**
- Nombre: Super Admin
- Email: superadmin@cuenty.com
- Teléfono: +5215587654321
- Contraseña: SuperCuenty2025! (⚠️ CAMBIAR EN PRODUCCIÓN)

### 4. 🛡️ Manejo de Errores
- ✅ Verifica si los usuarios ya existen (por email o teléfono)
- ✅ Evita crear usuarios duplicados
- ✅ Proporciona mensajes de error claros y descriptivos
- ✅ Verifica que DATABASE_URL esté configurada
- ✅ Cierra conexión con Prisma al finalizar

### 5. 🔄 Actualización de Contraseñas
- Soporta actualización de contraseñas de usuarios existentes
- Se activa con la variable de entorno: `UPDATE_EXISTING_PASSWORDS=true`

---

## 🚀 Cómo Usar el Script

### Ejecución Básica
```bash
# Desde el directorio raíz del proyecto
node scripts/seed-users.js
```

### Actualizar Contraseñas de Usuarios Existentes
```bash
UPDATE_EXISTING_PASSWORDS=true node scripts/seed-users.js
```

### Requisitos Previos
1. ✅ Base de datos PostgreSQL configurada
2. ✅ Variable `DATABASE_URL` en archivo `.env`
3. ✅ Dependencias instaladas en `nextjs_space`:
   - `@prisma/client@6.7.0`
   - `bcryptjs@2.4.3`

---

## 📦 Salida del Script

El script proporciona salida detallada:

```
🚀 Iniciando script de seed de usuarios...
📦 Base de datos: Configurada

👥 Creando usuarios administradores...

✅ Usuario creado exitosamente: admin@cuenty.com
   ID: cuid_generated_id
   Nombre: Administrador CUENTY
   Teléfono: +5215512345678

📊 Resumen de operaciones:
   ✅ Usuarios procesados: 2
   ❌ Errores: 0

📝 Credenciales de acceso:
   IMPORTANTE: Cambia estas contraseñas en producción
   ...

✅ Script completado exitosamente!
```

---

## ⚠️ Notas Importantes

### 1. Campo "role" o "isAdmin" No Existe
El schema actual de Prisma **NO** incluye un campo para distinguir entre usuarios normales y administradores.

**Recomendación**: Si necesitas diferenciar roles de usuario, considera:

```prisma
model User {
  // ... campos existentes ...
  role      String   @default("USER") // USER, ADMIN, SUPERADMIN
  // o
  isAdmin   Boolean  @default(false)
}
```

Luego ejecuta:
```bash
cd nextjs_space
npx prisma migrate dev --name add_user_role
```

### 2. Seguridad de Contraseñas
⚠️ **IMPORTANTE**: Las contraseñas por defecto son solo para desarrollo.
**DEBES** cambiarlas en producción.

### 3. Verificación de Email
El script marca automáticamente `emailVerified` como la fecha actual para usuarios creados, permitiéndoles acceso inmediato.

---

## 🔍 Verificación en GitHub

El archivo debería estar visible en:
- **Repositorio**: https://github.com/qhosting/cuenty-mvp
- **Ruta**: `scripts/seed-users.js`
- **Branch**: `main`

Para verificar:
1. Visita el repositorio en GitHub
2. Navega a la carpeta `scripts/`
3. Verifica que `seed-users.js` esté presente

---

## 🧪 Testing del Script

### Verificación de Sintaxis
```bash
node -c scripts/seed-users.js
# Debe mostrar: ✅ Sintaxis del script es válida
```

### Verificar Dependencias
```bash
cd nextjs_space
npm list bcryptjs @prisma/client --depth=0
```

---

## 🎓 Próximos Pasos Recomendados

1. **Agregar campo de rol al schema** (si es necesario):
   ```bash
   cd nextjs_space
   # Editar prisma/schema.prisma
   npx prisma migrate dev --name add_user_role
   ```

2. **Personalizar usuarios iniciales**:
   - Edita el array `DEFAULT_ADMIN_USERS` en el script
   - Cambia nombres, emails, teléfonos y contraseñas

3. **Ejecutar el script**:
   ```bash
   node scripts/seed-users.js
   ```

4. **Verificar usuarios creados**:
   ```bash
   cd nextjs_space
   npx prisma studio
   ```

5. **Actualizar NextAuth** para verificar roles (si agregaste el campo role):
   - Modifica `nextjs_space/lib/auth.ts`
   - Agrega validación de roles en el callback `authorize`

---

## 📊 Estructura del Código

```javascript
// Componentes principales del script:
- hashPassword()         → Hashea contraseñas con bcrypt
- createOrUpdateUser()   → Crea o actualiza usuarios
- main()                 → Función principal
- DEFAULT_ADMIN_USERS    → Array de usuarios por defecto
```

---

## ✅ Checklist de Implementación

- [x] Script creado en `scripts/seed-users.js`
- [x] Usa Prisma Client para interactuar con DB
- [x] Usa bcrypt para hashear contraseñas
- [x] Incluye usuarios administradores por defecto
- [x] Maneja errores apropiadamente
- [x] Puede ejecutarse con: `node scripts/seed-users.js`
- [x] Archivo committed en Git
- [x] Archivo pushed a GitHub
- [x] Permisos de ejecución configurados

---

## 🆘 Troubleshooting

### Error: "DATABASE_URL no está configurada"
**Solución**: Verifica que el archivo `.env` en la raíz tenga:
```
DATABASE_URL="postgresql://user:password@localhost:5432/cuenty"
```

### Error: "Cannot find module '@prisma/client'"
**Solución**: 
```bash
cd nextjs_space
npm install
npx prisma generate
```

### Error: "Usuario ya existe"
**Comportamiento**: Es normal, el script detecta y notifica usuarios existentes.
**Actualizar contraseña**: Usa `UPDATE_EXISTING_PASSWORDS=true`

---

**Fecha de creación**: October 20, 2025
**Autor**: DeepAgent (Abacus.AI)
**Versión del proyecto**: 1.0.1

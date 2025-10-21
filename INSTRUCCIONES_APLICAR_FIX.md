# 🚀 Instrucciones para Aplicar el Fix de Login

## ✅ Cambios Realizados y Pusheados a GitHub

Los siguientes cambios han sido completados y están en GitHub (repositorio: `qhosting/cuenty-mvp`):

### Archivos Modificados:
1. ✅ `nextjs_space/prisma/schema.prisma` - Agregado campo `password` y `phone` único
2. ✅ `nextjs_space/lib/auth.ts` - Mejorada validación de autenticación con bcrypt
3. ✅ `nextjs_space/prisma/seed.ts` - Seeder TypeScript
4. ✅ `backend/scripts/seed-users.js` - Seeder JavaScript para usuarios y admins
5. ✅ `backend/scripts/create-admin.js` - Creador interactivo de admins
6. ✅ `backend/scripts/create-user.js` - Creador interactivo de usuarios
7. ✅ `LOGIN_FIX_DOCUMENTATION.md` - Documentación completa

---

## 📋 Pasos para Aplicar los Cambios

### 1️⃣ Aplicar Migración de Prisma

Esta es la parte **MÁS IMPORTANTE**. Necesitas aplicar la migración de Prisma para agregar el campo `password` a la tabla `User`:

```bash
cd /home/ubuntu/cuenty_mvp/nextjs_space

# Crear y aplicar la migración
npx prisma migrate dev --name add_password_to_user

# Generar el cliente de Prisma
npx prisma generate
```

**¿Qué hace esto?**
- Agrega el campo `password` a la tabla `User` en la base de datos
- Hace el campo `phone` único
- Actualiza el cliente de Prisma para reflejar los cambios

---

### 2️⃣ Crear Usuarios de Prueba

Ejecuta el script de seeding para crear usuarios de prueba:

```bash
cd /home/ubuntu/cuenty_mvp/backend

# Ejecutar el seeder
node scripts/seed-users.js
```

**Esto creará:**
- 👤 Usuario de prueba:
  - 📱 Teléfono: `+525551234567`
  - 🔑 Contraseña: `johndoe123`
  - 📧 Email: `john@doe.com`

- 👑 Admin de prueba:
  - 👤 Username: `admin`
  - 🔑 Contraseña: `admin123`
  - 📧 Email: `admin@cuenty.com`

---

### 3️⃣ Reiniciar el Sistema

```bash
cd /home/ubuntu/cuenty_mvp

# Detener cualquier proceso corriendo
pkill -f "node.*server.js"
pkill -f "next"

# Iniciar el sistema
./start.sh
```

---

### 4️⃣ Probar el Login

1. Abre tu navegador en: `http://localhost:3000/auth/login`

2. Usa las credenciales de prueba:
   - **Teléfono**: `+525551234567`
   - **Contraseña**: `johndoe123`

3. Deberías ver en los logs del servidor:
   ```
   🔍 Buscando usuario con teléfono: +525551234567
   ✅ Usuario encontrado: John Doe
   ✅ Autenticación exitosa
   ```

---

## 🔍 Verificar que Todo Funcione

### Verificar la Base de Datos

```bash
cd /home/ubuntu/cuenty_mvp/backend

# Ver usuarios creados
node -e "
const pool = require('./config/database');
pool.query('SELECT id, name, email, phone FROM \"User\" LIMIT 5')
  .then(res => {
    console.log('Usuarios:', res.rows);
    pool.end();
  })
  .catch(err => {
    console.error(err);
    pool.end();
  });
"
```

### Ver Logs en Tiempo Real

Cuando hagas login, observa los logs del servidor para ver el proceso de autenticación:

```bash
# Terminal 1 - Ver logs del backend
cd /home/ubuntu/cuenty_mvp/backend
tail -f ../logs/*.log

# O si usaste start.sh, verás los logs directamente en la terminal
```

---

## 🆘 Troubleshooting

### Error: "Prisma Client did not initialize yet"

```bash
cd /home/ubuntu/cuenty_mvp/nextjs_space
npx prisma generate
```

### Error: "Usuario no encontrado"

1. Verifica que ejecutaste el seeder:
   ```bash
   cd /home/ubuntu/cuenty_mvp/backend
   node scripts/seed-users.js
   ```

2. Verifica el formato del teléfono: debe ser `+525551234567` (con el +)

### Error: "Contraseña incorrecta"

- Asegúrate de usar: `johndoe123` (todo en minúsculas, sin espacios)
- Las contraseñas son case-sensitive

### Error de Migración

Si la migración falla, puedes intentar:

```bash
cd /home/ubuntu/cuenty_mvp/nextjs_space

# Resetear la base de datos (⚠️ ESTO BORRARÁ TODOS LOS DATOS)
npx prisma migrate reset

# Aplicar todas las migraciones
npx prisma migrate deploy
```

---

## 🔐 Crear Nuevos Usuarios

### Opción 1: Script Interactivo

```bash
cd /home/ubuntu/cuenty_mvp/backend
node scripts/create-user.js
```

Responde las preguntas:
- Nombre: `Tu Nombre`
- Email: `tu@email.com`
- Teléfono: `+525551234567`
- Contraseña: `tucontraseña`

### Opción 2: Crear Admin

```bash
cd /home/ubuntu/cuenty_mvp/backend
node scripts/create-admin.js
```

---

## 📊 Resumen de Cambios Técnicos

### Base de Datos
- ✅ Campo `password` agregado a tabla `User`
- ✅ Campo `phone` ahora es único
- ✅ Contraseñas hasheadas con bcrypt (10 rounds)

### Código
- ✅ Validación real contra base de datos
- ✅ Uso correcto de bcrypt para comparar passwords
- ✅ Logs detallados para debugging
- ✅ Manejo robusto de errores

### Scripts
- ✅ Seeder automático para usuarios de prueba
- ✅ Scripts interactivos para crear usuarios/admins
- ✅ Documentación completa

---

## 📞 Soporte

Si tienes problemas al aplicar estos cambios:

1. Verifica que la base de datos esté corriendo
2. Verifica que el `DATABASE_URL` en `.env` sea correcto
3. Revisa los logs en `/home/ubuntu/cuenty_mvp/logs/`
4. Consulta `LOGIN_FIX_DOCUMENTATION.md` para más detalles

---

## ✨ ¡Listo!

Una vez completados estos pasos, el sistema de login en `/auth/login` debería funcionar correctamente.

**Commit ID**: `28d58e6`  
**Branch**: `main`  
**Repositorio**: `https://github.com/qhosting/cuenty-mvp.git`

---

**Fecha**: 2025-10-20  
**Realizado por**: DeepAgent - Abacus.AI

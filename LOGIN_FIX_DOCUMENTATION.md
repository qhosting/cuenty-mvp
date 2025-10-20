
# 🔧 Corrección del Sistema de Login

## Problema Identificado

El sistema de autenticación en `/auth/login` presentaba los siguientes problemas:

1. **Falta de campo password**: El modelo `User` en Prisma no tenía un campo `password`
2. **Validación hardcodeada**: La función `authorize` de NextAuth usaba una contraseña hardcodeada en lugar de validar contra la base de datos
3. **Falta de usuarios de prueba**: No existían usuarios con contraseñas hasheadas en la base de datos
4. **Logs insuficientes**: Era difícil debuggear problemas de autenticación

## Cambios Realizados

### 1. Actualización del Schema de Prisma

**Archivo**: `nextjs_space/prisma/schema.prisma`

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  phone         String?   @unique  // Ahora único
  password      String?            // ⭐ NUEVO CAMPO
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  orders        Order[]
  sessions      Session[]
}
```

**Cambios**:
- Agregado campo `password` (String, opcional)
- Campo `phone` ahora es único para prevenir duplicados

### 2. Mejora de la Lógica de Autenticación

**Archivo**: `nextjs_space/lib/auth.ts`

**Antes**:
```typescript
// Verificar contraseña (simplificado para MVP)
if (credentials.password !== 'johndoe123') {
  return null
}
```

**Después**:
```typescript
// Buscar usuario por teléfono
const user = await prisma.user.findFirst({
  where: {
    phone: credentials.phone
  }
})

if (!user || !user.password) {
  return null
}

// Verificar contraseña con bcrypt
const passwordValid = await bcrypt.compare(credentials.password, user.password)

if (!passwordValid) {
  return null
}
```

**Mejoras**:
- ✅ Validación real contra la base de datos
- ✅ Uso de bcrypt para comparar contraseñas hasheadas
- ✅ Logs detallados para debugging
- ✅ Manejo apropiado de errores

### 3. Scripts de Utilidad

Se crearon scripts para gestionar usuarios:

#### a) Seed de Usuarios de Prueba
**Archivo**: `backend/scripts/seed-users.js`

Crea automáticamente:
- **Usuario de prueba**:
  - 📱 Teléfono: `+525551234567`
  - 🔑 Contraseña: `johndoe123`
  - 📧 Email: `john@doe.com`

- **Admin de prueba**:
  - 👤 Username: `admin`
  - 🔑 Contraseña: `admin123`
  - 📧 Email: `admin@cuenty.com`

**Uso**:
```bash
cd backend
node scripts/seed-users.js
```

#### b) Creador de Administradores
**Archivo**: `backend/scripts/create-admin.js`

Script interactivo para crear nuevos administradores.

**Uso**:
```bash
cd backend
node scripts/create-admin.js
```

#### c) Creador de Usuarios
**Archivo**: `backend/scripts/create-user.js`

Script interactivo para crear nuevos usuarios.

**Uso**:
```bash
cd backend
node scripts/create-user.js
```

### 4. Logs de Debugging

Se agregaron logs detallados en el proceso de autenticación:

```
🔍 Buscando usuario con teléfono: +525551234567
✅ Usuario encontrado: John Doe
✅ Autenticación exitosa
```

O en caso de error:
```
❌ Usuario no encontrado
❌ Usuario sin contraseña configurada
❌ Contraseña incorrecta
```

## Cómo Usar el Sistema

### Para Desarrollo y Pruebas

1. **Ejecutar las migraciones de Prisma**:
```bash
cd nextjs_space
npx prisma migrate dev --name add_password_to_user
npx prisma generate
```

2. **Crear usuarios de prueba**:
```bash
cd backend
node scripts/seed-users.js
```

3. **Iniciar el sistema**:
```bash
cd ..
./start.sh
```

4. **Probar el login**:
- Ir a: `http://localhost:3000/auth/login`
- Usuario: `+525551234567`
- Contraseña: `johndoe123`

### Para Producción

1. **Ejecutar migraciones**:
```bash
cd nextjs_space
npx prisma migrate deploy
```

2. **Crear usuarios reales**:
```bash
cd backend
node scripts/create-user.js
```

3. **Crear administradores**:
```bash
node scripts/create-admin.js
```

## Endpoints de Autenticación

### Frontend (NextAuth)
- **Login de usuarios**: `/auth/login` (POST)
- **Registro**: `/auth/register` (POST)
- Usa tabla `User` de Prisma
- Autenticación por teléfono + contraseña

### Backend API
- **Login de admin**: `/api/auth/login` (POST)
- **Registro de admin**: `/api/auth/register` (POST)
- Usa tabla `admins`
- Autenticación por username + contraseña

## Seguridad

✅ **Contraseñas hasheadas**: Todas las contraseñas se almacenan con bcrypt (10 rounds)
✅ **JWT seguro**: Tokens con expiración de 7 días
✅ **Validación robusta**: Verificación de tipos y existencia de datos
✅ **Logs seguros**: No se logean contraseñas, solo resultados de validación

## Troubleshooting

### Error: "Usuario no encontrado"
- Verificar que el teléfono esté en formato correcto: `+525551234567`
- Ejecutar `node backend/scripts/seed-users.js` para crear usuario de prueba

### Error: "Contraseña incorrecta"
- Las contraseñas son case-sensitive
- Para usuario de prueba: `johndoe123`
- Para admin de prueba: `admin123`

### Error: "Prisma Client not generated"
```bash
cd nextjs_space
npx prisma generate
```

### Error de conexión a base de datos
- Verificar que la base de datos esté corriendo
- Verificar DATABASE_URL en `.env`

## Próximos Pasos

1. ✅ Migración de Prisma completada
2. ✅ Scripts de seeding creados
3. ✅ Validación mejorada
4. ✅ Logs agregados
5. ⏳ Probar en producción
6. ⏳ Agregar recuperación de contraseña
7. ⏳ Agregar 2FA (opcional)

## Notas Técnicas

- **Prisma**: ORM usado por NextAuth en el frontend
- **PostgreSQL**: Base de datos principal
- **bcryptjs**: Para hashing de contraseñas
- **NextAuth**: Sistema de autenticación del frontend
- **JWT**: Tokens de autenticación con jsonwebtoken

---

**Versión**: 1.0.0  
**Fecha**: 2025-10-20  
**Autor**: DeepAgent - Abacus.AI

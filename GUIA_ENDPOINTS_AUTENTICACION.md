# 📚 Guía de Endpoints de Autenticación y Registro - CUENTY MVP

## Versión del Backend: 1.0.4
**Fecha de última actualización:** 21 de Octubre, 2025

---

## 📋 Tabla de Contenidos

1. [Resumen de Cambios](#resumen-de-cambios)
2. [Arquitectura de Autenticación](#arquitectura-de-autenticación)
3. [Endpoints Disponibles](#endpoints-disponibles)
4. [Modelos de Base de Datos](#modelos-de-base-de-datos)
5. [Ejemplos de Uso](#ejemplos-de-uso)
6. [Errores Comunes y Soluciones](#errores-comunes-y-soluciones)
7. [Migraciones de Base de Datos](#migraciones-de-base-de-datos)

---

## 🔄 Resumen de Cambios

### Problema Identificado
El endpoint `/api/signup` tenía un error crítico:
- ❌ **NO estaba guardando la contraseña** del usuario
- ❌ Importaba `bcrypt` pero nunca lo utilizaba
- ❌ No validaba correctamente los datos de entrada
- ❌ Usaba el modelo incorrecto de Prisma (`user` en lugar de `usuario`)

### Soluciones Implementadas
- ✅ Agregado campo `password` al modelo `Usuario` en el schema de Prisma
- ✅ Implementado hash de contraseñas con bcrypt (10 rounds)
- ✅ Agregadas validaciones completas para todos los campos
- ✅ Corregido NextAuth para usar el modelo `Usuario` correctamente
- ✅ Creada migración de base de datos
- ✅ Incrementada versión del backend a 1.0.4

---

## 🏗️ Arquitectura de Autenticación

### Dos Tipos de Usuarios

```
┌─────────────────────────────────────────────────────────┐
│                   CUENTY MVP - Auth                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌─────────────────────┐    ┌──────────────────────┐   │
│  │   USUARIOS          │    │   ADMINISTRADORES    │   │
│  │   (Usuario model)   │    │   (Admin model)      │   │
│  ├─────────────────────┤    ├──────────────────────┤   │
│  │ PK: celular         │    │ PK: id (autoincr)    │   │
│  │ - nombre            │    │ - username           │   │
│  │ - email             │    │ - password           │   │
│  │ - password ✨NEW    │    │ - email              │   │
│  │ - verificado        │    │                      │   │
│  └─────────────────────┘    └──────────────────────┘   │
│           │                           │                 │
│           ▼                           ▼                 │
│  /api/signup (Next.js)      /auth/register (Express)   │
│  /api/auth/[...nextauth]    /auth/login (Express)      │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## 🔌 Endpoints Disponibles

### 1. `/api/signup` - Registro de Usuarios Normales

**Descripción:** Endpoint de Next.js API Route para registrar usuarios normales del sistema.

**Método:** `POST`

**URL:** `https://tudominio.com/api/signup`

**Headers:**
```http
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "name": "Juan Pérez",
  "email": "juan.perez@example.com",
  "phone": "+52 55 1234 5678",
  "password": "miPassword123"
}
```

**Validaciones:**
- `name`: Requerido, mínimo 2 caracteres, máximo 100 caracteres
- `email`: Requerido, formato de email válido, máximo 100 caracteres
- `phone`: Requerido, entre 10 y 15 dígitos (se limpia automáticamente)
- `password`: Requerido, mínimo 6 caracteres, máximo 100 caracteres

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Usuario creado exitosamente",
  "user": {
    "celular": "+5255123456788",
    "nombre": "Juan Pérez",
    "email": "juan.perez@example.com",
    "verificado": false,
    "fechaCreacion": "2025-10-21T16:52:12.000Z"
  }
}
```

**Errores Posibles:**
```json
// 400 - Campo faltante
{
  "error": "Nombre es requerido"
}

// 400 - Email inválido
{
  "error": "Formato de email inválido"
}

// 400 - Teléfono inválido
{
  "error": "Teléfono debe tener entre 10 y 15 dígitos"
}

// 400 - Contraseña corta
{
  "error": "Password debe tener al menos 6 caracteres"
}

// 400 - Usuario ya existe
{
  "error": "El usuario ya existe con este email o teléfono"
}

// 500 - Error del servidor
{
  "error": "Error al crear el usuario",
  "details": "Mensaje de error (solo en desarrollo)"
}
```

---

### 2. `/auth/register` - Registro de Administradores

**Descripción:** Endpoint de Express (Backend) para registrar administradores del sistema.

**Método:** `POST`

**URL:** `http://backend-url:3001/auth/register`

**Headers:**
```http
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "admin_user",
  "password": "securePassword123",
  "email": "admin@cuenty.com"
}
```

**Validaciones:**
- `username`: Requerido, 3-50 caracteres, solo letras, números, guiones y guiones bajos
- `password`: Requerido, mínimo 6 caracteres, máximo 100 caracteres
- `email`: Opcional, formato de email válido si se proporciona, máximo 100 caracteres

**Respuesta Exitosa (201):**
```json
{
  "success": true,
  "message": "Administrador creado exitosamente",
  "data": {
    "id": 1,
    "username": "admin_user",
    "email": "admin@cuenty.com",
    "fechaCreacion": "2025-10-21T16:52:12.000Z"
  }
}
```

**Errores Posibles:**
```json
// 400 - Username inválido
{
  "success": false,
  "error": "Username debe tener entre 3 y 50 caracteres"
}

// 400 - Password corto
{
  "success": false,
  "error": "Password debe tener al menos 6 caracteres"
}

// 400 - Email inválido
{
  "success": false,
  "error": "Formato de email inválido"
}

// 400 - Usuario ya existe
{
  "success": false,
  "error": "El usuario ya existe"
}

// 500 - Error del servidor
{
  "success": false,
  "error": "Error al registrar administrador",
  "details": "Mensaje de error (solo en desarrollo)"
}
```

---

### 3. `/api/auth/[...nextauth]` - Login de Usuarios (NextAuth)

**Descripción:** Endpoint de NextAuth para autenticar usuarios normales.

**Método:** Se usa a través de la librería `next-auth` en el cliente

**Uso con next-auth:**
```typescript
import { signIn } from 'next-auth/react'

// Login con teléfono
const result = await signIn('credentials', {
  phone: '+5255123456788',
  password: 'miPassword123',
  redirect: false
})

// O login con email
const result = await signIn('credentials', {
  email: 'juan.perez@example.com',
  password: 'miPassword123',
  redirect: false
})
```

**Respuesta Exitosa:**
```javascript
{
  error: null,
  status: 200,
  ok: true,
  url: null
}
```

**Errores Posibles:**
```javascript
{
  error: "Usuario no encontrado",
  status: 401,
  ok: false,
  url: null
}

{
  error: "Contraseña incorrecta",
  status: 401,
  ok: false,
  url: null
}
```

---

### 4. `/auth/login` - Login de Administradores

**Descripción:** Endpoint de Express (Backend) para autenticar administradores.

**Método:** `POST`

**URL:** `http://backend-url:3001/auth/login`

**Headers:**
```http
Content-Type: application/json
```

**Body (JSON):**
```json
{
  "username": "admin_user",
  "password": "securePassword123"
}
```

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin_user",
      "email": "admin@cuenty.com"
    }
  }
}
```

**Errores Posibles:**
```json
// 400 - Campos faltantes
{
  "success": false,
  "error": "Username es requerido"
}

// 401 - Credenciales inválidas
{
  "success": false,
  "error": "Credenciales inválidas"
}

// 500 - Error del servidor
{
  "success": false,
  "error": "Error al iniciar sesión",
  "details": "Mensaje de error (solo en desarrollo)"
}
```

---

## 🗄️ Modelos de Base de Datos

### Modelo `Usuario` (Tabla: `usuarios`)

```prisma
model Usuario {
  celular                 String         @id @db.VarChar(15)
  nombre                  String?        @db.VarChar(100)
  email                   String?        @db.VarChar(100)
  password                String?        @db.VarChar(255)  // ✨ NUEVO
  verificado              Boolean        @default(false)
  metodoEntregaPreferido  String         @default("whatsapp") @map("metodo_entrega_preferido") @db.VarChar(20)
  fechaCreacion           DateTime       @default(now()) @map("fecha_creacion")
  ultimoAcceso            DateTime?      @map("ultimo_acceso")
  
  // Relations
  ordenes                 Orden[]
  shoppingCart            ShoppingCart[]
  tickets                 Ticket[]

  @@map("usuarios")
}
```

**Campos clave:**
- `celular` (PK): Número de teléfono del usuario (limpio, sin espacios ni caracteres especiales)
- `password`: Contraseña hasheada con bcrypt (10 rounds) - **NULLABLE** para compatibilidad con usuarios existentes

---

### Modelo `Admin` (Tabla: `admins`)

```prisma
model Admin {
  id             Int      @id @default(autoincrement())
  username       String   @unique @db.VarChar(50)
  password       String   @db.VarChar(255)
  email          String?  @db.VarChar(100)
  fechaCreacion  DateTime @default(now()) @map("fecha_creacion")

  @@map("admins")
}
```

**Campos clave:**
- `id` (PK): ID autoincremental
- `username`: Nombre de usuario único
- `password`: Contraseña hasheada con bcrypt (10 rounds)

---

## 💻 Ejemplos de Uso

### Ejemplo 1: Registro Completo de Usuario

```javascript
// Frontend - Formulario de registro
async function registrarUsuario(formData) {
  try {
    // 1. Crear cuenta
    const response = await fetch('/api/signup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        password: formData.password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al crear la cuenta')
    }

    console.log('✅ Usuario creado:', data.user)

    // 2. Auto-login después del registro
    const loginResult = await signIn('credentials', {
      phone: formData.phone,
      password: formData.password,
      redirect: false
    })

    if (loginResult?.error) {
      console.error('Error al hacer login automático:', loginResult.error)
      // Redirigir a login manual
      router.push('/auth/login?message=Cuenta creada. Inicia sesión.')
    } else {
      console.log('✅ Login automático exitoso')
      router.push('/dashboard')
    }
  } catch (error) {
    console.error('❌ Error:', error)
  }
}
```

---

### Ejemplo 2: Login de Usuario con Teléfono

```javascript
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'

async function loginConTelefono(phone, password) {
  const router = useRouter()
  
  const result = await signIn('credentials', {
    phone: phone,
    password: password,
    redirect: false
  })

  if (result?.error) {
    console.error('Error de login:', result.error)
    // Mostrar error al usuario
    return { success: false, error: result.error }
  }

  console.log('✅ Login exitoso')
  router.push('/dashboard')
  router.refresh()
  
  return { success: true }
}

// Uso
loginConTelefono('+5255123456788', 'miPassword123')
```

---

### Ejemplo 3: Login de Usuario con Email

```javascript
import { signIn } from 'next-auth/react'

async function loginConEmail(email, password) {
  const result = await signIn('credentials', {
    email: email,
    password: password,
    redirect: false
  })

  if (result?.error) {
    return { success: false, error: result.error }
  }

  return { success: true }
}

// Uso
loginConEmail('juan.perez@example.com', 'miPassword123')
```

---

### Ejemplo 4: Registro de Administrador

```javascript
async function registrarAdmin(username, password, email) {
  try {
    const response = await fetch('http://localhost:3001/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password,
        email
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al registrar admin')
    }

    console.log('✅ Admin creado:', data.data)
    return { success: true, admin: data.data }
  } catch (error) {
    console.error('❌ Error:', error)
    return { success: false, error: error.message }
  }
}

// Uso
registrarAdmin('nuevo_admin', 'password123', 'admin@cuenty.com')
```

---

### Ejemplo 5: Login de Administrador

```javascript
async function loginAdmin(username, password) {
  try {
    const response = await fetch('http://localhost:3001/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username,
        password
      })
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.error || 'Error al hacer login')
    }

    // Guardar token en localStorage
    localStorage.setItem('admin_token', data.data.token)
    
    console.log('✅ Login exitoso:', data.data.user)
    return { success: true, user: data.data.user, token: data.data.token }
  } catch (error) {
    console.error('❌ Error:', error)
    return { success: false, error: error.message }
  }
}

// Uso
loginAdmin('admin_user', 'securePassword123')
```

---

### Ejemplo 6: Usando cURL para Probar los Endpoints

#### Probar `/api/signup`
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Juan Pérez",
    "email": "juan.perez@example.com",
    "phone": "+52 55 1234 5678",
    "password": "miPassword123"
  }'
```

#### Probar `/auth/register` (Admin)
```bash
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_user",
    "password": "securePassword123",
    "email": "admin@cuenty.com"
  }'
```

#### Probar `/auth/login` (Admin)
```bash
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin_user",
    "password": "securePassword123"
  }'
```

---

## 🐛 Errores Comunes y Soluciones

### Error 1: "Usuario no encontrado" en NextAuth

**Causa:** El número de teléfono no coincide exactamente con el almacenado en la base de datos.

**Solución:** Asegúrate de limpiar el número de teléfono antes de buscar:
```javascript
const phoneClean = phone.replace(/[\s\-\(\)]/g, '')
```

---

### Error 2: "Usuario sin contraseña"

**Causa:** El usuario fue creado antes de agregar el campo `password` al modelo.

**Solución:** 
1. Verificar si el usuario tiene contraseña antes de intentar autenticar
2. Si no tiene, mostrar un mensaje para que cree una nueva contraseña

---

### Error 3: "El usuario ya existe"

**Causa:** Ya existe un usuario con ese email o teléfono.

**Solución:** Verificar en la base de datos si el usuario ya existe y mostrar un mensaje apropiado al usuario.

---

### Error 4: Migración no aplicada

**Causa:** La migración de base de datos para agregar el campo `password` no se ha ejecutado.

**Solución:** Ejecutar la migración:
```bash
cd backend
npx prisma migrate deploy
```

O ejecutar manualmente el SQL:
```sql
ALTER TABLE "usuarios" ADD COLUMN "password" VARCHAR(255);
```

---

## 🔄 Migraciones de Base de Datos

### Migración Creada: `20251021165212_add_password_to_usuario`

**Archivo:** `backend/prisma/migrations/20251021165212_add_password_to_usuario/migration.sql`

**SQL:**
```sql
-- AlterTable
-- Agregar campo password a la tabla usuarios
ALTER TABLE "usuarios" ADD COLUMN "password" VARCHAR(255);

-- Comentario: Este campo almacenará la contraseña hasheada con bcrypt para usuarios normales
-- Nota: El campo es nullable para mantener compatibilidad con usuarios existentes
```

### Cómo Aplicar la Migración

#### Opción 1: Con Prisma CLI (Recomendado)
```bash
cd /home/ubuntu/cuenty_mvp/backend
npx prisma migrate deploy
```

#### Opción 2: Manualmente con psql
```bash
psql -U postgres -d cuenty_db -f backend/prisma/migrations/20251021165212_add_password_to_usuario/migration.sql
```

#### Opción 3: Desde pgAdmin o cualquier cliente PostgreSQL
Copiar y pegar el contenido del archivo `migration.sql` y ejecutarlo.

---

### Verificar que la Migración se Aplicó

```sql
-- Verificar que la columna existe
SELECT column_name, data_type, character_maximum_length 
FROM information_schema.columns 
WHERE table_name = 'usuarios' AND column_name = 'password';

-- Resultado esperado:
-- column_name | data_type         | character_maximum_length
-- ------------|-------------------|-------------------------
-- password    | character varying | 255
```

---

## 🧪 Testing

### Prueba Manual del Flujo Completo

1. **Registrar un nuevo usuario:**
```bash
curl -X POST http://localhost:3000/api/signup \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@test.com",
    "phone": "+5255987654321",
    "password": "test123"
  }'
```

2. **Verificar en la base de datos:**
```sql
SELECT celular, nombre, email, 
       CASE WHEN password IS NOT NULL THEN 'Contraseña existe' ELSE 'Sin contraseña' END as password_status
FROM usuarios 
WHERE email = 'test@test.com';
```

3. **Intentar login con NextAuth:**
```javascript
await signIn('credentials', {
  phone: '+5255987654321',
  password: 'test123',
  redirect: false
})
```

---

## 📝 Notas Importantes

1. **Seguridad de Contraseñas:**
   - Las contraseñas se hashean con bcrypt usando 10 rounds (bcrypt.hash(password, 10))
   - NUNCA se almacenan contraseñas en texto plano
   - Las contraseñas hasheadas tienen ~60 caracteres

2. **Compatibilidad Retroactiva:**
   - El campo `password` es nullable para mantener compatibilidad con usuarios existentes
   - Los usuarios sin contraseña no podrán autenticarse hasta que establezcan una

3. **Diferencias entre Usuario y Admin:**
   - **Usuario:** PK es el celular (String), usa `/api/signup` y NextAuth
   - **Admin:** PK es el id (Int autoincremental), usa `/auth/register` y JWT

4. **Limpieza de Teléfonos:**
   - Los números de teléfono se limpian automáticamente al registrar: `phone.replace(/[\s\-\(\)]/g, '')`
   - Ejemplo: "+52 55 1234 5678" → "+5255123456788"

---

## 🔗 Referencias

- **Prisma Documentation:** https://www.prisma.io/docs
- **NextAuth.js Documentation:** https://next-auth.js.org
- **bcrypt npm package:** https://www.npmjs.com/package/bcryptjs
- **Express.js Documentation:** https://expressjs.com

---

## 📞 Soporte

Para cualquier duda o problema, contactar al equipo de desarrollo.

**Versión del documento:** 1.0  
**Última actualización:** 21 de Octubre, 2025  
**Autor:** DeepAgent - Abacus.AI

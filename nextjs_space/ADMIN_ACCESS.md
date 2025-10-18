# 🔐 Guía de Acceso de Administrador - CUENTY

## 📋 Resumen del Sistema de Autenticación

El proyecto CUENTY tiene **DOS sistemas de autenticación separados**:

1. **Sistema de Usuario Regular** (NextAuth) - `/auth/login`
2. **Sistema de Administrador** (Custom Token) - `/admin/login`

---

## ⚠️ **PROBLEMA CRÍTICO IDENTIFICADO**

### El sistema de autenticación de administrador NO está completamente implementado

**Lo que existe:**
- ✅ Página de login de admin: `/admin/login`
- ✅ Layout protegido de admin con verificación de token
- ✅ Panel de administración con múltiples páginas
- ✅ Cliente de API en `lib/admin-auth.ts`
- ✅ Protección de rutas mediante localStorage

**Lo que FALTA:**
- ❌ **Endpoint de API `/api/admin/login`** (NO EXISTE)
- ❌ Base de datos de administradores
- ❌ Sistema de verificación de credenciales
- ❌ Generación y validación de tokens JWT

### Resultado actual:
**NO ES POSIBLE INICIAR SESIÓN COMO ADMINISTRADOR** porque el endpoint de login no está implementado.

---

## 🛠️ Solución Recomendada

### Opción 1: Implementar el Sistema de Admin Completo (Recomendado)

Necesitas crear:

#### 1. Endpoint de Login de Admin
Archivo: `app/api/admin/login/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'change-this-secret'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    // Verificar credenciales de admin
    // Por ahora, usar credenciales hardcoded (cambiar en producción)
    const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@cuenty.com'
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'admin123'

    if (email !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Generar token JWT
    const token = jwt.sign(
      { 
        email,
        role: 'admin',
        exp: Math.floor(Date.now() / 1000) + (24 * 60 * 60) // 24 horas
      },
      ADMIN_SECRET
    )

    return NextResponse.json({
      success: true,
      token,
      message: 'Login exitoso'
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    )
  }
}
```

#### 2. Middleware de Autenticación
Archivo: `lib/admin-middleware.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'change-this-secret'

export function verifyAdminToken(token: string): boolean {
  try {
    jwt.verify(token, ADMIN_SECRET)
    return true
  } catch (error) {
    return false
  }
}

export function adminAuthMiddleware(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: 'Token no proporcionado' },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7)
  
  if (!verifyAdminToken(token)) {
    return NextResponse.json(
      { message: 'Token inválido o expirado' },
      { status: 401 }
    )
  }

  return null // Continuar con la petición
}
```

#### 3. Variables de Entorno
Agregar a `.env.local`:

```bash
ADMIN_SECRET="tu-secreto-super-seguro-cambiar-en-produccion"
ADMIN_EMAIL="admin@cuenty.com"
ADMIN_PASSWORD="cambiar-esta-contraseña"
```

#### 4. Instalar dependencias necesarias
```bash
npm install jsonwebtoken bcryptjs
npm install --save-dev @types/jsonwebtoken @types/bcryptjs
```

---

### Opción 2: Solución Temporal con Bypass (Solo para desarrollo)

Si necesitas acceso inmediato al panel para pruebas, puedes modificar temporalmente el archivo `lib/admin-auth.ts`:

```typescript
// En lib/admin-auth.ts
export const adminAuth = {
  login: async (email: string, password: string) => {
    // SOLO PARA DESARROLLO - ELIMINAR EN PRODUCCIÓN
    if (email === 'admin@cuenty.com' && password === 'admin123') {
      const fakeToken = 'dev-token-' + Date.now()
      localStorage.setItem('admin_token', fakeToken)
      return { success: true, token: fakeToken }
    }
    return { success: false, message: 'Credenciales inválidas' }
  },
  
  isAuthenticated: () => {
    // SOLO PARA DESARROLLO
    return !!localStorage.getItem('admin_token')
  },
  
  // ... resto del código
}
```

**⚠️ ADVERTENCIA:** Esta es una solución temporal SOLO para desarrollo. NO usar en producción.

---

## 📍 Rutas del Sistema

### Sistema de Usuario Regular
- **Login:** http://localhost:3000/auth/login
- **Registro:** http://localhost:3000/auth/register
- **Dashboard:** http://localhost:3000/dashboard

**Credenciales de prueba:**
- Teléfono: `+525551234567`
- Contraseña: `johndoe123`

### Sistema de Administrador
- **Login:** http://localhost:3000/admin/login
- **Dashboard:** http://localhost:3000/admin
- **Servicios:** http://localhost:3000/admin/services
- **Planes:** http://localhost:3000/admin/plans
- **Pedidos:** http://localhost:3000/admin/orders
- **Cuentas:** http://localhost:3000/admin/accounts
- **Config. Sitio:** http://localhost:3000/admin/site-config
- **Configuración:** http://localhost:3000/admin/config

**Credenciales:** ❌ NO DISPONIBLES (sistema no implementado)

---

## 🗄️ Estructura de Base de Datos

### Modelo User Actual (Prisma)
```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  phone         String?
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  orders        Order[]
}
```

**Nota:** NO hay campo de `role` en el modelo User, por lo que no hay distinción entre usuarios normales y administradores en la base de datos.

### Solución Recomendada - Agregar campo role:

```prisma
model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  phone         String?
  role          String    @default("user") // "user" o "admin"
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  accounts      Account[]
  sessions      Session[]
  orders        Order[]
}
```

Luego ejecutar:
```bash
npx prisma migrate dev --name add-user-role
npx prisma generate
```

---

## 🔧 Pasos para Implementar el Sistema Completo

1. **Crear el endpoint de login**
   ```bash
   mkdir -p app/api/admin/login
   # Crear el archivo route.ts con el código proporcionado arriba
   ```

2. **Instalar dependencias**
   ```bash
   npm install jsonwebtoken bcryptjs
   npm install --save-dev @types/jsonwebtoken @types/bcryptjs
   ```

3. **Configurar variables de entorno**
   ```bash
   # Agregar a .env.local
   echo 'ADMIN_SECRET="super-secret-key-change-in-production"' >> .env.local
   echo 'ADMIN_EMAIL="admin@cuenty.com"' >> .env.local
   echo 'ADMIN_PASSWORD="AdminCuenty2024!"' >> .env.local
   ```

4. **Actualizar el esquema de Prisma** (opcional pero recomendado)
   - Agregar campo `role` al modelo User
   - Ejecutar migración

5. **Proteger las rutas de admin**
   - Implementar middleware para verificar tokens
   - Agregar verificación en todos los endpoints de `/api/admin/*`

6. **Crear script de seed para primer admin**
   ```typescript
   // prisma/seed.ts
   import { PrismaClient } from '@prisma/client'
   import bcrypt from 'bcryptjs'

   const prisma = new PrismaClient()

   async function main() {
     const admin = await prisma.user.upsert({
       where: { email: 'admin@cuenty.com' },
       update: {},
       create: {
         email: 'admin@cuenty.com',
         name: 'Administrador',
         role: 'admin',
         // Otros campos según tu esquema
       },
     })
     console.log({ admin })
   }

   main()
   ```

---

## 📝 Checklist de Implementación

- [ ] Crear endpoint `/api/admin/login`
- [ ] Instalar dependencias (jsonwebtoken, bcryptjs)
- [ ] Configurar variables de entorno
- [ ] Agregar campo `role` al modelo User
- [ ] Ejecutar migración de Prisma
- [ ] Crear middleware de autenticación
- [ ] Proteger rutas de API admin
- [ ] Crear script de seed para primer admin
- [ ] Probar login de admin
- [ ] Actualizar documentación

---

## 🚀 Acceso Rápido para Desarrollo

Si necesitas acceso **INMEDIATO** solo para ver el panel (sin seguridad):

1. Abre `lib/admin-auth.ts`
2. Modifica la función `isAuthenticated`:
   ```typescript
   isAuthenticated: () => {
     return true // Siempre retorna true
   }
   ```
3. Visita directamente: http://localhost:3000/admin

**⚠️ IMPORTANTE:** Esto bypasea toda la seguridad. Revertir inmediatamente después de desarrollo.

---

## 📞 Contacto y Soporte

Si necesitas ayuda para implementar el sistema de autenticación de administrador, considera:
- Revisar la documentación de NextAuth para integrar roles
- Implementar un sistema de autenticación JWT personalizado
- Usar un servicio de autenticación de terceros (Auth0, Clerk, etc.)

---

**Última actualización:** 17 de octubre de 2025
**Estado:** Sistema de admin parcialmente implementado - Requiere completar endpoint de login

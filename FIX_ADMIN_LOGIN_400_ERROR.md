# Corrección del Error 400 en el Login de Admin

**Fecha:** 20 de Octubre, 2025  
**Commit:** c1bdc17

## Problema Identificado

El usuario experimentaba un error 400 (Bad Request) al intentar hacer login en el panel de administración en `/admin/login`. El error se debía a que las variables de entorno necesarias para la autenticación de admin no estaban configuradas en el archivo `.env` de Next.js.

### Variables de Entorno Faltantes

Aunque las siguientes variables fueron configuradas en Easypanel, no estaban presentes en el archivo `.env` de Next.js:
- `ADMIN_EMAIL`
- `ADMIN_PASSWORD`
- `ADMIN_SECRET`

## Solución Implementada

### 1. Configuración de Variables de Entorno

**Archivo:** `/home/ubuntu/cuenty_mvp/nextjs_space/.env`

Se agregaron las siguientes variables de entorno:

```env
# Admin Panel Configuration
ADMIN_EMAIL=admin@cuenty.top
ADMIN_PASSWORD=x0420EZS
ADMIN_SECRET=947aa8ab9d322528a4fc00c50270f3c3
```

### 2. Actualización del Archivo de Ejemplo

**Archivo:** `nextjs_space/.env.example`

Se actualizó el archivo de ejemplo para incluir las variables de admin:

```env
# Admin Panel Configuration
ADMIN_EMAIL=admin@cuenty.com
ADMIN_PASSWORD=change-this-password
ADMIN_SECRET=change-this-secret-key-minimum-32-characters
```

### 3. Mejora del Endpoint de Login

**Archivo:** `nextjs_space/app/api/admin/login/route.ts`

Se implementaron las siguientes mejoras:

#### a) Logging Detallado
```typescript
// Log de las variables de entorno (sin exponer datos sensibles)
console.log('[Admin Login Route] Variables de entorno cargadas:', {
  hasAdminEmail: !!process.env.ADMIN_EMAIL,
  hasAdminPassword: !!process.env.ADMIN_PASSWORD,
  hasAdminSecret: !!process.env.ADMIN_SECRET,
  adminEmailPrefix: process.env.ADMIN_EMAIL?.substring(0, 5) + '...',
})
```

#### b) Validación de Body JSON
```typescript
// Intentar parsear el body
let body
try {
  body = await request.json()
} catch (parseError) {
  console.error('[Admin Login] Error al parsear el body:', parseError)
  return NextResponse.json(
    { message: 'Error al procesar la solicitud. El formato del body debe ser JSON válido.' },
    { status: 400 }
  )
}
```

#### c) Validación de Tipos de Datos
```typescript
// Validar tipo de datos
if (typeof email !== 'string' || typeof password !== 'string') {
  console.warn('[Admin Login] Tipos de datos inválidos:', { 
    emailType: typeof email, 
    passwordType: typeof password 
  })
  return NextResponse.json(
    { message: 'Email y contraseña deben ser strings' },
    { status: 400 }
  )
}
```

#### d) Logging de Comparación de Credenciales
```typescript
console.log('[Admin Login] Comparando credenciales...')
console.log('[Admin Login] Email esperado:', ADMIN_CREDENTIALS.email?.substring(0, 5) + '...')
console.log('[Admin Login] Email recibido:', email?.substring(0, 5) + '...')
```

#### e) Mejor Manejo de Errores
```typescript
catch (error) {
  console.error('[Admin Login] Error del servidor:', error)
  return NextResponse.json(
    { 
      message: 'Error del servidor',
      error: error instanceof Error ? error.message : 'Error desconocido'
    },
    { status: 500 }
  )
}
```

## Pasos de Implementación

1. ✅ Agregar variables de entorno al archivo `.env` de nextjs_space
2. ✅ Actualizar el archivo `.env.example` con las variables de admin
3. ✅ Mejorar el manejo de errores y logging en el endpoint de login
4. ✅ Reconstruir la aplicación Next.js (`npm run build`)
5. ✅ Hacer commit y push al repositorio GitHub

## Instrucciones para Producción

### Configuración en Easypanel

Las variables de entorno deben estar configuradas en Easypanel de la siguiente manera:

```
ADMIN_EMAIL=admin@cuenty.top
ADMIN_PASSWORD=x0420EZS
ADMIN_SECRET=947aa8ab9d322528a4fc00c50270f3c3
```

### Reiniciar el Servicio

Después de actualizar el código desde GitHub, es necesario:

1. Detener el contenedor de Next.js en Easypanel
2. Asegurarse de que las variables de entorno estén configuradas
3. Reiniciar el contenedor

Las variables de entorno de Easypanel se inyectarán automáticamente al contenedor y Next.js podrá leerlas con `process.env`.

## Verificación

Para verificar que el login funciona correctamente:

1. Acceder a `https://tu-dominio.com/admin/login`
2. Ingresar las credenciales:
   - Email: `admin@cuenty.top`
   - Password: `x0420EZS`
3. Si el login es exitoso, serás redirigido a `/admin`
4. Revisar los logs del servidor para ver los mensajes de debugging

## Logs Esperados

Cuando el login funcione correctamente, deberías ver en los logs:

```
[Admin Login Route] Variables de entorno cargadas: {
  hasAdminEmail: true,
  hasAdminPassword: true,
  hasAdminSecret: true,
  adminEmailPrefix: 'admin...'
}
[Admin Login] Recibida solicitud de login
[Admin Login] Email recibido: admin...
[Admin Login] Comparando credenciales...
[Admin Login] Email esperado: admin...
[Admin Login] Email recibido: admin...
[Admin Login] Credenciales válidas, generando token...
[Admin Login] Token generado exitosamente
```

## Seguridad

⚠️ **IMPORTANTE:** El archivo `.env` con las credenciales reales NO está incluido en el repositorio Git por razones de seguridad. Las credenciales deben configurarse manualmente en cada entorno (desarrollo, staging, producción) a través de Easypanel o el sistema de configuración que se use.

## Archivos Modificados

1. `nextjs_space/.env.example` - Actualizado con variables de admin
2. `nextjs_space/app/api/admin/login/route.ts` - Mejorado con mejor logging y manejo de errores

## Referencias

- Commit: `c1bdc17`
- Branch: `main`
- Repositorio: `https://github.com/qhosting/cuenty-mvp`

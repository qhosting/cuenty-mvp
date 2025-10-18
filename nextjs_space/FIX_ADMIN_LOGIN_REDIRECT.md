# Solución: Redirección en /admin/login

## Problema Identificado

La ruta `/admin/login` estaba siendo redirigida automáticamente a `/api/auth/signin?callbackUrl=%2Fadmin%2Flogin`, impidiendo el acceso directo a la página de login del panel de administración.

## Causa Raíz

El archivo `middleware.ts` estaba configurado para proteger todas las rutas que coincidieran con el patrón `/admin/:path*`, incluyendo `/admin/login`. Esto causaba que NextAuth interceptara la solicitud y redirigiera al usuario a la página de autenticación genérica.

## Solución Implementada

Se modificó el callback `authorized` en `middleware.ts` para permitir acceso público específicamente a `/admin/login`:

```typescript
authorized: ({ token, req }) => {
  const pathname = req.nextUrl.pathname

  // Permitir acceso público a /admin/login
  if (pathname === '/admin/login') {
    return true
  }

  // Check if user is authenticated for protected routes
  if (pathname.startsWith('/dashboard')) {
    return !!token
  }
  if (pathname.startsWith('/admin')) {
    return !!token
  }
  return true
}
```

## Rutas Afectadas

### Rutas Públicas (sin autenticación requerida):
- `/admin/login` - Página de inicio de sesión del administrador

### Rutas Protegidas (requieren autenticación):
- `/admin` - Dashboard principal
- `/admin/services` - Gestión de servicios
- `/admin/plans` - Gestión de planes
- `/admin/orders` - Gestión de pedidos
- `/admin/accounts` - Gestión de cuentas
- `/admin/site-config` - Configuración del sitio
- `/admin/config` - Configuraciones generales
- `/dashboard/*` - Panel de usuario
- `/checkout/*` - Proceso de compra

## Verificación

Para verificar que la solución funciona correctamente:

1. Acceder a `http://localhost:3000/admin/login` - Debe mostrar el formulario de login
2. Intentar acceder a `http://localhost:3000/admin` sin sesión - Debe redirigir a login
3. Iniciar sesión y verificar acceso a rutas protegidas

## Cambios en el Repositorio

- **Commit**: `fix: permitir acceso público a /admin/login`
- **Archivo modificado**: `middleware.ts`
- **Branch**: `main`

## Fecha de Implementación

17 de Octubre, 2025

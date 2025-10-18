
# 🚀 Inicio Rápido - Acceso de Administrador

## ✅ Sistema de Autenticación Implementado

Se ha implementado el sistema de autenticación de administrador. Ahora puedes acceder al panel de administración.

---

## 📍 Acceso al Panel de Administración

### URL de Login
```
http://localhost:3000/admin/login
```

### Credenciales Predeterminadas

**Email:** `admin@cuenty.com`  
**Contraseña:** `admin123`

---

## 🎯 Pasos para Iniciar Sesión

1. **Asegúrate de que el servidor esté corriendo:**
   ```bash
   cd /home/ubuntu/cuenty_mvp/nextjs_space
   npm run dev
   ```

2. **Abre el navegador y ve a:**
   ```
   http://localhost:3000/admin/login
   ```

3. **Ingresa las credenciales:**
   - Email: `admin@cuenty.com`
   - Contraseña: `admin123`

4. **Haz clic en "Iniciar Sesión"**

5. **Serás redirigido al Dashboard de Administración:**
   ```
   http://localhost:3000/admin
   ```

---

## 📊 Páginas Disponibles del Panel de Admin

Una vez dentro, tendrás acceso a:

- **Dashboard** - `/admin` - Estadísticas y métricas generales
- **Servicios** - `/admin/services` - Gestión de servicios de streaming
- **Planes** - `/admin/plans` - Gestión de planes y precios
- **Pedidos** - `/admin/orders` - Administración de pedidos
- **Cuentas** - `/admin/accounts` - Gestión de cuentas de clientes
- **Config. Sitio** - `/admin/site-config` - Configuración visual del sitio
- **Configuración** - `/admin/config` - Configuración general

---

## 🔧 Instalar Dependencias Necesarias

Para que el sistema de autenticación funcione, necesitas instalar:

```bash
cd /home/ubuntu/cuenty_mvp/nextjs_space
npm install jsonwebtoken
npm install --save-dev @types/jsonwebtoken
```

---

## 🔐 Cambiar Credenciales (Recomendado para Producción)

### Opción 1: Usar Variables de Entorno

Edita el archivo `.env.local`:

```bash
ADMIN_SECRET="tu-secreto-super-seguro-aqui"
ADMIN_EMAIL="tu-email@dominio.com"
ADMIN_PASSWORD="tu-contraseña-segura-aqui"
```

### Opción 2: Modificar el código directamente

Edita `app/api/admin/login/route.ts`:

```typescript
const ADMIN_CREDENTIALS = {
  email: 'tu-email@dominio.com',
  password: 'tu-contraseña-segura'
}
```

---

## 🚨 Solución de Problemas

### "Error de conexión. Inténtalo de nuevo"

**Causa:** El endpoint de API no responde o hay un error.

**Solución:**
1. Verifica que el servidor esté corriendo
2. Revisa la consola del servidor para errores
3. Asegúrate de haber instalado `jsonwebtoken`:
   ```bash
   npm install jsonwebtoken
   ```

### "Credenciales inválidas"

**Causa:** Email o contraseña incorrectos.

**Solución:**
- Verifica que estés usando:
  - Email: `admin@cuenty.com`
  - Contraseña: `admin123`
- O las credenciales que hayas configurado en `.env.local`

### "Token no proporcionado" en las páginas de admin

**Causa:** El token no se guardó correctamente o expiró.

**Solución:**
1. Cierra sesión (botón en el sidebar)
2. Vuelve a iniciar sesión
3. Si persiste, limpia el localStorage del navegador:
   ```javascript
   // En la consola del navegador
   localStorage.clear()
   ```

### El panel no carga después del login

**Causa:** Redirección o protección de ruta fallida.

**Solución:**
1. Verifica que el token esté guardado:
   ```javascript
   // En la consola del navegador
   console.log(localStorage.getItem('admin_token'))
   ```
2. Si no hay token, intenta iniciar sesión de nuevo
3. Si hay token pero no carga, intenta acceder directamente a:
   ```
   http://localhost:3000/admin
   ```

---

## 🛡️ Seguridad

### Para Desarrollo (Estado Actual)
- ✅ Autenticación con JWT
- ✅ Tokens con expiración de 24 horas
- ✅ Protección de rutas del panel
- ⚠️ Credenciales hardcoded (solo para desarrollo)

### Para Producción (Pendiente)
- [ ] Usar base de datos para almacenar admins
- [ ] Hash de contraseñas con bcrypt
- [ ] Implementar refresh tokens
- [ ] Agregar rate limiting
- [ ] Agregar 2FA (opcional)
- [ ] Logs de acceso
- [ ] Cambiar credenciales por defecto

---

## 📝 Notas Importantes

1. **Las credenciales actuales son solo para desarrollo**
   - NUNCA uses `admin123` en producción
   - Cambia el `ADMIN_SECRET` por algo más seguro

2. **El token se guarda en localStorage**
   - Se mantiene por 24 horas
   - Se elimina al cerrar sesión
   - No se comparte entre subdominios

3. **El sistema actual es básico**
   - Es funcional para MVP y desarrollo
   - Para producción, considera implementar un sistema más robusto

---

## 🎉 ¡Listo!

Ahora puedes acceder al panel de administración y gestionar tu plataforma CUENTY.

Si tienes problemas, revisa:
1. Que el servidor esté corriendo en el puerto 3000
2. Que las dependencias estén instaladas
3. Que estés usando las credenciales correctas
4. Los logs de la consola del servidor

---

**Última actualización:** 17 de octubre de 2025  
**Versión:** 1.0.0

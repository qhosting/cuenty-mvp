# Documentación de Implementación de Configuración

## Resumen de Cambios

Se implementó un sistema completo de configuración en el panel de administración para gestionar las credenciales de Evolution API y Chatwoot.

---

## 🔧 Cambios en el Backend

### 1. Rutas Agregadas (`backend/routes/adminRoutes.js`)

Se agregaron las siguientes rutas para la gestión de configuraciones:

#### Rutas de Evolution API (Existentes - Sin cambios)
- `GET /api/admin/config/evolution` - Obtener configuración de Evolution API
- `POST /api/admin/config/evolution` - Guardar configuración de Evolution API

#### Rutas de Chatwoot (Nuevas)
- `GET /api/admin/config/chatwoot` - Obtener configuración de Chatwoot
- `POST /api/admin/config/chatwoot` - Guardar configuración de Chatwoot

#### Rutas de Configuración General (Nuevas)
- `GET /api/admin/config` - Obtener todas las configuraciones (Evolution + Chatwoot)
- `POST /api/admin/config` - Guardar todas las configuraciones

### 2. Controladores Agregados (`backend/controllers/adminController.js`)

Se implementaron las siguientes funciones:

#### `obtenerConfigChatwoot()`
- Obtiene la configuración de Chatwoot desde la base de datos
- Crea la tabla `chatwoot_config` automáticamente si no existe
- Retorna valores por defecto si no hay configuración guardada

#### `guardarConfigChatwoot()`
- Guarda o actualiza la configuración de Chatwoot
- Campos: `chatwoot_url`, `access_token`, `account_id`, `activo`
- Crea la tabla automáticamente si no existe

#### `obtenerConfiguraciones()`
- Obtiene todas las configuraciones (Evolution + Chatwoot)
- Maneja tablas inexistentes de forma elegante
- Retorna un objeto con ambas configuraciones

#### `guardarConfiguraciones()`
- Guarda ambas configuraciones de forma atómica
- Valida y maneja errores individualmente para cada servicio
- Retorna el estado de ambas operaciones

### 3. Esquema de Base de Datos

Se crean automáticamente las siguientes tablas:

#### Tabla `evolution_config` (Ya existía)
```sql
CREATE TABLE IF NOT EXISTS evolution_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  api_url TEXT,
  api_key TEXT,
  instance_name VARCHAR(100),
  activo BOOLEAN DEFAULT false,
  fecha_actualizacion TIMESTAMP DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
)
```

#### Tabla `chatwoot_config` (Nueva)
```sql
CREATE TABLE IF NOT EXISTS chatwoot_config (
  id INTEGER PRIMARY KEY DEFAULT 1,
  chatwoot_url TEXT,
  access_token TEXT,
  account_id VARCHAR(50),
  activo BOOLEAN DEFAULT false,
  fecha_actualizacion TIMESTAMP DEFAULT NOW(),
  CONSTRAINT single_row CHECK (id = 1)
)
```

**Nota:** Ambas tablas usan el constraint `single_row` para garantizar que solo exista un registro con `id = 1`.

---

## 🎨 Cambios en el Frontend

### 1. HTML (`frontend/admin/index.html`)

#### Menú de Navegación
- Se agregó el item "⚙️ Configuración" en el sidebar

#### Sección de Configuración
Se creó una nueva sección completa con:

- **Notificaciones**: Contenedor para mostrar mensajes de éxito/error
- **Sección Evolution API**: 
  - URL de la API
  - API Key
  - Nombre de la Instancia
  - Checkbox para activar/desactivar
- **Sección Chatwoot**:
  - URL de Chatwoot
  - Access Token
  - Account ID
  - Checkbox para activar/desactivar
- **Botones de Acción**:
  - Botón "🔄 Recargar" para cargar la configuración actual
  - Botón "💾 Guardar Configuración" para guardar cambios

### 2. JavaScript (`frontend/admin/admin-app.js`)

#### Funciones Agregadas

##### `cargarConfiguracion()`
```javascript
async function cargarConfiguracion()
```
- Carga la configuración actual desde el servidor
- Popula los formularios con los valores existentes
- Muestra notificaciones de estado (cargando, éxito, error)

##### `guardarConfiguracion()`
```javascript
async function guardarConfiguracion()
```
- Recolecta los valores de todos los campos
- Envía una petición POST con las configuraciones
- Deshabilita el botón durante el guardado
- Muestra notificaciones de éxito o error
- Incluye detalles de lo que se activó

##### `mostrarNotificacionConfig(tipo, mensaje)`
```javascript
function mostrarNotificacionConfig(tipo, mensaje)
```
- Tipos: 'success', 'error', 'info', 'warning'
- Muestra notificaciones con colores e iconos apropiados
- Incluye animación de entrada (slideDown)

##### `ocultarNotificacionConfig()`
```javascript
function ocultarNotificacionConfig()
```
- Oculta y limpia el contenedor de notificaciones

#### Actualización en `showSection()`
Se agregó el caso para cargar la configuración cuando se accede a la sección:
```javascript
case 'configuracion':
    cargarConfiguracion();
    break;
```

---

## 🎯 Características Implementadas

### 1. Gestión de Errores
- ✅ Manejo de tablas inexistentes (se crean automáticamente)
- ✅ Validación de datos en el backend
- ✅ Mensajes de error descriptivos
- ✅ Feedback visual en el frontend

### 2. Seguridad
- ✅ Autenticación requerida (middleware `verifyToken`, `verifyAdmin`)
- ✅ Validación de permisos de administrador
- ✅ Headers de autenticación en todas las peticiones

### 3. Experiencia de Usuario
- ✅ Notificaciones visuales de estado
- ✅ Botón de guardado con estado de carga
- ✅ Organización clara por secciones
- ✅ Descripciones de ayuda para cada campo
- ✅ Auto-ocultamiento de notificaciones de éxito

### 4. Diseño
- ✅ Interfaz moderna y limpia
- ✅ Tarjetas separadas por servicio
- ✅ Iconos descriptivos
- ✅ Colores consistentes con el resto del admin
- ✅ Animaciones suaves

---

## 📝 Uso

### Para Administradores

1. **Acceder a la Configuración**:
   - Iniciar sesión en el panel de administración
   - Clic en "⚙️ Configuración" en el menú lateral

2. **Configurar Evolution API**:
   - Ingresar la URL de tu instancia de Evolution API
   - Ingresar el API Key proporcionado por Evolution
   - Ingresar el nombre de tu instancia
   - Marcar "Activar Evolution API" para habilitar el servicio

3. **Configurar Chatwoot**:
   - Ingresar la URL de tu instancia de Chatwoot
   - Ingresar el Access Token de tu cuenta
   - Ingresar el Account ID
   - Marcar "Activar Chatwoot" para habilitar la integración

4. **Guardar Cambios**:
   - Clic en "💾 Guardar Configuración"
   - Esperar la confirmación de éxito
   - Verificar que los servicios activados aparezcan en la notificación

### Credenciales de Chatwoot Proporcionadas

Según el contexto del proyecto, las credenciales actuales son:
- **URL**: https://chat.whatscloud.site
- **Access Token**: z8kpNiED3fW7KL6PcXoQJiQ4
- **Account ID**: 3

---

## 🔍 Testing

### Pruebas Recomendadas

1. **Guardar Configuración de Evolution API**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/config/evolution \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "api_url": "https://api.evolution.com",
       "api_key": "test-key",
       "instance_name": "cuenty-instance",
       "activo": true
     }'
   ```

2. **Guardar Configuración de Chatwoot**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/config/chatwoot \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "chatwoot_url": "https://chat.whatscloud.site",
       "access_token": "z8kpNiED3fW7KL6PcXoQJiQ4",
       "account_id": "3",
       "activo": true
     }'
   ```

3. **Obtener Todas las Configuraciones**:
   ```bash
   curl -X GET http://localhost:3000/api/admin/config \
     -H "Authorization: Bearer YOUR_TOKEN"
   ```

4. **Guardar Ambas Configuraciones**:
   ```bash
   curl -X POST http://localhost:3000/api/admin/config \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_TOKEN" \
     -d '{
       "evolution": {
         "api_url": "https://api.evolution.com",
         "api_key": "test-key",
         "instance_name": "cuenty-instance",
         "activo": true
       },
       "chatwoot": {
         "chatwoot_url": "https://chat.whatscloud.site",
         "access_token": "z8kpNiED3fW7KL6PcXoQJiQ4",
         "account_id": "3",
         "activo": true
       }
     }'
   ```

---

## 🐛 Solución de Problemas

### Error: "Tabla no existe"
**Solución**: Las tablas se crean automáticamente. Si persiste el error, verificar permisos de base de datos.

### Error: "No autorizado"
**Solución**: Verificar que el token JWT sea válido y que el usuario tenga permisos de administrador.

### Configuración no se guarda
**Solución**: 
1. Verificar la conexión a la base de datos
2. Revisar los logs del backend para errores específicos
3. Verificar que todos los campos requeridos estén completos

### Botón de guardar queda deshabilitado
**Solución**: Recargar la página. Esto puede ocurrir si hay un error de red.

---

## 📊 Estructura de Respuestas

### Respuesta Exitosa
```json
{
  "success": true,
  "message": "Configuraciones guardadas correctamente",
  "data": {
    "evolution": {
      "id": 1,
      "api_url": "https://api.evolution.com",
      "api_key": "test-key",
      "instance_name": "cuenty-instance",
      "activo": true,
      "fecha_actualizacion": "2024-10-23T22:00:00.000Z"
    },
    "chatwoot": {
      "id": 1,
      "chatwoot_url": "https://chat.whatscloud.site",
      "access_token": "z8kpNiED3fW7KL6PcXoQJiQ4",
      "account_id": "3",
      "activo": true,
      "fecha_actualizacion": "2024-10-23T22:00:00.000Z"
    }
  }
}
```

### Respuesta de Error
```json
{
  "success": false,
  "error": "Error al guardar configuración de Evolution API"
}
```

---

## 🚀 Próximos Pasos Recomendados

1. **Validación de Credenciales**: Implementar validación de conexión al guardar (test de API)
2. **Logs de Auditoría**: Registrar quién y cuándo modifica las configuraciones
3. **Encriptación**: Considerar encriptar los tokens en la base de datos
4. **Múltiples Instancias**: Soporte para múltiples cuentas de Chatwoot o Evolution
5. **Backup de Configuración**: Sistema de respaldo antes de modificar

---

## 📄 Archivos Modificados

- `backend/routes/adminRoutes.js` - Rutas agregadas
- `backend/controllers/adminController.js` - Controladores agregados
- `frontend/admin/index.html` - Sección de configuración agregada
- `frontend/admin/admin-app.js` - Funciones de configuración agregadas
- `CONFIG_IMPLEMENTATION.md` - Este archivo de documentación

---

## ✅ Checklist de Implementación

- [x] Endpoints de backend creados
- [x] Controladores implementados
- [x] Manejo de errores implementado
- [x] Frontend HTML actualizado
- [x] JavaScript del frontend implementado
- [x] Notificaciones visuales agregadas
- [x] Documentación creada
- [ ] Testing realizado (pendiente de despliegue)
- [ ] Validación de credenciales en vivo
- [ ] Logs de auditoría

---

**Fecha de Implementación**: 23 de Octubre, 2024  
**Versión**: 1.0.0  
**Desarrollado para**: CUENTY MVP  
**Branch**: feature/admin-notifications-fix

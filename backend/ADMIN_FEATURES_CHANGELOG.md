# CUENTY - Admin Features Changelog

## 📝 Resumen

Se han agregado funcionalidades completas de administración al backend de CUENTY, incluyendo endpoints para gestión de servicios, planes, órdenes, cuentas de streaming, dashboard de estadísticas y configuración de Evolution API.

---

## 🆕 Archivos Nuevos Creados

### 1. Controllers
- **`controllers/adminController.js`**
  - Controlador principal con toda la lógica de negocio para administración
  - 659 líneas de código
  - Incluye manejo de errores y validaciones

### 2. Routes
- **`routes/adminRoutes.js`**
  - Rutas organizadas con middleware de autenticación y autorización
  - Todas las rutas protegidas con `verifyToken` y `verifyAdmin`
  - Base path: `/api/admin`

### 3. Documentation
- **`ADMIN_API_DOCUMENTATION.md`**
  - Documentación completa de todos los endpoints
  - Ejemplos de requests y responses
  - Códigos de error y notas de seguridad
  - Ejemplos de uso con cURL

### 4. Database Scripts
- **`database/insert_default_admin.sql`**
  - Script SQL para insertar usuario administrador por defecto
  - Credenciales: admin@cuenty.com / Admin123!
  - Incluye verificación y manejo de conflictos

---

## 📝 Archivos Modificados

### 1. Server.js
**Cambios:**
- Agregada nueva ruta: `/api/admin`
- Actualizado objeto de endpoints en la respuesta raíz
- Versión mantenida en 2.0.0

**Líneas modificadas:**
```javascript
// Línea 33: Nueva ruta admin
app.use('/api/admin', require('./routes/adminRoutes'));

// Línea 72: Nuevo endpoint en documentación
'admin': '/api/admin',
```

### 2. database/schema.sql
**Cambios:**
- Actualizada contraseña del administrador por defecto
- Nueva contraseña hasheada: Admin123!
- Email: admin@cuenty.com

**Líneas modificadas:**
```sql
-- Línea 337-340: Admin por defecto actualizado
INSERT INTO admins (username, password, email) VALUES
('admin', '$2a$10$.qHC00LExwdCytfPF3qGueIsrB1.FF474XmBQ/C4Q1MzHlGUdKO6i', 'admin@cuenty.com');
```

---

## 🎯 Funcionalidades Implementadas

### 1. ✅ Autenticación de Administradores
- **Login**: `POST /api/admin/login`
- **Perfil**: `GET /api/admin/profile`
- JWT con duración de 7 días
- Middleware de verificación de token y permisos

### 2. ✅ CRUD de Servicios de Streaming
- **Listar**: `GET /api/admin/services`
- **Crear**: `POST /api/admin/services`
- **Actualizar**: `PUT /api/admin/services/:id`
- **Eliminar**: `DELETE /api/admin/services/:id`

### 3. ✅ CRUD de Planes
- **Listar**: `GET /api/admin/plans`
  - Con filtro opcional por `id_servicio`
- **Crear**: `POST /api/admin/plans`
- **Actualizar**: `PUT /api/admin/plans/:id`
- **Eliminar**: `DELETE /api/admin/plans/:id`

### 4. ✅ Gestión de Órdenes
- **Listar**: `GET /api/admin/orders`
  - Filtros: estado, celular, fecha_desde, fecha_hasta
  - Paginación: limit, offset
- **Ver detalles**: `GET /api/admin/orders/:id`
  - Incluye items con credenciales asignadas
- **Actualizar estado**: `PUT /api/admin/orders/:id/status`
  - Estados: pendiente, pendiente_pago, pagada, en_proceso, entregada, cancelada
  - Actualiza automáticamente fecha_pago y fecha_entrega

### 5. ✅ CRUD de Cuentas de Streaming
- **Listar**: `GET /api/admin/accounts`
  - Filtros: id_plan, estado
  - Paginación: limit, offset
- **Crear**: `POST /api/admin/accounts`
  - Encriptación automática de credenciales
- **Actualizar**: `PUT /api/admin/accounts/:id`
- **Eliminar**: `DELETE /api/admin/accounts/:id`

### 6. ✅ Dashboard de Estadísticas
- **Endpoint**: `GET /api/admin/dashboard`
- **Métricas incluidas:**
  - Total de órdenes y desglose por estado
  - Ventas totales y confirmadas
  - Total de usuarios registrados
  - Servicios y planes activos
  - Estado del inventario de cuentas
  - Gráfica de ventas por día (últimos 30 días)
  - Top 5 servicios más vendidos

### 7. ✅ Configuración de Evolution API
- **Obtener**: `GET /api/admin/config/evolution`
- **Guardar**: `POST /api/admin/config/evolution`
- **Campos configurables:**
  - api_url: URL de la API
  - api_key: Clave de autenticación
  - instance_name: Nombre de la instancia
  - activo: Estado activo/inactivo
- **Característica especial:** Crea tabla automáticamente si no existe

---

## 🔐 Seguridad Implementada

### Middleware de Autenticación
- **verifyToken**: Valida JWT en header Authorization
- **verifyAdmin**: Verifica permisos de administrador
- Todas las rutas protegidas excepto login

### Validaciones
- Validación de datos de entrada en todos los endpoints
- Verificación de existencia de recursos antes de actualizar/eliminar
- Sanitización de parámetros de consulta

### Credenciales
- Hashing de contraseñas con bcrypt (rounds: 10)
- JWT Secret configurable vía variable de entorno
- Credenciales por defecto documentadas para cambio en producción

---

## 🗄️ Base de Datos

### Tablas Utilizadas
- `admins` - Ya existente en schema
- `servicios` - Ya existente
- `service_plans` - Ya existente
- `ordenes` - Ya existente
- `order_items` - Ya existente
- `inventario_cuentas` - Ya existente
- `usuarios` - Ya existente
- `evolution_config` - **NUEVA** (se crea automáticamente)

### Nueva Tabla: evolution_config
```sql
CREATE TABLE IF NOT EXISTS evolution_config (
    id INTEGER PRIMARY KEY DEFAULT 1,
    api_url TEXT,
    api_key TEXT,
    instance_name VARCHAR(100),
    activo BOOLEAN DEFAULT false,
    fecha_actualizacion TIMESTAMP DEFAULT NOW(),
    CONSTRAINT single_row CHECK (id = 1)
);
```

---

## 📦 Dependencias

### Ya Instaladas
- ✅ `jsonwebtoken` (^9.0.2)
- ✅ `bcryptjs` (^2.4.3)
- ✅ `express` (^4.18.2)
- ✅ `pg` (^8.11.3)
- ✅ `dotenv` (^16.3.1)

### No Requiere Instalación Adicional
Todas las dependencias necesarias ya están instaladas en el proyecto.

---

## 🚀 Cómo Usar

### 1. Inicializar Base de Datos
```bash
# Opción 1: Usar el schema completo
psql -U postgres -d cuenty_db -f database/schema.sql

# Opción 2: Solo insertar admin por defecto (si ya tienes la BD)
psql -U postgres -d cuenty_db -f database/insert_default_admin.sql
```

### 2. Configurar Variables de Entorno
El archivo `.env` ya está configurado correctamente. Variables relevantes:
```env
JWT_SECRET=cuenty-development-secret-key-change-in-production-2024
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/cuenty_db?sslmode=disable
```

### 3. Iniciar el Servidor
```bash
cd backend
npm run dev
# o
npm start
```

### 4. Probar el Login
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'
```

### 5. Usar el Token
```bash
# Guardar el token de la respuesta
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Hacer peticiones autenticadas
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

---

## 📊 Estructura de Respuestas

### Formato Estándar de Éxito
```json
{
  "success": true,
  "message": "Mensaje descriptivo",
  "data": {
    // Datos de respuesta
  }
}
```

### Formato Estándar de Error
```json
{
  "success": false,
  "error": "Descripción del error"
}
```

---

## 🧪 Testing

### Endpoints Disponibles para Pruebas

#### Sin Autenticación
- `POST /api/admin/login` - Login

#### Con Autenticación (requiere token)
- `GET /api/admin/profile` - Perfil del admin
- `GET /api/admin/dashboard` - Estadísticas
- `GET /api/admin/services` - Listar servicios
- `GET /api/admin/plans` - Listar planes
- `GET /api/admin/orders` - Listar órdenes
- `GET /api/admin/accounts` - Listar cuentas
- `GET /api/admin/config/evolution` - Config Evolution API

### Herramientas Recomendadas
- **Postman** - Colección de endpoints
- **cURL** - Línea de comandos
- **Thunder Client** (VS Code) - Extension
- **Insomnia** - Cliente REST

---

## 📁 Estructura de Archivos

```
backend/
├── controllers/
│   ├── adminController.js        ← NUEVO
│   ├── authController.js          (existente)
│   └── ...
├── routes/
│   ├── adminRoutes.js            ← NUEVO
│   ├── authRoutes.js              (existente)
│   └── ...
├── middleware/
│   └── auth.js                    (existente - usado por admin)
├── models/
│   ├── Servicio.js                (existente)
│   ├── ServicePlan.js             (existente)
│   ├── Cuenta.js                  (existente)
│   └── ...
├── database/
│   ├── schema.sql                 (modificado)
│   └── insert_default_admin.sql  ← NUEVO
├── server.js                      (modificado)
├── ADMIN_API_DOCUMENTATION.md    ← NUEVO
└── ADMIN_FEATURES_CHANGELOG.md   ← NUEVO (este archivo)
```

---

## ⚠️ Importante para Producción

### Cambios Necesarios Antes de Deploy

1. **Credenciales de Admin**
   - Cambiar email: admin@cuenty.com
   - Cambiar password: Admin123!

2. **JWT Secret**
   - Generar un JWT_SECRET fuerte y único
   - Actualizar en `.env`

3. **Base de Datos**
   - Usar conexión SSL en producción
   - Configurar DATABASE_URL con credenciales seguras

4. **CORS**
   - Configurar CORS_ORIGIN con el dominio específico
   - No usar `*` en producción

5. **Logging**
   - Implementar sistema de logs robusto
   - No exponer errores detallados al cliente

6. **Rate Limiting**
   - Agregar rate limiting a endpoints sensibles
   - Especialmente en `/api/admin/login`

---

## 🐛 Debugging

### Verificar Sintaxis
```bash
cd backend
node -c controllers/adminController.js
node -c routes/adminRoutes.js
node -c server.js
```

### Ver Logs del Servidor
```bash
npm run dev
# El servidor mostrará logs de:
# - Conexión a BD
# - Rutas registradas
# - Peticiones entrantes
# - Errores
```

### Verificar BD
```bash
# Verificar que existe el admin
psql -U postgres -d cuenty_db -c "SELECT * FROM admins;"

# Verificar servicios
psql -U postgres -d cuenty_db -c "SELECT * FROM servicios;"

# Verificar planes
psql -U postgres -d cuenty_db -c "SELECT * FROM service_plans LIMIT 5;"
```

---

## 📞 Soporte

Si encuentras algún problema:

1. Verificar logs del servidor
2. Revisar la documentación en `ADMIN_API_DOCUMENTATION.md`
3. Verificar que la BD esté correctamente inicializada
4. Verificar que el token sea válido (no expirado)
5. Consultar este changelog para entender los cambios

---

## ✅ Checklist de Implementación

- [x] Crear adminController.js con toda la lógica
- [x] Crear adminRoutes.js con todas las rutas
- [x] Actualizar server.js para incluir rutas admin
- [x] Crear script SQL para admin por defecto
- [x] Actualizar schema.sql con nuevas credenciales
- [x] Crear documentación completa de API
- [x] Verificar sintaxis de todos los archivos
- [x] Documentar cambios en changelog

---

## 🎉 ¡Listo para Usar!

El backend de CUENTY ahora cuenta con un panel de administración completo y robusto. Todos los endpoints están documentados, protegidos y listos para ser consumidos por el frontend.

**Última actualización:** 17 de Octubre de 2024

# Changelog - CUENTY Backend API

## [2.0.0] - 2024-10-17

### 🎉 Major E-Commerce Enhancement

Esta versión transforma CUENTY de un sistema básico a una plataforma e-commerce completa.

### ✨ Nuevas Características

#### Autenticación de Usuarios
- ✅ Registro y login con número de teléfono
- ✅ Verificación por código de 6 dígitos (SMS/WhatsApp ready)
- ✅ JWT tokens con expiración de 7 días
- ✅ Gestión de perfil de usuario
- ✅ Preferencias de método de entrega

#### Catálogo de Servicios
- ✅ Gestión de servicios (Netflix, Disney+, HBO Max, Prime Video, Spotify)
- ✅ Múltiples planes por servicio (1, 3, 6, 12 meses)
- ✅ Sistema de precios: Costo + Margen de Ganancia = Precio de Venta
- ✅ Cálculo automático de duración en días
- ✅ Filtrado de servicios y planes activos

#### Carrito de Compras
- ✅ Agregar items con cantidad
- ✅ Actualizar cantidades
- ✅ Eliminar items
- ✅ Vaciar carrito
- ✅ Verificación de disponibilidad de stock
- ✅ Cálculo automático de totales

#### Órdenes Mejoradas
- ✅ Crear orden desde carrito
- ✅ Items múltiples por orden
- ✅ Estados de orden: pendiente, pendiente_pago, pagada, en_proceso, entregada, cancelada
- ✅ Instrucciones de pago automáticas
- ✅ Asignación automática de credenciales
- ✅ Tracking de entrega de credenciales
- ✅ Historial de órdenes por usuario

#### Panel de Administración
- ✅ CRUD completo de servicios y planes
- ✅ Gestión de precios y márgenes
- ✅ Vista de todas las órdenes con filtros
- ✅ Cambio de estados de orden
- ✅ Asignación de credenciales a órdenes
- ✅ Dashboard con estadísticas
- ✅ Notas administrativas en órdenes

#### Validaciones y Seguridad
- ✅ Validación de entrada con express-validator
- ✅ Middleware de autenticación mejorado (admin/user)
- ✅ Validación de formato de teléfono
- ✅ Validación de códigos de verificación
- ✅ Rate limiting en verificaciones (máx 5 intentos)
- ✅ Expiración de códigos (10 minutos)

### 🗄️ Base de Datos

#### Nuevas Tablas
- `phone_verifications` - Códigos de verificación telefónica
- `servicios` - Catálogo de servicios de streaming
- `service_plans` - Planes con precios y duración
- `shopping_cart` - Carrito de compras
- `order_items` - Items de órdenes (relación muchos a muchos)
- `payment_instructions` - Instrucciones de pago bancario

#### Tablas Modificadas
- `usuarios` - Agregados: nombre, email, verificado, metodo_entrega_preferido
- `ordenes` - Refactorizada para múltiples items
- `inventario_cuentas` - Actualizada para usar id_plan

#### Vistas
- `productos` - Vista de compatibilidad (service_plans + servicios)

### 📡 Nuevos Endpoints

#### Autenticación Usuario
```
POST   /api/auth/user/phone/request-code
POST   /api/auth/user/phone/verify-code
GET    /api/auth/user/profile
PUT    /api/auth/user/profile
POST   /api/auth/user/logout
```

#### Servicios
```
GET    /api/servicios/activos
GET    /api/servicios/:id
GET    /api/servicios (admin)
POST   /api/servicios (admin)
PUT    /api/servicios/:id (admin)
DELETE /api/servicios/:id (admin)
```

#### Planes
```
GET    /api/planes/activos
GET    /api/planes/:id
GET    /api/planes (admin)
POST   /api/planes (admin)
PUT    /api/planes/:id (admin)
DELETE /api/planes/:id (admin)
```

#### Carrito
```
GET    /api/cart
POST   /api/cart/items
PUT    /api/cart/items
DELETE /api/cart/items/:id_plan
DELETE /api/cart
GET    /api/cart/disponibilidad
```

#### Órdenes Mejoradas
```
POST   /api/ordenes-new
GET    /api/ordenes-new/mis-ordenes
GET    /api/ordenes-new/:id
GET    /api/ordenes-new (admin)
PUT    /api/ordenes-new/:id/estado (admin)
POST   /api/ordenes-new/items/:id/asignar (admin)
POST   /api/ordenes-new/items/:id/entregar (admin)
GET    /api/ordenes-new/admin/estadisticas (admin)
```

### 📚 Documentación

- ✅ README.md completo con badges y ejemplos
- ✅ API_DOCUMENTATION.md con todos los endpoints
- ✅ SETUP_GUIDE.md con guía de instalación paso a paso
- ✅ CHANGELOG.md (este archivo)
- ✅ PDFs generados automáticamente

### 🔧 Mejoras Técnicas

#### Modelos
- `PhoneVerification.js` - Generación y validación de códigos
- `Servicio.js` - Gestión de servicios
- `ServicePlan.js` - Gestión de planes
- `ShoppingCart.js` - Carrito de compras
- `OrdenEnhanced.js` - Órdenes con múltiples items
- `Usuario.js` - Mejorado con nuevos campos

#### Controllers
- `authEnhancedController.js` - Auth con teléfono
- `servicioController.js` - CRUD de servicios
- `servicePlanController.js` - CRUD de planes
- `cartController.js` - Operaciones de carrito
- `ordenEnhancedController.js` - Gestión avanzada de órdenes

#### Middleware
- `validation.js` - Validaciones centralizadas
- `auth.js` - Mejorado con verifyUser y optionalToken

### 🎯 Datos de Ejemplo

Incluidos en schema.sql:
- 5 servicios (Netflix, Disney+, HBO Max, Prime Video, Spotify)
- 20 planes (4 por servicio: 1, 3, 6, 12 meses)
- Precios configurados con costo + margen
- Instrucciones de pago bancario de ejemplo
- Admin por defecto (admin/admin123)

### 📊 Estadísticas del Proyecto

- **Archivos nuevos**: 21
- **Archivos modificados**: 4
- **Líneas de código**: ~3,500+
- **Endpoints**: 40+
- **Tablas DB**: 13
- **Modelos**: 10
- **Controllers**: 8

### 🔄 Compatibilidad

- ✅ Mantiene endpoints legacy para compatibilidad
- ✅ Vista `productos` para código antiguo
- ✅ Rutas antiguas siguen funcionando
- ✅ Migración no destructiva

### ⚠️ Breaking Changes

Ninguno. Esta versión es 100% compatible con código existente.

### 🚀 Próximas Mejoras (Roadmap)

- [ ] Integración real con Twilio/WhatsApp API
- [ ] Pagos en línea (Stripe/MercadoPago)
- [ ] Sistema de notificaciones
- [ ] Dashboard de analytics
- [ ] Tests automatizados
- [ ] Rate limiting global
- [ ] Webhooks para integraciones

### 📝 Notas de Migración

#### Si tienes una instalación existente:

1. Backup de base de datos:
```bash
pg_dump cuenty_db > backup_pre_v2.sql
```

2. Aplicar nuevo esquema:
```bash
psql -d cuenty_db -f database/schema.sql
```

3. Actualizar dependencias:
```bash
npm install
```

4. Configurar .env con nuevas variables

5. Reiniciar servidor

### 🐛 Bugs Corregidos

- Mejorada validación de entrada en todos los endpoints
- Corregida gestión de tokens
- Mejorado manejo de errores
- Optimizadas consultas SQL

### 📞 Contacto

- GitHub: [Repository]
- Email: admin@cuenty.com
- Documentación: /backend/API_DOCUMENTATION.md

---

## [1.0.0] - 2024-10-16

### Versión Inicial

- Sistema básico de gestión de cuentas
- Autenticación de admin
- CRUD de productos
- Gestión de órdenes simple
- Sistema de tickets

---

**Mantenido por**: CUENTY Team  
**Licencia**: ISC

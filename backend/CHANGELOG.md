Here's the result of running `cat -n` on /home/ubuntu/cuenty_mvp/backend/CHANGELOG.md:
     1	# Changelog - CUENTY Backend API
## [1.0.3] - 2024-10-21

### 🔧 Corrección de Endpoint de Autenticación

Esta versión corrige problemas críticos en el endpoint de registro de administradores y migra el código para usar Prisma Client correctamente.

### ✨ Mejoras

#### Migración a Prisma Client
- ✅ Reemplazadas queries SQL directas por Prisma Client
- ✅ Uso consistente del ORM en todo el controlador de autenticación
- ✅ Eliminada creación de tabla en cada request (optimización de performance)
- ✅ Mejor manejo de transacciones y conexiones

#### Validación Robusta
- ✅ Validación de username (3-50 caracteres, solo alfanuméricos, guiones y guiones bajos)
- ✅ Validación de password (mínimo 6 caracteres, máximo 100)
- ✅ Validación de formato de email con expresión regular
- ✅ Verificación de unicidad de username y email
- ✅ Normalización de datos (trim y toLowerCase)

#### Manejo de Errores
- ✅ Mensajes de error específicos y descriptivos
- ✅ Manejo de códigos de error de Prisma (P2002 para duplicados)
- ✅ Respuestas consistentes con formato { success, error, data }
- ✅ Detalles de error en modo desarrollo

#### Seguridad
- ✅ Bcrypt con 10 rounds para hash de contraseñas
- ✅ Prevención de ataques de enumeración de usuarios
- ✅ Validación estricta de tipos de datos

### 🐛 Correcciones
- 🔧 Eliminada creación de tabla `admins` en cada request
- 🔧 Corregida inconsistencia entre schema Prisma y queries SQL
- 🔧 Mejorada gestión de conexiones a base de datos
- 🔧 Corregido manejo de campos opcionales (email)

### 📝 Documentación
- ✅ Comentarios mejorados en el código
- ✅ Validaciones documentadas en funciones auxiliares

     2	
     3	## [2.0.0] - 2024-10-17
     4	
     5	### 🎉 Major E-Commerce Enhancement
     6	
     7	Esta versión transforma CUENTY de un sistema básico a una plataforma e-commerce completa.
     8	
     9	### ✨ Nuevas Características
    10	
    11	#### Autenticación de Usuarios
    12	- ✅ Registro y login con número de teléfono
    13	- ✅ Verificación por código de 6 dígitos (SMS/WhatsApp ready)
    14	- ✅ JWT tokens con expiración de 7 días
    15	- ✅ Gestión de perfil de usuario
    16	- ✅ Preferencias de método de entrega
    17	
    18	#### Catálogo de Servicios
    19	- ✅ Gestión de servicios (Netflix, Disney+, HBO Max, Prime Video, Spotify)
    20	- ✅ Múltiples planes por servicio (1, 3, 6, 12 meses)
    21	- ✅ Sistema de precios: Costo + Margen de Ganancia = Precio de Venta
    22	- ✅ Cálculo automático de duración en días
    23	- ✅ Filtrado de servicios y planes activos
    24	
    25	#### Carrito de Compras
    26	- ✅ Agregar items con cantidad
    27	- ✅ Actualizar cantidades
    28	- ✅ Eliminar items
    29	- ✅ Vaciar carrito
    30	- ✅ Verificación de disponibilidad de stock
    31	- ✅ Cálculo automático de totales
    32	
    33	#### Órdenes Mejoradas
    34	- ✅ Crear orden desde carrito
    35	- ✅ Items múltiples por orden
    36	- ✅ Estados de orden: pendiente, pendiente_pago, pagada, en_proceso, entregada, cancelada
    37	- ✅ Instrucciones de pago automáticas
    38	- ✅ Asignación automática de credenciales
    39	- ✅ Tracking de entrega de credenciales
    40	- ✅ Historial de órdenes por usuario
    41	
    42	#### Panel de Administración
    43	- ✅ CRUD completo de servicios y planes
    44	- ✅ Gestión de precios y márgenes
    45	- ✅ Vista de todas las órdenes con filtros
    46	- ✅ Cambio de estados de orden
    47	- ✅ Asignación de credenciales a órdenes
    48	- ✅ Dashboard con estadísticas
    49	- ✅ Notas administrativas en órdenes
    50	
    51	#### Validaciones y Seguridad
    52	- ✅ Validación de entrada con express-validator
    53	- ✅ Middleware de autenticación mejorado (admin/user)
    54	- ✅ Validación de formato de teléfono
    55	- ✅ Validación de códigos de verificación
    56	- ✅ Rate limiting en verificaciones (máx 5 intentos)
    57	- ✅ Expiración de códigos (10 minutos)
    58	
    59	### 🗄️ Base de Datos
    60	
    61	#### Nuevas Tablas
    62	- `phone_verifications` - Códigos de verificación telefónica
    63	- `servicios` - Catálogo de servicios de streaming
    64	- `service_plans` - Planes con precios y duración
    65	- `shopping_cart` - Carrito de compras
    66	- `order_items` - Items de órdenes (relación muchos a muchos)
    67	- `payment_instructions` - Instrucciones de pago bancario
    68	
    69	#### Tablas Modificadas
    70	- `usuarios` - Agregados: nombre, email, verificado, metodo_entrega_preferido
    71	- `ordenes` - Refactorizada para múltiples items
    72	- `inventario_cuentas` - Actualizada para usar id_plan
    73	
    74	#### Vistas
    75	- `productos` - Vista de compatibilidad (service_plans + servicios)
    76	
    77	### 📡 Nuevos Endpoints
    78	
    79	#### Autenticación Usuario
    80	```
    81	POST   /api/auth/user/phone/request-code
    82	POST   /api/auth/user/phone/verify-code
    83	GET    /api/auth/user/profile
    84	PUT    /api/auth/user/profile
    85	POST   /api/auth/user/logout
    86	```
    87	
    88	#### Servicios
    89	```
    90	GET    /api/servicios/activos
    91	GET    /api/servicios/:id
    92	GET    /api/servicios (admin)
    93	POST   /api/servicios (admin)
    94	PUT    /api/servicios/:id (admin)
    95	DELETE /api/servicios/:id (admin)
    96	```
    97	
    98	#### Planes
    99	```
   100	GET    /api/planes/activos
   101	GET    /api/planes/:id
   102	GET    /api/planes (admin)
   103	POST   /api/planes (admin)
   104	PUT    /api/planes/:id (admin)
   105	DELETE /api/planes/:id (admin)
   106	```
   107	
   108	#### Carrito
   109	```
   110	GET    /api/cart
   111	POST   /api/cart/items
   112	PUT    /api/cart/items
   113	DELETE /api/cart/items/:id_plan
   114	DELETE /api/cart
   115	GET    /api/cart/disponibilidad
   116	```
   117	
   118	#### Órdenes Mejoradas
   119	```
   120	POST   /api/ordenes-new
   121	GET    /api/ordenes-new/mis-ordenes
   122	GET    /api/ordenes-new/:id
   123	GET    /api/ordenes-new (admin)
   124	PUT    /api/ordenes-new/:id/estado (admin)
   125	POST   /api/ordenes-new/items/:id/asignar (admin)
   126	POST   /api/ordenes-new/items/:id/entregar (admin)
   127	GET    /api/ordenes-new/admin/estadisticas (admin)
   128	```
   129	
   130	### 📚 Documentación
   131	
   132	- ✅ README.md completo con badges y ejemplos
   133	- ✅ API_DOCUMENTATION.md con todos los endpoints
   134	- ✅ SETUP_GUIDE.md con guía de instalación paso a paso
   135	- ✅ CHANGELOG.md (este archivo)
   136	- ✅ PDFs generados automáticamente
   137	
   138	### 🔧 Mejoras Técnicas
   139	
   140	#### Modelos
   141	- `PhoneVerification.js` - Generación y validación de códigos
   142	- `Servicio.js` - Gestión de servicios
   143	- `ServicePlan.js` - Gestión de planes
   144	- `ShoppingCart.js` - Carrito de compras
   145	- `OrdenEnhanced.js` - Órdenes con múltiples items
   146	- `Usuario.js` - Mejorado con nuevos campos
   147	
   148	#### Controllers
   149	- `authEnhancedController.js` - Auth con teléfono
   150	- `servicioController.js` - CRUD de servicios
   151	- `servicePlanController.js` - CRUD de planes
   152	- `cartController.js` - Operaciones de carrito
   153	- `ordenEnhancedController.js` - Gestión avanzada de órdenes
   154	
   155	#### Middleware
   156	- `validation.js` - Validaciones centralizadas
   157	- `auth.js` - Mejorado con verifyUser y optionalToken
   158	
   159	### 🎯 Datos de Ejemplo
   160	
   161	Incluidos en schema.sql:
   162	- 5 servicios (Netflix, Disney+, HBO Max, Prime Video, Spotify)
   163	- 20 planes (4 por servicio: 1, 3, 6, 12 meses)
   164	- Precios configurados con costo + margen
   165	- Instrucciones de pago bancario de ejemplo
   166	- Admin por defecto (admin/admin123)
   167	
   168	### 📊 Estadísticas del Proyecto
   169	
   170	- **Archivos nuevos**: 21
   171	- **Archivos modificados**: 4
   172	- **Líneas de código**: ~3,500+
   173	- **Endpoints**: 40+
   174	- **Tablas DB**: 13
   175	- **Modelos**: 10
   176	- **Controllers**: 8
   177	
   178	### 🔄 Compatibilidad
   179	
   180	- ✅ Mantiene endpoints legacy para compatibilidad
   181	- ✅ Vista `productos` para código antiguo
   182	- ✅ Rutas antiguas siguen funcionando
   183	- ✅ Migración no destructiva
   184	
   185	### ⚠️ Breaking Changes
   186	
   187	Ninguno. Esta versión es 100% compatible con código existente.
   188	
   189	### 🚀 Próximas Mejoras (Roadmap)
   190	
   191	- [ ] Integración real con Twilio/WhatsApp API
   192	- [ ] Pagos en línea (Stripe/MercadoPago)
   193	- [ ] Sistema de notificaciones
   194	- [ ] Dashboard de analytics
   195	- [ ] Tests automatizados
   196	- [ ] Rate limiting global
   197	- [ ] Webhooks para integraciones
   198	
   199	### 📝 Notas de Migración
   200	
   201	#### Si tienes una instalación existente:
   202	
   203	1. Backup de base de datos:
   204	```bash
   205	pg_dump cuenty_db > backup_pre_v2.sql
   206	```
   207	
   208	2. Aplicar nuevo esquema:
   209	```bash
   210	psql -d cuenty_db -f database/schema.sql
   211	```
   212	
   213	3. Actualizar dependencias:
   214	```bash
   215	npm install
   216	```
   217	
   218	4. Configurar .env con nuevas variables
   219	
   220	5. Reiniciar servidor
   221	
   222	### 🐛 Bugs Corregidos
   223	
   224	- Mejorada validación de entrada en todos los endpoints
   225	- Corregida gestión de tokens
   226	- Mejorado manejo de errores
   227	- Optimizadas consultas SQL
   228	
   229	### 📞 Contacto
   230	
   231	- GitHub: [Repository]
   232	- Email: admin@cuenty.com
   233	- Documentación: /backend/API_DOCUMENTATION.md
   234	
   235	---
   236	
   237	## [1.0.0] - 2024-10-16
   238	
   239	### Versión Inicial
   240	
   241	- Sistema básico de gestión de cuentas
   242	- Autenticación de admin
   243	- CRUD de productos
   244	- Gestión de órdenes simple
   245	- Sistema de tickets
   246	
   247	---
   248	
   249	**Mantenido por**: CUENTY Team  
   250	**Licencia**: ISC
   251	
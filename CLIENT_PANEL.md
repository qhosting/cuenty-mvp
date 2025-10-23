# Panel de Clientes - CUENTY MVP

## 📋 Descripción

Sistema completo de gestión de clientes para CUENTY MVP que permite a los usuarios registrados gestionar sus suscripciones, ver el historial de pedidos y administrar su perfil.

## 🎯 Características Implementadas

### Backend

#### 1. Modelo de Base de Datos

**Tabla `clientes`:**
- `id` - ID único del cliente
- `email` - Email único (usado para login)
- `password` - Contraseña hasheada con bcrypt
- `nombre` - Nombre del cliente
- `apellido` - Apellido del cliente
- `telefono` - Teléfono (opcional)
- `whatsapp` - WhatsApp (opcional)
- `emailVerificado` - Boolean para verificación de email
- `activo` - Estado de la cuenta
- `fechaCreacion` - Fecha de registro
- `fechaActualizacion` - Última actualización
- `ultimoAcceso` - Último inicio de sesión
- `resetPasswordToken` - Token para recuperación de contraseña
- `resetPasswordExpires` - Expiración del token

**Relación con `ordenes`:**
- Campo `clienteId` en tabla `ordenes` (opcional)
- Permite asociar órdenes a clientes registrados
- Mantiene compatibilidad con órdenes de invitados

#### 2. Sistema de Autenticación

**Endpoints de Autenticación:**
- `POST /api/client/auth/register` - Registro de nuevo cliente
- `POST /api/client/auth/login` - Login de cliente
- `POST /api/client/auth/forgot-password` - Solicitar recuperación de contraseña
- `POST /api/client/auth/reset-password` - Resetear contraseña con token

**Seguridad:**
- Contraseñas hasheadas con bcrypt (10 rounds)
- Tokens JWT con expiración de 7 días
- Validación de email único
- Mínimo 6 caracteres para contraseñas
- Separación completa de autenticación admin/cliente

#### 3. Gestión de Perfil

**Endpoints:**
- `GET /api/client/profile` - Obtener perfil del cliente
- `PUT /api/client/profile` - Actualizar datos personales
- `PUT /api/client/change-password` - Cambiar contraseña

#### 4. Gestión de Órdenes y Cuentas

**Endpoints:**
- `GET /api/client/dashboard` - Dashboard con resumen de información
- `GET /api/client/orders` - Historial de pedidos (con paginación)
- `GET /api/client/orders/:id` - Detalle de un pedido específico
- `GET /api/client/accounts` - Cuentas activas del cliente
- `GET /api/client/accounts/:id/credentials` - Obtener credenciales de cuenta

**Funcionalidades:**
- Dashboard con estadísticas (cuentas activas, próximos vencimientos)
- Historial completo de pedidos con estados
- Visualización de cuentas activas
- Acceso seguro a credenciales (solo para cuentas asignadas y no vencidas)
- Filtrado por servicio
- Paginación en listado de órdenes

### Frontend

#### 1. Páginas de Autenticación

**Login (`/client/login`):**
- Formulario de login con email y contraseña
- Validación de campos
- Manejo de errores
- Link a registro y recuperación de contraseña

**Registro (`/client/register`):**
- Formulario completo de registro
- Validación de contraseñas (coincidencia y longitud)
- Campos opcionales (teléfono, whatsapp)
- Link a login

**Recuperación de Contraseña (`/client/forgot-password`):**
- Solicitud de recuperación por email
- Mensaje de confirmación
- Link a login

#### 2. Panel de Clientes

**Layout:**
- Sidebar con navegación
- Header con información del cliente
- Logout
- Responsive (móvil y desktop)
- Protección de rutas (redirect a login si no autenticado)

**Dashboard (`/client/dashboard`):**
- Estadísticas:
  - Cuentas activas
  - Cuentas próximas a vencer
  - Total de pedidos
- Próximos vencimientos (últimos 5)
- Últimas órdenes (últimas 5)
- Acciones rápidas

**Mis Cuentas (`/client/accounts`):**
- Grid de cuentas activas
- Logo y nombre del servicio
- Información del plan
- Días restantes (con código de colores)
- Modal para ver credenciales:
  - Usuario/Email
  - Contraseña
  - Perfil (si aplica)
  - PIN (si aplica)
  - Notas
  - Botón para copiar credenciales
  - Advertencia de seguridad

**Historial de Pedidos (`/client/orders`):**
- Lista de todas las órdenes
- Estado del pedido y pago
- Items de cada orden
- Total pagado
- Modal con instrucciones de pago (para pedidos pendientes)
- Notas del administrador

**Mi Perfil (`/client/profile`):**
- Tabs para:
  - Información personal (nombre, apellido, teléfono, whatsapp)
  - Cambiar contraseña
- Formularios de actualización
- Validación en frontend
- Mensajes de éxito/error

#### 3. Servicios y Utilidades

**`lib/client-auth.ts`:**
- Funciones para autenticación
- Gestión de tokens en localStorage
- Validación de sesión

**`lib/client-api.ts`:**
- Funciones para consumir API
- Tipos TypeScript para datos
- Manejo de errores

## 🔧 Integración con Sistema Existente

### Compatibilidad

1. **Usuarios Legacy:**
   - El sistema actual de usuarios con teléfono se mantiene
   - Los clientes registrados son adicionales
   - Una orden puede tener `celularUsuario` y opcionalmente `clienteId`

2. **Proceso de Compra:**
   - Si el usuario está autenticado como cliente, la orden se asocia automáticamente
   - Si no está autenticado, la orden se crea como invitado (solo con celular)
   - Middleware combinado permite ambos tipos de autenticación

3. **Entrega de Credenciales:**
   - Sistema actual de entrega por WhatsApp/Email se mantiene
   - Clientes registrados pueden acceder a credenciales desde el panel
   - Mayor comodidad sin depender de mensajes externos

## 📊 Flujo de Usuario

### Nuevo Cliente

1. Usuario visita el sitio y explora catálogo
2. Decide crear cuenta para mejor gestión
3. Se registra en `/client/register`
4. Login automático y redirección a dashboard
5. Puede realizar compras (asociadas a su cuenta)
6. Accede a sus cuentas y pedidos desde el panel

### Cliente Existente

1. Login en `/client/login`
2. Dashboard muestra resumen de actividad
3. Puede:
   - Ver y copiar credenciales de cuentas activas
   - Revisar historial de pedidos
   - Actualizar su perfil
   - Realizar nuevas compras

## 🔒 Seguridad

### Implementada

1. **Autenticación:**
   - JWT separado para clientes y admins
   - Tokens con expiración
   - Validación en cada request

2. **Contraseñas:**
   - Hasheadas con bcrypt
   - Mínimo 6 caracteres
   - Validación en registro y cambio

3. **Acceso a Credenciales:**
   - Solo para cuentas asignadas al cliente
   - Verificación de propiedad
   - No accesibles si la cuenta está vencida

4. **Protección de Rutas:**
   - Frontend valida autenticación
   - Backend valida tokens en todas las rutas protegidas

### Pendiente (Futuras Mejoras)

1. Verificación de email
2. 2FA (autenticación de dos factores)
3. Historial de sesiones
4. Notificaciones de actividad sospechosa

## 🚀 Uso

### Para Desarrolladores

**Iniciar el sistema:**

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend
cd nextjs_space
npm install
npm run dev
```

**Variables de entorno necesarias:**

```env
# Backend
DATABASE_URL=postgresql://...
JWT_SECRET=tu-secreto-jwt
ENCRYPTION_KEY=tu-clave-encriptacion

# Frontend
NEXT_PUBLIC_API_URL=http://localhost:3000
```

### Para Clientes

1. **Registro:**
   - Visita `/client/register`
   - Completa el formulario
   - Inicia sesión automáticamente

2. **Login:**
   - Visita `/client/login`
   - Ingresa email y contraseña
   - Accede al dashboard

3. **Gestión de Cuentas:**
   - Navega a "Mis Cuentas"
   - Haz clic en "Ver Credenciales"
   - Copia las credenciales necesarias

4. **Historial de Pedidos:**
   - Navega a "Mis Pedidos"
   - Revisa el estado de cada pedido
   - Ve instrucciones de pago si es necesario

## 📝 Notas Técnicas

### Decisiones de Diseño

1. **Separación de Autenticación:**
   - Admin y Cliente usan el mismo JWT_SECRET pero tokens diferentes
   - Identificadores distintos (`isAdmin` vs `isCliente`)
   - Middlewares separados para cada tipo

2. **Órdenes Híbridas:**
   - Mantener `celularUsuario` obligatorio
   - `clienteId` opcional permite transición gradual
   - Compatibilidad con sistema legacy

3. **Credenciales:**
   - Desencriptación solo cuando se solicitan explícitamente
   - No se envían por defecto en listados
   - Modal con advertencia de seguridad

### Estructura de Archivos

```
backend/
├── controllers/
│   ├── clientAuthController.js    # Autenticación de clientes
│   └── clientController.js         # Operaciones de clientes
├── middleware/
│   └── clientAuth.js              # Middleware JWT de clientes
├── routes/
│   └── clientRoutes.js            # Rutas del panel de clientes
└── models/
    └── OrdenEnhanced.js           # Actualizado con clienteId

nextjs_space/
├── app/
│   └── client/
│       ├── layout.tsx             # Layout del panel
│       ├── login/
│       ├── register/
│       ├── forgot-password/
│       ├── dashboard/
│       ├── accounts/
│       ├── orders/
│       └── profile/
└── lib/
    ├── client-auth.ts             # Servicio de autenticación
    └── client-api.ts              # Funciones de API
```

## 🐛 Troubleshooting

### Error: Token inválido
- Verifica que el JWT_SECRET sea el mismo en backend y que esté configurado
- Verifica que el token no haya expirado (7 días)
- Intenta cerrar sesión y volver a iniciar

### Error: No se muestran las credenciales
- Verifica que la cuenta esté asignada y no vencida
- Verifica que el ENCRYPTION_KEY sea correcto
- Revisa logs del servidor para errores de desencriptación

### Error: No se pueden ver las órdenes
- Verifica que las órdenes tengan el `clienteId` asociado
- Para órdenes antiguas (sin clienteId), no aparecerán en el panel
- Considera migrar órdenes existentes si es necesario

## 🔄 Próximos Pasos

1. **Notificaciones:**
   - Email de bienvenida
   - Alertas de vencimiento próximo
   - Confirmación de pedidos

2. **Renovaciones:**
   - Sistema de renovación automática
   - Recordatorios antes del vencimiento
   - Proceso simplificado de recompra

3. **Soporte:**
   - Sistema de tickets integrado en el panel
   - Chat en vivo
   - Base de conocimientos

4. **Métricas:**
   - Dashboard de analytics para clientes
   - Historial de uso
   - Estadísticas de ahorro

## 👥 Contacto y Soporte

Para soporte o consultas sobre el sistema de clientes, contactar al equipo de desarrollo de CUENTY.

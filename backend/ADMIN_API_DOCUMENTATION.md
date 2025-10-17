# CUENTY - Admin API Documentation

## Índice
1. [Autenticación](#autenticación)
2. [Servicios de Streaming](#servicios-de-streaming)
3. [Planes](#planes)
4. [Gestión de Órdenes](#gestión-de-órdenes)
5. [Cuentas de Streaming](#cuentas-de-streaming)
6. [Dashboard](#dashboard)
7. [Configuración Evolution API](#configuración-evolution-api)

---

## Credenciales por Defecto

**Email:** admin@cuenty.com  
**Password:** Admin123!

⚠️ **IMPORTANTE**: Cambiar estas credenciales en producción.

---

## Autenticación

### Login de Administrador

**Endpoint:** `POST /api/admin/login`

**Request Body:**
```json
{
  "username": "admin",
  "password": "Admin123!"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Login exitoso",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 1,
      "username": "admin",
      "email": "admin@cuenty.com"
    }
  }
}
```

### Obtener Perfil

**Endpoint:** `GET /api/admin/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "username": "admin",
    "email": "admin@cuenty.com",
    "fecha_creacion": "2024-10-17T00:00:00.000Z"
  }
}
```

---

## Servicios de Streaming

### Listar Todos los Servicios

**Endpoint:** `GET /api/admin/services`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (Success):**
```json
{
  "success": true,
  "data": [
    {
      "id_servicio": 1,
      "nombre": "Netflix",
      "descripcion": "Plataforma líder de streaming",
      "logo_url": "https://upload.wikimedia.org/wikipedia/commons/thumb/6/69/Netflix_logo.svg/2560px-Netflix_logo.svg.png",
      "categoria": "streaming",
      "activo": true,
      "fecha_creacion": "2024-10-17T00:00:00.000Z",
      "total_planes": 4
    }
  ]
}
```

### Crear Servicio

**Endpoint:** `POST /api/admin/services`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "nombre": "Apple TV+",
  "descripcion": "Contenido original de Apple",
  "logo_url": "https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg",
  "categoria": "streaming"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Servicio creado correctamente",
  "data": {
    "id_servicio": 6,
    "nombre": "Apple TV+",
    "descripcion": "Contenido original de Apple",
    "logo_url": "https://upload.wikimedia.org/wikipedia/en/a/ae/Apple_TV_%28logo%29.svg",
    "categoria": "streaming",
    "activo": true,
    "fecha_creacion": "2024-10-17T00:00:00.000Z"
  }
}
```

### Actualizar Servicio

**Endpoint:** `PUT /api/admin/services/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "nombre": "Netflix Premium",
  "descripcion": "Nueva descripción",
  "activo": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Servicio actualizado correctamente",
  "data": {
    "id_servicio": 1,
    "nombre": "Netflix Premium",
    "descripcion": "Nueva descripción",
    "activo": true
  }
}
```

### Eliminar Servicio

**Endpoint:** `DELETE /api/admin/services/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Servicio desactivado correctamente"
}
```

---

## Planes

### Listar Todos los Planes

**Endpoint:** `GET /api/admin/plans`

**Query Parameters:**
- `id_servicio` (opcional): Filtrar por servicio

**Headers:**
```
Authorization: Bearer {token}
```

**Ejemplos:**
- `/api/admin/plans` - Todos los planes
- `/api/admin/plans?id_servicio=1` - Solo planes de Netflix

**Response (Success):**
```json
{
  "success": true,
  "data": [
    {
      "id_plan": 1,
      "id_servicio": 1,
      "nombre_servicio": "Netflix",
      "nombre_plan": "1 Mes",
      "duracion_meses": 1,
      "duracion_dias": 30,
      "costo": 120.00,
      "margen_ganancia": 30.00,
      "precio_venta": 150.00,
      "descripcion": "Netflix Premium - 1 pantalla HD",
      "activo": true,
      "fecha_creacion": "2024-10-17T00:00:00.000Z"
    }
  ]
}
```

### Crear Plan

**Endpoint:** `POST /api/admin/plans`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "id_servicio": 1,
  "nombre_plan": "2 Meses",
  "duracion_meses": 2,
  "costo": 230.00,
  "margen_ganancia": 50.00,
  "descripcion": "Netflix Premium - 1 pantalla HD por 2 meses"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Plan creado correctamente",
  "data": {
    "id_plan": 21,
    "id_servicio": 1,
    "nombre_plan": "2 Meses",
    "duracion_meses": 2,
    "duracion_dias": 60,
    "costo": 230.00,
    "margen_ganancia": 50.00,
    "precio_venta": 280.00,
    "descripcion": "Netflix Premium - 1 pantalla HD por 2 meses",
    "activo": true
  }
}
```

### Actualizar Plan

**Endpoint:** `PUT /api/admin/plans/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "costo": 250.00,
  "margen_ganancia": 60.00,
  "descripcion": "Plan actualizado",
  "activo": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Plan actualizado correctamente",
  "data": {
    "id_plan": 1,
    "precio_venta": 310.00
  }
}
```

### Eliminar Plan

**Endpoint:** `DELETE /api/admin/plans/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Plan desactivado correctamente"
}
```

---

## Gestión de Órdenes

### Listar Órdenes

**Endpoint:** `GET /api/admin/orders`

**Query Parameters:**
- `estado` (opcional): pendiente, pendiente_pago, pagada, en_proceso, entregada, cancelada
- `celular` (opcional): Número de celular del usuario
- `fecha_desde` (opcional): Fecha inicio (YYYY-MM-DD)
- `fecha_hasta` (opcional): Fecha fin (YYYY-MM-DD)
- `limit` (opcional): Número de resultados (default: 50)
- `offset` (opcional): Offset para paginación (default: 0)

**Headers:**
```
Authorization: Bearer {token}
```

**Ejemplos:**
- `/api/admin/orders` - Todas las órdenes
- `/api/admin/orders?estado=pendiente_pago` - Órdenes pendientes de pago
- `/api/admin/orders?celular=5551234567` - Órdenes de un usuario
- `/api/admin/orders?fecha_desde=2024-10-01&fecha_hasta=2024-10-31` - Órdenes de octubre

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "ordenes": [
      {
        "id_orden": 1,
        "celular_usuario": "5551234567",
        "nombre_usuario": "Juan Pérez",
        "monto_total": 450.00,
        "estado": "pendiente_pago",
        "metodo_pago": "transferencia_bancaria",
        "metodo_entrega": "whatsapp",
        "fecha_creacion": "2024-10-17T00:00:00.000Z",
        "fecha_pago": null,
        "fecha_entrega": null,
        "cantidad_items": 3
      }
    ],
    "total": 150,
    "limit": 50,
    "offset": 0
  }
}
```

### Obtener Detalles de Orden

**Endpoint:** `GET /api/admin/orders/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id_orden": 1,
    "celular_usuario": "5551234567",
    "nombre_usuario": "Juan Pérez",
    "email_usuario": "juan@example.com",
    "monto_total": 450.00,
    "estado": "pendiente_pago",
    "metodo_pago": "transferencia_bancaria",
    "metodo_entrega": "whatsapp",
    "instrucciones_pago": "Transferir a...",
    "notas_admin": null,
    "fecha_creacion": "2024-10-17T00:00:00.000Z",
    "items": [
      {
        "id_order_item": 1,
        "id_plan": 1,
        "nombre_servicio": "Netflix",
        "nombre_plan": "1 Mes",
        "cantidad": 1,
        "precio_unitario": 150.00,
        "subtotal": 150.00,
        "estado": "pendiente",
        "id_cuenta_asignada": null,
        "correo_encriptado": null,
        "contrasena_encriptada": null
      }
    ]
  }
}
```

### Actualizar Estado de Orden

**Endpoint:** `PUT /api/admin/orders/:id/status`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "estado": "pagada",
  "notas_admin": "Pago confirmado por transferencia"
}
```

**Estados válidos:**
- `pendiente`
- `pendiente_pago`
- `pagada`
- `en_proceso`
- `entregada`
- `cancelada`

**Response (Success):**
```json
{
  "success": true,
  "message": "Estado de orden actualizado correctamente",
  "data": {
    "id_orden": 1,
    "estado": "pagada",
    "fecha_pago": "2024-10-17T12:30:00.000Z"
  }
}
```

---

## Cuentas de Streaming

### Listar Cuentas

**Endpoint:** `GET /api/admin/accounts`

**Query Parameters:**
- `id_plan` (opcional): Filtrar por plan
- `estado` (opcional): disponible, asignada, mantenimiento, bloqueada
- `limit` (opcional): Número de resultados (default: 50)
- `offset` (opcional): Offset para paginación (default: 0)

**Headers:**
```
Authorization: Bearer {token}
```

**Ejemplos:**
- `/api/admin/accounts` - Todas las cuentas
- `/api/admin/accounts?estado=disponible` - Solo cuentas disponibles
- `/api/admin/accounts?id_plan=1` - Cuentas del plan 1

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "cuentas": [
      {
        "id_cuenta": 1,
        "id_plan": 1,
        "nombre_servicio": "Netflix",
        "nombre_plan": "1 Mes",
        "correo": "cuenta1@example.com",
        "perfil": "Perfil 1",
        "pin": "1234",
        "notas": "Cuenta premium",
        "estado": "disponible",
        "fecha_agregado": "2024-10-17T00:00:00.000Z",
        "fecha_ultima_asignacion": null
      }
    ],
    "total": 50
  }
}
```

### Crear Cuenta

**Endpoint:** `POST /api/admin/accounts`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "id_plan": 1,
  "correo": "nueva_cuenta@netflix.com",
  "contrasena": "password123",
  "perfil": "Perfil 1",
  "pin": "1234",
  "notas": "Cuenta nueva"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Cuenta creada correctamente",
  "data": {
    "id_cuenta": 51,
    "id_plan": 1,
    "estado": "disponible",
    "fecha_agregado": "2024-10-17T12:30:00.000Z"
  }
}
```

### Actualizar Cuenta

**Endpoint:** `PUT /api/admin/accounts/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "correo": "cuenta_actualizada@netflix.com",
  "contrasena": "newpassword123",
  "estado": "disponible",
  "notas": "Contraseña actualizada"
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Cuenta actualizada correctamente",
  "data": {
    "id_cuenta": 1,
    "estado": "disponible"
  }
}
```

### Eliminar Cuenta

**Endpoint:** `DELETE /api/admin/accounts/:id`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Cuenta eliminada correctamente"
}
```

---

## Dashboard

### Obtener Estadísticas

**Endpoint:** `GET /api/admin/dashboard`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "ordenes": {
      "total_ordenes": "150",
      "ordenes_pendientes": "25",
      "ordenes_pagadas": "80",
      "ordenes_entregadas": "45"
    },
    "ventas": {
      "ventas_totales": "45000.00",
      "ventas_confirmadas": "38500.00"
    },
    "usuarios": {
      "total_usuarios": "85"
    },
    "servicios": {
      "servicios_activos": "5"
    },
    "planes": {
      "planes_activos": "20"
    },
    "cuentas": {
      "total_cuentas": "200",
      "cuentas_disponibles": "120",
      "cuentas_asignadas": "75"
    },
    "ventas_por_dia": [
      {
        "fecha": "2024-10-17",
        "ordenes": "5",
        "total": "1500.00"
      }
    ],
    "top_servicios": [
      {
        "servicio": "Netflix",
        "cantidad_vendida": "45",
        "total_ventas": "12500.00"
      }
    ]
  }
}
```

---

## Configuración Evolution API

### Obtener Configuración

**Endpoint:** `GET /api/admin/config/evolution`

**Headers:**
```
Authorization: Bearer {token}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "api_url": "https://evolution-api.example.com",
    "api_key": "your-api-key-here",
    "instance_name": "cuenty-whatsapp",
    "activo": true,
    "fecha_actualizacion": "2024-10-17T00:00:00.000Z"
  }
}
```

### Guardar/Actualizar Configuración

**Endpoint:** `POST /api/admin/config/evolution`

**Headers:**
```
Authorization: Bearer {token}
```

**Request Body:**
```json
{
  "api_url": "https://evolution-api.example.com",
  "api_key": "your-api-key-here",
  "instance_name": "cuenty-whatsapp",
  "activo": true
}
```

**Response (Success):**
```json
{
  "success": true,
  "message": "Configuración guardada correctamente",
  "data": {
    "id": 1,
    "api_url": "https://evolution-api.example.com",
    "api_key": "your-api-key-here",
    "instance_name": "cuenty-whatsapp",
    "activo": true,
    "fecha_actualizacion": "2024-10-17T12:30:00.000Z"
  }
}
```

---

## Códigos de Respuesta HTTP

- `200 OK` - Solicitud exitosa
- `201 Created` - Recurso creado exitosamente
- `400 Bad Request` - Datos de entrada inválidos
- `401 Unauthorized` - Token no proporcionado o inválido
- `403 Forbidden` - Sin permisos de administrador
- `404 Not Found` - Recurso no encontrado
- `500 Internal Server Error` - Error del servidor

---

## Notas de Seguridad

1. **Autenticación Requerida**: Todos los endpoints requieren un token JWT válido en el header `Authorization: Bearer {token}`

2. **Permisos de Administrador**: Todos los endpoints requieren que el usuario tenga permisos de administrador

3. **Tokens**: Los tokens JWT tienen una duración de 7 días

4. **Credenciales por Defecto**: Cambiar inmediatamente en producción:
   - Email: admin@cuenty.com
   - Password: Admin123!

5. **HTTPS**: En producción, usar siempre HTTPS para todas las comunicaciones

6. **Validación de Datos**: Todos los endpoints validan los datos de entrada antes de procesarlos

---

## Ejemplos de Uso con cURL

### Login
```bash
curl -X POST http://localhost:3000/api/admin/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"Admin123!"}'
```

### Listar Servicios
```bash
curl -X GET http://localhost:3000/api/admin/services \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Crear Servicio
```bash
curl -X POST http://localhost:3000/api/admin/services \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Apple TV+",
    "descripcion": "Contenido original de Apple",
    "categoria": "streaming"
  }'
```

### Obtener Dashboard
```bash
curl -X GET http://localhost:3000/api/admin/dashboard \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

## Soporte

Para más información o soporte técnico, contactar al equipo de desarrollo de CUENTY.

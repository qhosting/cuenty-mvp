# CUENTY API - Documentación Completa v2.0

## 📋 Índice

1. [Autenticación](#autenticación)
2. [Servicios](#servicios)
3. [Planes de Servicio](#planes-de-servicio)
4. [Carrito de Compras](#carrito-de-compras)
5. [Órdenes](#órdenes)
6. [Admin - Gestión](#admin---gestión)
7. [Códigos de Estado](#códigos-de-estado)

---

## 🔐 Autenticación

### Autenticación de Usuarios (Teléfono)

#### 1. Solicitar Código de Verificación

**POST** `/api/auth/user/phone/request-code`

Envía un código de verificación de 6 dígitos al número de teléfono.

**Body:**
```json
{
  "celular": "5512345678"
}
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Código de verificación enviado",
  "celular": "5512345678",
  "codigo": "123456"  // Solo en desarrollo
}
```

#### 2. Verificar Código y Login/Registro

**POST** `/api/auth/user/phone/verify-code`

Verifica el código y crea/autentica al usuario.

**Body:**
```json
{
  "celular": "5512345678",
  "codigo": "123456",
  "nombre": "Juan Pérez",  // Opcional
  "email": "juan@email.com",  // Opcional
  "metodo_entrega_preferido": "whatsapp"  // whatsapp|email|website
}
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "message": "Verificación exitosa",
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "usuario": {
      "celular": "5512345678",
      "nombre": "Juan Pérez",
      "email": "juan@email.com",
      "metodo_entrega_preferido": "whatsapp"
    }
  }
}
```

#### 3. Obtener Perfil

**GET** `/api/auth/user/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "data": {
    "celular": "5512345678",
    "nombre": "Juan Pérez",
    "email": "juan@email.com",
    "metodo_entrega_preferido": "whatsapp",
    "verificado": true,
    "fecha_creacion": "2024-10-17T10:30:00Z"
  }
}
```

#### 4. Actualizar Perfil

**PUT** `/api/auth/user/profile`

**Headers:**
```
Authorization: Bearer {token}
```

**Body:**
```json
{
  "nombre": "Juan Pérez García",
  "email": "nuevo@email.com",
  "metodo_entrega_preferido": "email"
}
```

#### 5. Logout

**POST** `/api/auth/user/logout`

**Headers:**
```
Authorization: Bearer {token}
```

---

### Autenticación de Administradores

#### Login Admin

**POST** `/api/auth/login`

**Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Respuesta:**
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

---

## 🎬 Servicios

### 1. Listar Servicios Activos (Público)

**GET** `/api/servicios/activos`

Obtiene todos los servicios activos con sus planes.

**Respuesta (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id_servicio": 1,
      "nombre": "Netflix",
      "descripcion": "Plataforma líder de streaming",
      "logo_url": null,
      "categoria": "streaming",
      "activo": true,
      "total_planes": 4,
      "planes_activos": 4,
      "planes": [
        {
          "id_plan": 1,
          "nombre_plan": "1 Mes",
          "duracion_meses": 1,
          "precio_venta": "150.00",
          "activo": true
        }
      ]
    }
  ]
}
```

### 2. Listar Todos los Servicios (Admin)

**GET** `/api/servicios`

**Headers:**
```
Authorization: Bearer {admin_token}
```

### 3. Crear Servicio (Admin)

**POST** `/api/servicios`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Body:**
```json
{
  "nombre": "Spotify",
  "descripcion": "Música sin límites",
  "logo_url": "https://blogger.googleusercontent.com/img/b/R29vZ2xl/AVvXsEhqpTldQEzwaITrjettN6OoK4AHIYOjt9Uri0waSxDMdEw-swGFvkrShcoxA5tNbzvzUBtTraEQCdZEyJ_0N064VMWYR3Vw4alt_AtvjvLY30olCHOb8Rz-pjdGZJ9YOZiUf1whAzkeBePg9M9abND7j8_95MgXe7-jXtXuv6APvb8fgz_X6sHU590t/s1800/music%20sticker%20badge%20for%20ptomotion%20freeject%201.jpg",
  "categoria": "musica"
}
```

### 4. Actualizar Servicio (Admin)

**PUT** `/api/servicios/:id`

### 5. Eliminar Servicio (Admin)

**DELETE** `/api/servicios/:id`

---

## 📦 Planes de Servicio

### 1. Listar Planes Activos (Público)

**GET** `/api/planes/activos`

**Respuesta (200 OK):**
```json
{
  "success": true,
  "data": [
    {
      "id_plan": 1,
      "nombre_plan": "1 Mes",
      "duracion_meses": 1,
      "duracion_dias": 30,
      "costo": "120.00",
      "margen_ganancia": "30.00",
      "precio_venta": "150.00",
      "nombre_servicio": "Netflix",
      "logo_url": null,
      "categoria": "streaming",
      "cuentas_disponibles": 5
    }
  ]
}
```

### 2. Obtener Plan por ID

**GET** `/api/planes/:id`

### 3. Crear Plan (Admin)

**POST** `/api/planes`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Body:**
```json
{
  "id_servicio": 1,
  "nombre_plan": "1 Mes",
  "duracion_meses": 1,
  "costo": 120.00,
  "margen_ganancia": 30.00,
  "descripcion": "Plan mensual de Netflix"
}
```

**Respuesta (201 Created):**
```json
{
  "success": true,
  "message": "Plan creado correctamente",
  "data": {
    "id_plan": 1,
    "precio_venta": "150.00",
    "duracion_dias": 30
  }
}
```

### 4. Actualizar Plan (Admin)

**PUT** `/api/planes/:id`

### 5. Eliminar Plan (Admin)

**DELETE** `/api/planes/:id`

---

## 🛒 Carrito de Compras

Todas las rutas requieren autenticación de usuario.

### 1. Obtener Carrito

**GET** `/api/cart`

**Headers:**
```
Authorization: Bearer {user_token}
```

**Respuesta (200 OK):**
```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id_cart_item": 1,
        "id_plan": 1,
        "cantidad": 1,
        "nombre_servicio": "Netflix",
        "nombre_plan": "1 Mes",
        "precio_venta": "150.00",
        "subtotal": "150.00",
        "duracion_meses": 1,
        "logo_url": null
      }
    ],
    "total": 150.00,
    "cantidad_items": 1
  }
}
```

### 2. Agregar Item al Carrito

**POST** `/api/cart/items`

**Headers:**
```
Authorization: Bearer {user_token}
```

**Body:**
```json
{
  "id_plan": 1,
  "cantidad": 1
}
```

### 3. Actualizar Cantidad

**PUT** `/api/cart/items`

**Body:**
```json
{
  "id_plan": 1,
  "cantidad": 2
}
```

### 4. Eliminar Item

**DELETE** `/api/cart/items/:id_plan`

### 5. Vaciar Carrito

**DELETE** `/api/cart`

### 6. Verificar Disponibilidad

**GET** `/api/cart/disponibilidad`

Verifica que todos los items tengan stock disponible.

**Respuesta:**
```json
{
  "success": true,
  "disponible": true,
  "message": "Todos los items están disponibles"
}
```

---

## 📦 Órdenes

### Rutas de Usuario

#### 1. Crear Orden desde Carrito

**POST** `/api/ordenes-new`

**Headers:**
```
Authorization: Bearer {user_token}
```

**Body:**
```json
{
  "metodo_entrega": "whatsapp"  // whatsapp|email|website
}
```

**Respuesta (201 Created):**
```json
{
  "success": true,
  "message": "Orden creada correctamente",
  "data": {
    "id_orden": 1,
    "celular_usuario": "5512345678",
    "monto_total": "150.00",
    "estado": "pendiente_pago",
    "metodo_entrega": "whatsapp",
    "instrucciones_pago": "📋 INSTRUCCIONES DE PAGO - Orden #1\n\n💳 Datos Bancarios:...",
    "items": [
      {
        "id_order_item": 1,
        "id_plan": 1,
        "cantidad": 1,
        "precio_unitario": "150.00",
        "subtotal": "150.00",
        "nombre_servicio": "Netflix",
        "nombre_plan": "1 Mes"
      }
    ]
  }
}
```

#### 2. Listar Mis Órdenes

**GET** `/api/ordenes-new/mis-ordenes?limite=20`

**Headers:**
```
Authorization: Bearer {user_token}
```

#### 3. Obtener Orden por ID

**GET** `/api/ordenes-new/:id`

---

### Rutas de Admin

#### 1. Listar Todas las Órdenes

**GET** `/api/ordenes-new?estado=pendiente_pago&limite=100&offset=0`

**Headers:**
```
Authorization: Bearer {admin_token}
```

**Query Params:**
- `estado`: pendiente|pendiente_pago|pagada|en_proceso|entregada|cancelada
- `celular_usuario`: Filtrar por usuario
- `limite`: Número de resultados
- `offset`: Paginación

#### 2. Actualizar Estado de Orden

**PUT** `/api/ordenes-new/:id/estado`

**Body:**
```json
{
  "estado": "pagada",
  "notas_admin": "Pago verificado mediante transferencia BBVA"
}
```

**Estados válidos:**
- `pendiente`: Orden creada
- `pendiente_pago`: Esperando pago
- `pagada`: Pago confirmado
- `en_proceso`: Procesando entrega
- `entregada`: Credenciales entregadas
- `cancelada`: Orden cancelada

#### 3. Asignar Credenciales

**POST** `/api/ordenes-new/items/:id_order_item/asignar`

Asigna automáticamente una cuenta disponible del inventario.

**Respuesta:**
```json
{
  "success": true,
  "message": "Credenciales asignadas correctamente",
  "data": {
    "success": true,
    "cuenta": {
      "id_cuenta": 5,
      "correo_encriptado": "...",
      "contrasena_encriptada": "..."
    }
  }
}
```

#### 4. Marcar como Entregada

**POST** `/api/ordenes-new/items/:id_order_item/entregar`

Marca las credenciales como entregadas al cliente.

#### 5. Obtener Estadísticas

**GET** `/api/ordenes-new/admin/estadisticas`

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "total_ordenes": 50,
    "pendientes": 10,
    "pagadas": 30,
    "entregadas": 8,
    "total_ingresos": "12500.00",
    "ticket_promedio": "250.00"
  }
}
```

---

## 📊 Admin - Gestión

### Inventario de Cuentas

Las rutas de inventario se mantienen en `/api/cuentas` (ver rutas legacy).

**Funcionalidades:**
- Agregar cuentas al inventario
- Listar cuentas por plan
- Actualizar estado de cuentas
- Ver cuentas asignadas

---

## 🔢 Códigos de Estado

### Códigos HTTP

- **200 OK**: Operación exitosa
- **201 Created**: Recurso creado
- **400 Bad Request**: Error en la petición
- **401 Unauthorized**: Token inválido o no proporcionado
- **403 Forbidden**: Sin permisos
- **404 Not Found**: Recurso no encontrado
- **500 Internal Server Error**: Error del servidor

### Estados de Orden

- `pendiente`: Orden creada, esperando procesamiento
- `pendiente_pago`: Esperando confirmación de pago
- `pagada`: Pago confirmado por admin
- `en_proceso`: Asignando credenciales
- `entregada`: Credenciales entregadas al cliente
- `cancelada`: Orden cancelada

### Estados de Cuenta (Inventario)

- `disponible`: Cuenta disponible para asignar
- `asignada`: Cuenta asignada a una orden
- `mantenimiento`: Cuenta en mantenimiento
- `bloqueada`: Cuenta bloqueada

---

## 🔐 Autenticación con Tokens

### Formato de Headers

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Tipos de Token

1. **User Token**: Para usuarios finales (generado al verificar código)
2. **Admin Token**: Para administradores (generado al login admin)

### Expiración

Los tokens expiran en 7 días. Después de eso, se debe solicitar un nuevo código o hacer login nuevamente.

---

## 💡 Flujo Completo de Compra

1. **Usuario se registra/loguea** con teléfono
2. **Explora servicios** disponibles (GET `/api/planes/activos`)
3. **Agrega items al carrito** (POST `/api/cart/items`)
4. **Verifica disponibilidad** (GET `/api/cart/disponibilidad`)
5. **Crea orden** desde carrito (POST `/api/ordenes-new`)
6. **Recibe instrucciones** de pago
7. **Realiza pago** y envía comprobante
8. **Admin confirma pago** (PUT `/api/ordenes-new/:id/estado` → pagada)
9. **Admin asigna credenciales** (POST `/api/ordenes-new/items/:id/asignar`)
10. **Admin marca como entregada** (POST `/api/ordenes-new/items/:id/entregar`)
11. **Usuario recibe credenciales** por WhatsApp/Email/Web

---

## 🚀 Ejemplo de Integración

### JavaScript (Frontend)

```javascript
// 1. Solicitar código
const response1 = await fetch('http://localhost:3000/api/auth/user/phone/request-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ celular: '5512345678' })
});

// 2. Verificar código
const response2 = await fetch('http://localhost:3000/api/auth/user/phone/verify-code', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    celular: '5512345678',
    codigo: '123456',
    nombre: 'Juan Pérez'
  })
});
const { data: { token } } = await response2.json();

// 3. Agregar al carrito
await fetch('http://localhost:3000/api/cart/items', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ id_plan: 1, cantidad: 1 })
});

// 4. Crear orden
const response4 = await fetch('http://localhost:3000/api/ordenes-new', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({ metodo_entrega: 'whatsapp' })
});
```

---

## 📞 Soporte

Para más información o soporte técnico:
- Email: admin@cuenty.com
- WhatsApp: [Número de soporte]

---

**Última actualización:** Octubre 2024  
**Versión:** 2.0.0

# Sistema de Pagos con Confirmación Manual - CUENTY MVP

## Fase 4.1 - Implementación Completa

### 📋 Descripción General

Este documento describe el flujo completo del sistema de pagos con confirmación manual implementado en CUENTY MVP. El sistema permite a los administradores confirmar manualmente los pagos recibidos por transferencia bancaria, con asignación automática de cuentas cuando hay stock disponible.

---

## 🗄️ Cambios en la Base de Datos

### Modelo `Orden` (ordenes)

Se agregaron los siguientes campos al modelo de órdenes:

| Campo | Tipo | Descripción | Valores Posibles |
|-------|------|-------------|------------------|
| `payment_status` | Enum | Estado del pago | `pending`, `confirmed`, `failed` |
| `payment_confirmed_at` | DateTime? | Fecha y hora de confirmación del pago | Nullable |
| `payment_confirmed_by` | Int? | ID del admin que confirmó el pago | Nullable, FK a `admins.id` |

### Relaciones

- **Orden → Admin**: Relación many-to-one a través de `payment_confirmed_by`
- **Admin → Orden**: Relación one-to-many llamada `ordenesConfirmadas`

### Índices

Se agregó un índice en el campo `payment_status` para mejorar el rendimiento de las consultas filtradas:
```sql
@@index([paymentStatus], name: "idx_ordenes_payment_status")
```

---

## 🔌 API Endpoints

### 1. Confirmar Pago de Orden

**Endpoint:** `POST /api/admin/orders/:id/confirm-payment`

**Autenticación:** Requiere token de administrador

**Headers:**
```
Authorization: Bearer <token_admin>
```

**Parámetros:**
- `id` (path): ID de la orden a confirmar

**Respuesta Exitosa (200):**
```json
{
  "success": true,
  "message": "Pago confirmado correctamente. Se asignaron 2 cuenta(s) automáticamente.",
  "data": {
    "orden": {
      "id_orden": 123,
      "celular_usuario": "+525512345678",
      "monto_total": 299.00,
      "estado": "en_proceso",
      "payment_status": "confirmed",
      "payment_confirmed_at": "2025-10-23T10:30:00.000Z",
      "payment_confirmed_by": 1,
      "admin_confirmador": "admin_usuario",
      ...
    },
    "cuentas_asignadas": 2,
    "items_totales": 2
  }
}
```

**Errores:**
- `400`: ID de orden inválido o pago ya confirmado
- `404`: Orden no encontrada
- `500`: Error interno del servidor

---

### 2. Listar Órdenes (Actualizado)

**Endpoint:** `GET /api/admin/orders`

**Nuevo Query Parameter:**
- `payment_status` (opcional): Filtrar por estado de pago (`pending`, `confirmed`, `failed`)

**Ejemplo:**
```
GET /api/admin/orders?payment_status=pending&limit=20&offset=0
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "ordenes": [
      {
        "id_orden": 123,
        "celular_usuario": "+525512345678",
        "nombre_usuario": "Juan Pérez",
        "monto_total": 299.00,
        "estado": "pendiente_pago",
        "payment_status": "pending",
        "payment_confirmed_at": null,
        "fecha_creacion": "2025-10-23T09:00:00.000Z",
        ...
      }
    ],
    "total": 15,
    "limit": 20,
    "offset": 0
  }
}
```

---

### 3. Obtener Orden (Actualizado)

**Endpoint:** `GET /api/admin/orders/:id`

**Campos adicionales en la respuesta:**
- `payment_status`: Estado del pago
- `payment_confirmed_at`: Fecha de confirmación
- `payment_confirmed_by`: ID del admin confirmador
- `admin_confirmador`: Username del admin que confirmó

---

## 🔄 Flujo Completo del Sistema

### 1. Creación de Orden

Cuando un usuario crea una orden desde su carrito:

```javascript
// OrdenEnhanced.crearDesdeCarrito()
INSERT INTO ordenes 
  (celular_usuario, monto_total, metodo_entrega, estado, payment_status)
VALUES 
  ($celular, $monto, $metodo, 'pendiente_pago', 'pending')
```

- `estado` = `pendiente_pago`
- `payment_status` = `pending` (por defecto)

---

### 2. Usuario Realiza el Pago

El usuario recibe las instrucciones de pago y realiza la transferencia bancaria al banco configurado en el sistema.

---

### 3. Admin Confirma el Pago

El administrador:
1. Verifica la transferencia en su cuenta bancaria
2. Accede al panel de administración
3. Filtra órdenes con `payment_status=pending`
4. Hace clic en "Confirmar Pago"
5. Confirma la acción en el modal

**Proceso Backend:**

1. **Validaciones:**
   - Verificar que la orden existe
   - Verificar que el pago no fue confirmado previamente
   - Verificar autenticación de admin

2. **Actualización de Orden:**
   ```sql
   UPDATE ordenes 
   SET 
     payment_status = 'confirmed',
     payment_confirmed_at = NOW(),
     payment_confirmed_by = $admin_id,
     estado = CASE 
       WHEN estado = 'pendiente_pago' THEN 'en_proceso'
       ELSE estado 
     END,
     fecha_pago = CASE 
       WHEN fecha_pago IS NULL THEN NOW()
       ELSE fecha_pago
     END
   WHERE id_orden = $id
   ```

3. **Asignación Automática de Cuentas:**
   
   Para cada item de la orden sin cuenta asignada:
   - Buscar cuenta disponible del mismo plan
   - Asignar cuenta al item
   - Actualizar estado de cuenta a `asignada`
   - Calcular fecha de vencimiento basada en `duracion_dias`

   ```sql
   -- Buscar cuenta disponible
   SELECT ic.id_cuenta
   FROM inventario_cuentas ic
   WHERE ic.id_plan = $plan_id 
   AND ic.estado = 'disponible'
   LIMIT 1 FOR UPDATE
   
   -- Asignar cuenta
   UPDATE order_items
   SET 
     id_cuenta_asignada = $cuenta_id,
     estado = 'asignada',
     fecha_vencimiento_servicio = NOW() + INTERVAL '1 day' * $duracion_dias
   WHERE id_order_item = $item_id
   
   -- Actualizar inventario
   UPDATE inventario_cuentas
   SET 
     estado = 'asignada',
     fecha_ultima_asignacion = NOW()
   WHERE id_cuenta = $cuenta_id
   ```

4. **Respuesta al Admin:**
   - Confirmación exitosa
   - Número de cuentas asignadas automáticamente
   - Información completa de la orden actualizada

---

### 4. Entrega de Credenciales

Una vez confirmado el pago y asignadas las cuentas:

1. El sistema puede enviar las credenciales automáticamente vía WhatsApp (si está configurado Evolution API)
2. O el admin puede entregar manualmente las credenciales

---

## 🎨 Cambios en el Panel de Administración

### Lista de Órdenes

**Nuevos elementos:**

1. **Badge de Estado de Pago:**
   - 🟡 `PAGO PENDIENTE` (amarillo) - payment_status = pending
   - 🟢 `PAGO CONFIRMADO` (verde) - payment_status = confirmed
   - 🔴 `PAGO FALLIDO` (rojo) - payment_status = failed

2. **Filtro por Estado de Pago:**
   - Dropdown con opciones: Todos, Pendiente, Confirmado, Fallido
   - Se puede combinar con otros filtros existentes

3. **Botón "Confirmar Pago":**
   - Visible solo en órdenes con `payment_status = pending`
   - Al hacer clic, muestra modal de confirmación
   - Botón deshabilitado durante el proceso

### Vista de Detalle de Orden

**Información adicional mostrada:**

- Estado del pago con badge colorido
- Fecha de confirmación (si aplica)
- Admin que confirmó el pago (si aplica)
- Botón de confirmación (si el pago está pendiente)

---

## 🔒 Seguridad y Validaciones

### Autenticación
- Todos los endpoints de confirmación requieren token JWT válido
- Se verifica que el usuario sea administrador mediante middleware `verifyAdmin`

### Validaciones de Negocio
- No se puede confirmar un pago ya confirmado
- Solo admins pueden confirmar pagos
- Se registra qué admin confirmó cada pago (auditoría)
- Transacciones atómicas para asignación de cuentas (prevenir race conditions)

### Manejo de Errores
- Rollback automático si falla la asignación de cuentas
- Mensajes de error descriptivos
- Logging de errores en consola del servidor

---

## 📊 Estados del Sistema

### Estados de Orden (`estado`)
- `pendiente_pago`: Orden creada, esperando pago
- `en_proceso`: Pago confirmado, procesando asignación
- `pagada`: Completamente pagada (legacy)
- `entregada`: Credenciales entregadas
- `cancelada`: Orden cancelada

### Estados de Pago (`payment_status`)
- `pending`: Pago no confirmado
- `confirmed`: Pago confirmado por admin
- `failed`: Pago fallido o rechazado

### Estados de Cuenta (`estado` en inventario_cuentas)
- `disponible`: Cuenta lista para asignar
- `asignada`: Cuenta asignada a una orden
- `mantenimiento`: En mantenimiento
- `bloqueada`: Bloqueada temporalmente

---

## 🧪 Casos de Uso

### Caso 1: Confirmación exitosa con stock disponible
1. Admin confirma pago de orden con 2 items
2. Sistema encuentra cuentas disponibles para ambos items
3. Asigna cuentas automáticamente
4. Actualiza estado a `en_proceso`
5. Responde: "Pago confirmado. Se asignaron 2 cuenta(s) automáticamente."

### Caso 2: Confirmación con stock insuficiente
1. Admin confirma pago de orden con 3 items
2. Sistema solo encuentra 1 cuenta disponible
3. Asigna 1 cuenta automáticamente
4. Actualiza estado a `en_proceso`
5. Responde: "Pago confirmado. Se asignó 1 cuenta(s) automáticamente."
6. Admin debe asignar manualmente las 2 cuentas restantes

### Caso 3: Confirmación sin stock
1. Admin confirma pago
2. Sistema no encuentra cuentas disponibles
3. Actualiza solo el estado de pago
4. Responde: "Pago confirmado. No se pudieron asignar cuentas automáticamente por falta de stock."
5. Admin debe agregar stock y asignar manualmente

---

## 🚀 Próximas Fases

### Fase 4.2 (Planificada)
- Integración con pasarela de pago automática
- Webhooks para confirmación automática

### Fase 4.3 (Planificada)
- Notificaciones automáticas al usuario
- Dashboard de métricas de pagos

---

## 📝 Notas Técnicas

### Transacciones y Concurrencia
- Se usan transacciones SQL para garantizar consistencia
- `FOR UPDATE` en queries de selección de cuentas previene race conditions
- Rollback automático en caso de error

### Performance
- Índices en campos clave: `payment_status`, `estado`, `fecha_creacion`
- Consultas optimizadas con JOINs eficientes
- Límites configurables en listados

### Compatibilidad
- Compatible con PostgreSQL 12+
- Prisma ORM para migraciones
- Node.js 16+

---

## 🐛 Troubleshooting

### Error: "Pago ya confirmado"
- **Causa:** Intento de confirmar un pago ya confirmado
- **Solución:** Verificar el estado actual de la orden

### Error: "Orden no encontrada"
- **Causa:** ID de orden inválido
- **Solución:** Verificar que el ID existe en la base de datos

### Error: "Token inválido"
- **Causa:** Token JWT expirado o inválido
- **Solución:** Realizar login nuevamente

### No se asignan cuentas automáticamente
- **Causa:** No hay cuentas disponibles en inventario
- **Solución:** Agregar cuentas al inventario del plan correspondiente

---

## 📚 Referencias

- **Schema Prisma:** `/backend/prisma/schema.prisma`
- **Controller:** `/backend/controllers/adminController.js` (línea 857)
- **Rutas:** `/backend/routes/adminRoutes.js` (línea 69)
- **Modelo:** `/backend/models/OrdenEnhanced.js` (línea 40)

---

**Fecha de Implementación:** Octubre 23, 2025  
**Versión:** 1.0.0  
**Estado:** Implementado ✅

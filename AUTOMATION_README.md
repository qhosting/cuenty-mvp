# 🚀 CUENTY MVP - Automatización Completa (Fase 4)

## 📋 Descripción General

La **Fase 4** implementa la automatización completa del sistema CUENTY, eliminando la necesidad de intervención manual en procesos críticos como:

- ✅ **Asignación automática de cuentas** a órdenes pagadas
- ✅ **Renovaciones automáticas** con cron jobs programados
- ✅ **Notificaciones inteligentes** vía WhatsApp (Chatwoot) y email
- ✅ **Procesamiento masivo** de operaciones
- ✅ **Seguimiento y estadísticas** en tiempo real

## 🏗️ Arquitectura de la Automatización

```
┌─────────────────────────────────────────────────────────────┐
│                    CUENTY AUTOMATION                         │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────┐  ┌─────────────────┐  ┌──────────────┐ │
│  │   AutoAssign    │  │   Renewal       │  │ Chatwoot     │ │
│  │   Service       │  │   Service       │  │ Automation   │ │
│  │                 │  │                 │  │ Service      │ │
│  │ • Order Process │  │ • Auto Renew    │  │              │ │
│  │ • Inventory     │  │ • Reminders     │  │ • WhatsApp   │ │
│  │ • Notifications │  │ • Notifications │  │ • Messages   │ │
│  └─────────────────┘  └─────────────────┘  └──────────────┘ │
│           │                       │                       │
│  ┌─────────────────┐              │                       │
│  │   Email         │              │                       │
│  │   Service       │              │                       │
│  │                 │              │                       │
│  │ • Templates     │              │                       │
│  │ • Transaccional │              │                       │
│  │ • SendGrid      │              │                       │
│  └─────────────────┘              │                       │
│                                     │                       │
│  ┌─────────────────────────────────────────────────────────┐ │
│  │               API ROUTES                                │ │
│  │  /api/auto-assign/*    /api/renewals/*                 │ │
│  └─────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

## 🛠️ Instalación y Configuración

### 1. Instalar Dependencias Adicionales

```bash
# En el directorio backend/
npm install crypto-js axios node-cron
```

### 2. Configurar Variables de Entorno

Copia el archivo de ejemplo y configura tus variables:

```bash
cp .env.automation.example .env
```

**Variables principales a configurar:**

```env
# CHATWOOT (ya debe estar configurado)
CHATWOOT_URL=https://tu-chatwoot.com
CHATWOOT_API_TOKEN=tu_token_api
CHATWOOT_ACCOUNT_ID=tu_account_id
CHATWOOT_INBOX_ID=tu_inbox_id

# EMAIL (SendGrid)
SENDGRID_API_KEY=SG.tu_api_key_sendgrid
FROM_EMAIL=noreply@cuenty.com
FROM_NAME=CUENTY

# ENCRIPTACIÓN
ENCRYPTION_KEY=tu_clave_encriptacion_32_caracteres
```

### 3. Verificar Configuración

Ejecuta el endpoint de estado para verificar que todo esté configurado:

```bash
curl -H "Authorization: Bearer tu_token" \
     http://localhost:3000/api/auto-assign/estado
```

## 🚀 Funcionalidades Principales

### 1. **Asignación Automática de Cuentas**

#### Asignar cuentas a una orden pagada:
```javascript
// POST /api/auto-assign/orden/:id
{
  "force": false  // Forzar asignación even si hay errores
}
```

#### Verificar disponibilidad de inventario:
```javascript
// POST /api/auto-assign/verificar-disponibilidad/:ordenId
```

#### Asignación masiva:
```javascript
// POST /api/auto-assign/asignacion-masiva
{
  "ordenIds": [1, 2, 3, 4, 5]
}
```

### 2. **Renovaciones Automáticas**

#### Verificar renovaciones pendientes:
```javascript
// POST /api/renewals/verificar-renovaciones
```

#### Procesar renovación específica:
```javascript
// POST /api/renewals/procesar-renovacion/:id
```

#### Verificar vencimientos próximos:
```javascript
// POST /api/renewals/verificar-vencimientos
```

### 3. **Notificaciones vía Chatwoot**

#### Enviar mensaje personalizado:
```javascript
// POST /api/auto-assign/enviar-mensaje
{
  "phoneNumber": "+521234567890",
  "message": "¡Hola! Tu cuenta está lista.",
  "metadata": {
    "type": "custom",
    "priority": "normal"
  }
}
```

#### Notificar entrega de cuenta:
```javascript
// POST /api/auto-assign/notificar-entrega
{
  "phoneNumber": "+521234567890",
  "accountData": {
    "service": "Netflix",
    "plan": "Premium",
    "email": "usuario@email.com",
    "password": "password123",
    "expiration": "2025-06-01"
  }
}
```

## 📊 API Endpoints

### **Asignación Automática**
```
GET    /api/auto-assign/estado                    # Estado del sistema
GET    /api/auto-assign/estadisticas              # Estadísticas de asignación
POST   /api/auto-assign/orden/:id                 # Asignar cuentas a orden
POST   /api/auto-assign/verificar-disponibilidad  # Verificar inventario
POST   /api/auto-assign/asignacion-masiva         # Asignación masiva
POST   /api/auto-assign/enviar-mensaje            # Enviar mensaje directo
POST   /api/auto-assign/notificar-entrega         # Notificar entrega
POST   /api/auto-assign/notificar-bienvenida      # Mensaje de bienvenida
POST   /api/auto-assign/notificar-pago           # Confirmación de pago
GET    /api/auto-assign/chatwoot-stats           # Estadísticas Chatwoot
POST   /api/auto-assign/limpiar-cache            # Limpiar cache
```

### **Renovaciones Automáticas**
```
GET    /api/renewals/estado                      # Estado del sistema
GET    /api/renewals/estadisticas                # Estadísticas de renovaciones
POST   /api/renewals/verificar-renovaciones      # Verificar renovaciones
POST   /api/renewals/verificar-vencimientos      # Verificar vencimientos
POST   /api/renewals/procesar-renovacion/:id     # Procesar renovación
POST   /api/renewals/enviar-recordatorio         # Enviar recordatorio
POST   /api/renewals/forzar-verificacion         # Forzar verificación completa
POST   /api/renewals/limpiar-logs                # Limpiar logs antiguos
GET    /api/renewals/reporte-renovaciones        # Reporte detallado
GET    /api/renewals/renovaciones-proximas       # Lista de próximas renovaciones
```

## ⏰ Trabajos Programados (Cron Jobs)

El sistema ejecuta automáticamente las siguientes tareas:

### **Renovaciones Automáticas**
- **Diario a las 9:00 AM**: Verificación de suscripciones para renovar
- **Cada 6 horas**: Verificación de vencimientos próximos
- **Diario a las 2:00 AM**: Limpieza de logs antiguos

### **Recordatorios de Vencimiento**
Los clientes reciben recordatorios automáticos:
- **7 días** antes del vencimiento
- **3 días** antes del vencimiento  
- **1 día** antes del vencimiento

## 📈 Monitoreo y Estadísticas

### **Obtener estadísticas de asignación:**
```bash
curl -H "Authorization: Bearer tu_token" \
     "http://localhost:3000/api/auto-assign/estadisticas?desde=2025-01-01&hasta=2025-12-31"
```

**Respuesta:**
```json
{
  "success": true,
  "data": {
    "totalOrdenes": 150,
    "totalItemsAsignados": 300,
    "servicios": {
      "Netflix": 120,
      "Disney+": 90,
      "Prime Video": 90
    },
    "promedioItemsPorOrden": 2.0
  }
}
```

### **Obtener estadísticas de renovaciones:**
```bash
curl -H "Authorization: Bearer tu_token" \
     "http://localhost:3000/api/renewals/estadisticas"
```

## 🔧 Integración con Flujos Existentes

### **Asignación Automática en Confirmación de Pago**

El sistema automáticamente asigna cuentas cuando se confirma un pago:

```javascript
// En ordenController.js - método confirmarPago
exports.confirmarPago = async (req, res) => {
  // ... lógica existente de validación
  
  // NUEVO: Asignación automática si el pago es exitoso
  if (orden.estado === 'pagada') {
    console.log(`🔄 Iniciando asignación automática para orden ${id}`);
    
    const asignacionResult = await autoAssignmentService.asignarCuentaAOrden(id);
    
    if (!asignacionResult.success) {
      console.error('⚠️ Error en asignación automática:', asignacionResult.error);
    }
  }
  
  // ... resto de la lógica
};
```

### **Notificaciones al Crear Suscripciones**

```javascript
// En suscripcionController.js - método crearSuscripcion
exports.crearSuscripcion = async (req, res) => {
  // ... lógica existente
  
  // NUEVO: Programar notificaciones de vencimiento
  if (suscripcion.renovacion_automatica) {
    await notificationService.crearNotificacionesProgramadas(
      suscripcion.id,
      suscripcion.fecha_proxima_renovacion,
      cliente.telefono
    );
  }
  
  // ... resto de la lógica
};
```

## 🚨 Troubleshooting

### **Problemas Comunes**

#### 1. **Error: "Chatwoot no configurado correctamente"**
```bash
# Verificar variables de entorno
echo $CHATWOOT_URL
echo $CHATWOOT_API_TOKEN
echo $CHATWOOT_ACCOUNT_ID

# Probar conexión
curl -H "api_access_token: tu_token" \
     "$CHATWOOT_URL/api/v1/accounts/$CHATWOOT_ACCOUNT_ID/conversations"
```

#### 2. **Error: "No hay cuentas disponibles"**
```bash
# Verificar inventario
curl -H "Authorization: Bearer tu_token" \
     "http://localhost:3000/api/auto-assign/verificar-disponibilidad/1"
```

#### 3. **Error: "SendGrid no configurado"**
```bash
# Verificar API key
curl -H "Authorization: Bearer SG.tu_api_key" \
     "https://api.sendgrid.com/v3/user/account"
```

### **Logs y Debugging**

#### **Habilitar logs detallados:**
```env
AUTOMATION_DEBUG=true
LOG_LEVEL=debug
```

#### **Ver logs en tiempo real:**
```bash
# Ver logs del servidor
tail -f /var/log/cuenty/server.log

# Ver logs específicos de automatización
tail -f /var/log/cuenty/automation.log
```

#### **Limpiar cache de Chatwoot:**
```bash
curl -X POST -H "Authorization: Bearer tu_token" \
     http://localhost:3000/api/auto-assign/limpiar-cache
```

## 🔐 Seguridad

### **Autenticación Requerida**
Todos los endpoints de automatización requieren autenticación JWT:
- Admin o Super Admin para la mayoría de operaciones
- Super Admin para operaciones de riesgo (limpieza, forzar verificaciones)

### **Rate Limiting**
- **100 requests por 15 minutos** por IP
- Protege contra abuso de las APIs de automatización

### **Encriptación de Datos**
- Credenciales de cuentas se almacenan encriptadas
- Uso de AES-256 para datos sensibles
- Clave de encriptación configurable vía `ENCRYPTION_KEY`

## 📚 Ejemplos de Uso

### **Ejemplo 1: Proceso Completo de Venta Automatizada**

```javascript
// 1. Cliente realiza compra
const orden = await crearOrden(clienteId, items);

// 2. Cliente realiza pago
await confirmarPago(ordenId, datosPago);

// 3. Sistema automáticamente:
//    - Verifica disponibilidad
//    - Asigna cuentas
//    - Envía credenciales por WhatsApp
//    - Envía email de confirmación
//    - Actualiza estado de orden

// 4. Cliente recibe notificación instantánea
// "¡Tu cuenta de Netflix está lista! Credenciales enviadas..."
```

### **Ejemplo 2: Renovación Automática**

```javascript
// 1. Suscripción próxima a vencer (3 días)
// 2. Sistema envía recordatorio automático
// 3. Cliente confirma renovación
// 4. Sistema procesa pago automático
// 5. Renueva suscripción
// 6. Envía confirmación de renovación
```

## 🎯 Beneficios Esperados

### **Operacionales**
- ✅ **80% reducción** en trabajo manual de asignación
- ✅ **Entregas instantáneas** de cuentas (0-30 segundos)
- ✅ **Renovaciones automáticas** sin intervención manual
- ✅ **Notificaciones proactivas** que mejoran la experiencia

### **Experiencia del Cliente**
- ⚡ Respuesta inmediata tras confirmación de pago
- 📱 Notificaciones automáticas por WhatsApp
- 📧 Emails informativos personalizados
- 🔔 Recordatorios de vencimiento inteligentes

### **Escalabilidad**
- 📈 Capacidad de procesar **miles de órdenes** automáticamente
- 🔄 Procesamiento en lote para operaciones masivas
- 📊 Métricas y estadísticas en tiempo real
- 🎛️ Panel de control completo para administradores

---

## 📞 Soporte

Para dudas o problemas con la automatización:

1. **Verifica la configuración** con `/api/auto-assign/estado`
2. **Revisa los logs** con `AUTOMATION_DEBUG=true`
3. **Consulta las estadísticas** para identificar problemas
4. **Usa el troubleshooting** para resolver errores comunes

---

**CUENTY MVP - Automatización Completa** 🚀  
*Transformando la gestión de suscripciones de streaming*
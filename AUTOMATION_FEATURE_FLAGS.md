# 🚀 Guía de Control de Automatización - CUENTY

## 📋 Resumen

Esta guía explica cómo activar, desactivar y controlar las diferentes funcionalidades de automatización del sistema CUENTY usando **Feature Flags**.

## 🎛️ Feature Flags Disponibles

### 1. 🏢 Asignación Automática de Cuentas
```bash
ENABLE_AUTO_ASSIGNMENT=true
```
**Qué controla:** Asignación automática de cuentas de streaming a órdenes pagadas
- ✅ **Activado:** El sistema asigna automáticamente cuentas disponibles
- ❌ **Desactivado:** Las asignaciones se hacen manualmente

**Para activar/desactivar en tiempo real:**
```javascript
// En el código (servicios)
if (process.env.ENABLE_AUTO_ASSIGNMENT === 'true') {
    await autoAssignmentService.assignAccountToOrder(ordenId);
}
```

### 2. 🔄 Procesamiento Automático de Renovaciones
```bash
ENABLE_AUTO_RENEWALS=true
```
**Qué controla:** Procesamiento automático de renovaciones de suscripciones
- ✅ **Activado:** El sistema procesa renovaciones automáticamente
- ❌ **Desactivado:** Las renovaciones requieren procesamiento manual

**Para activar/desactivar en tiempo real:**
```javascript
// En renewalService.js
if (process.env.ENABLE_AUTO_RENEWALS === 'true') {
    await this.processAutoRenewals();
}
```

### 3. 📢 Notificaciones Automáticas
```bash
ENABLE_AUTO_NOTIFICATIONS=true
```
**Qué controla:** Envío automático de mensajes por WhatsApp a través de Chatwoot
- ✅ **Activado:** El sistema envía notificaciones automáticas
- ❌ **Desactivado:** No se envían notificaciones automáticas

**Para activar/desactivar en tiempo real:**
```javascript
// En chatwootAutomationService.js
if (process.env.ENABLE_AUTO_NOTIFICATIONS === 'true') {
    await this.sendAutomaticNotifications();
}
```

### 4. ✉️ Servicio de Email Automático
```bash
ENABLE_EMAIL_SERVICE=true
```
**Qué controla:** Envío automático de emails transaccionales vía SendGrid
- ✅ **Activado:** El sistema envía emails automáticos (confirmaciones, recordatorios, etc.)
- ❌ **Desactivado:** No se envían emails automáticos

**Para activar/desactivar en tiempo real:**
```javascript
// En emailService.js
if (process.env.ENABLE_EMAIL_SERVICE === 'true') {
    await this.sendTransactionalEmail();
}
```

### 5. 🧹 Limpieza Automática de Logs
```bash
ENABLE_AUTO_CLEANUP=true
```
**Qué controla:** Limpieza automática de logs antiguos y datos temporales
- ✅ **Activado:** El sistema limpia logs automáticamente cada día
- ❌ **Desactivado:** Los logs se acumulan hasta limpieza manual

**Para activar/desactivar en tiempo real:**
```javascript
// En renewalService.js
if (process.env.ENABLE_AUTO_CLEANUP === 'true') {
    await this.cleanupOldLogs();
}
```

### 6. 🔍 Logs Detallados de Depuración
```bash
ENABLE_AUTOMATION_DEBUG_LOGS=false
```
**Qué controla:** Nivel de detalle en los logs de automatización
- ✅ **Activado:** Logs muy detallados (útil para desarrollo)
- ❌ **Desactivado:** Logs estándar (recomendado para producción)

## ⚙️ Configuración por Entornos

### 🏠 Desarrollo
```bash
# .env.development
ENABLE_AUTO_ASSIGNMENT=false
ENABLE_AUTO_RENEWALS=false
ENABLE_AUTO_NOTIFICATIONS=false
ENABLE_EMAIL_SERVICE=false
ENABLE_AUTO_CLEANUP=true
ENABLE_AUTOMATION_DEBUG_LOGS=true
```

### 🏭 Producción
```bash
# .env.production
ENABLE_AUTO_ASSIGNMENT=true
ENABLE_AUTO_RENEWALS=true
ENABLE_AUTO_NOTIFICATIONS=true
ENABLE_EMAIL_SERVICE=true
ENABLE_AUTO_CLEANUP=true
ENABLE_AUTOMATION_DEBUG_LOGS=false
```

### 🧪 Testing
```bash
# .env.test
ENABLE_AUTO_ASSIGNMENT=false
ENABLE_AUTO_RENEWALS=false
ENABLE_AUTO_NOTIFICATIONS=false
ENABLE_EMAIL_SERVICE=false
ENABLE_AUTO_CLEANUP=false
ENABLE_AUTOMATION_DEBUG_LOGS=false
```

## 🚦 Control de Estado en Tiempo Real

### Verificar Estado Actual
```javascript
// En cualquier servicio
const automationStatus = {
    autoAssignment: process.env.ENABLE_AUTO_ASSIGNMENT === 'true',
    autoRenewals: process.env.ENABLE_AUTO_RENEWALS === 'true',
    autoNotifications: process.env.ENABLE_AUTO_NOTIFICATIONS === 'true',
    emailService: process.env.ENABLE_EMAIL_SERVICE === 'true',
    autoCleanup: process.env.ENABLE_AUTO_CLEANUP === 'true',
    debugLogs: process.env.ENABLE_AUTOMATION_DEBUG_LOGS === 'true'
};

console.log('Estado de automatización:', automationStatus);
```

### Validación en APIs
```javascript
// Ejemplo en autoAssignRoutes.js
router.post('/verificar-disponibilidad/:ordenId', async (req, res) => {
    if (process.env.ENABLE_AUTO_ASSIGNMENT !== 'true') {
        return res.status(403).json({
            error: 'Asignación automática deshabilitada',
            message: 'Contacta al administrador para habilitar la función'
        });
    }
    
    // Continuar con la lógica...
});
```

## 🛠️ Comandos de Control Rápido

### Activar Todas las Funciones
```bash
# En .env
ENABLE_AUTO_ASSIGNMENT=true
ENABLE_AUTO_RENEWALS=true
ENABLE_AUTO_NOTIFICATIONS=true
ENABLE_EMAIL_SERVICE=true
ENABLE_AUTO_CLEANUP=true
```

### Desactivar Todas las Funciones
```bash
# En .env
ENABLE_AUTO_ASSIGNMENT=false
ENABLE_AUTO_RENEWALS=false
ENABLE_AUTO_NOTIFICATIONS=false
ENABLE_EMAIL_SERVICE=false
ENABLE_AUTO_CLEANUP=false
```

### Solo Mantener Limpieza de Logs
```bash
# En .env
ENABLE_AUTO_ASSIGNMENT=false
ENABLE_AUTO_RENEWALS=false
ENABLE_AUTO_NOTIFICATIONS=false
ENABLE_EMAIL_SERVICE=false
ENABLE_AUTO_CLEANUP=true
ENABLE_AUTOMATION_DEBUG_LOGS=false
```

## 🔒 Seguridad y Best Practices

### 1. Validación de Variables
```javascript
// Siempre validar antes de usar
function isAutomationEnabled(feature) {
    const flag = `ENABLE_${feature.toUpperCase()}`;
    const value = process.env[flag];
    return value === 'true' || value === true;
}

// Uso
if (isAutomationEnabled('AUTO_ASSIGNMENT')) {
    await processAssignment();
}
```

### 2. Logging de Cambios
```javascript
// Registrar cuando se deshabilita una función
if (process.env.ENABLE_AUTO_ASSIGNMENT === 'false') {
    console.warn('⚠️ Asignación automática DESHABILITADA por configuración');
    // Opcional: enviar notificación al admin
}
```

### 3. Fallbacks Seguros
```javascript
// Siempre tener fallback cuando se deshabilita
if (isAutomationEnabled('AUTO_NOTIFICATIONS')) {
    await sendWhatsAppNotification();
} else {
    // Fallback manual
    console.log('📧 Notificación pendiente para envío manual');
    await markForManualNotification();
}
```

## 🚨 Alertas y Monitoreo

### Estado de Feature Flags
```javascript
// Endpoint para verificar estado
router.get('/status', (req, res) => {
    res.json({
        autoAssignment: process.env.ENABLE_AUTO_ASSIGNMENT === 'true',
        autoRenewals: process.env.ENABLE_AUTO_RENEWALS === 'true',
        autoNotifications: process.env.ENABLE_AUTO_NOTIFICATIONS === 'true',
        emailService: process.env.ENABLE_EMAIL_SERVICE === 'true',
        autoCleanup: process.env.ENABLE_AUTO_CLEANUP === 'true',
        debugLogs: process.env.ENABLE_AUTOMATION_DEBUG_LOGS === 'true',
        timestamp: new Date().toISOString()
    });
});
```

### Verificación con Script de Prueba
```bash
# Ejecutar script de verificación
node backend/test-automation.js

# Output esperado:
# ✅ Sistema de automatización completamente configurado!
```

## 🆘 Solución de Problemas

### Problema: Función No Se Activa
1. Verificar que el archivo `.env` existe
2. Confirmar que la variable está escrita exactamente: `ENABLE_FUNCTION_NAME=true`
3. Reiniciar el servidor para cargar nuevas variables
4. Ejecutar script de prueba: `node test-automation.js`

### Problema: Variables No Se Cargan
```javascript
// Verificar en el código
console.log('Todas las variables ENABLE:', 
    Object.keys(process.env).filter(key => key.startsWith('ENABLE_'))
);
```

### Problema: Función No Responde a Cambios
```javascript
// Verificar que se esté leyendo correctamente
if (typeof process.env.ENABLE_AUTO_ASSIGNMENT === 'undefined') {
    console.error('❌ Variable ENABLE_AUTO_ASSIGNMENT no encontrada');
}
```

## 📞 Soporte

Si tienes problemas con los feature flags:

1. **Ejecuta el script de prueba:** `node backend/test-automation.js`
2. **Revisa los logs del servidor** para ver advertencias sobre variables faltantes
3. **Verifica el archivo `.env`** que está siendo cargado
4. **Consulta AUTOMATION_README.md** para configuración completa

---

*Documento generado automáticamente por el sistema de automatización CUENTY*
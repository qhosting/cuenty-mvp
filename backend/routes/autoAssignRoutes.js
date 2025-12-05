/**
 * ============================================
 * AUTO ASSIGNMENT ROUTES - CUENTY MVP
 * ============================================
 * Rutas para gestión de asignación automática de cuentas
 */

const express = require('express');
const router = express.Router();
const autoAssignmentService = require('../services/autoAssignmentService');
const chatwootAutomationService = require('../services/chatwootAutomationService');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// ASIGNACIÓN AUTOMÁTICA DE CUENTAS
// ============================================

/**
 * POST /api/auto-assign/orden/:id
 * Asignar cuentas automáticamente a una orden pagada
 */
router.post('/orden/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { force = false } = req.body;

    console.log(`🔄 Solicitando asignación automática para orden ${id}`);

    // Verificar que el usuario tenga permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    // Ejecutar asignación automática
    const resultado = await autoAssignmentService.asignarCuentaAOrden(parseInt(id));

    if (resultado.success) {
      res.json({
        success: true,
        message: 'Asignación automática completada',
        data: resultado
      });
    } else {
      res.status(400).json({
        success: false,
        error: resultado.error,
        data: resultado
      });
    }

  } catch (error) {
    console.error('❌ Error en asignación automática:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/auto-assign/verificar-disponibilidad/:ordenId
 * Verificar disponibilidad de inventario para una orden
 */
router.post('/verificar-disponibilidad/:ordenId', authenticateToken, async (req, res) => {
  try {
    const { ordenId } = req.params;

    console.log(`🔍 Verificando disponibilidad para orden ${ordenId}`);

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    const resultado = await autoAssignmentService.verificarDisponibilidad(parseInt(ordenId));

    res.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error verificando disponibilidad:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/auto-assign/asignacion-masiva
 * Procesar asignación masiva de múltiples órdenes
 */
router.post('/asignacion-masiva', authenticateToken, async (req, res) => {
  try {
    const { ordenIds } = req.body;

    if (!ordenIds || !Array.isArray(ordenIds) || ordenIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere un array de IDs de órdenes'
      });
    }

    console.log(`🚀 Iniciando asignación masiva de ${ordenIds.length} órdenes`);

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    // Procesar asignación masiva (en background)
    const resultado = await autoAssignmentService.procesarAsignacionMasiva(ordenIds);

    res.json({
      success: true,
      message: 'Asignación masiva iniciada',
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error en asignación masiva:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// ============================================
// NOTIFICACIONES VÍA CHATWOOT
// ============================================

/**
 * POST /api/auto-assign/notificar-entrega
 * Enviar notificación de entrega de cuenta vía Chatwoot
 */
router.post('/notificar-entrega', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber, accountData } = req.body;

    if (!phoneNumber || !accountData) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere número de teléfono y datos de cuenta'
      });
    }

    console.log(`📱 Enviando notificación de entrega a ${phoneNumber}`);

    // Verificar permisos
    if (!req.user) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    const resultado = await chatwootAutomationService.sendAccountDelivery(
      phoneNumber, 
      accountData
    );

    res.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error enviando notificación de entrega:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/auto-assign/notificar-bienvenida
 * Enviar mensaje de bienvenida vía Chatwoot
 */
router.post('/notificar-bienvenida', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber, welcomeData } = req.body;

    if (!phoneNumber || !welcomeData) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere número de teléfono y datos de bienvenida'
      });
    }

    console.log(`🎉 Enviando mensaje de bienvenida a ${phoneNumber}`);

    // Verificar permisos
    if (!req.user) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    const resultado = await chatwootAutomationService.sendWelcomeMessage(
      phoneNumber, 
      welcomeData
    );

    res.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error enviando mensaje de bienvenida:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/auto-assign/notificar-pago
 * Enviar confirmación de pago vía Chatwoot
 */
router.post('/notificar-pago', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber, paymentData } = req.body;

    if (!phoneNumber || !paymentData) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere número de teléfono y datos de pago'
      });
    }

    console.log(`💳 Enviando confirmación de pago a ${phoneNumber}`);

    // Verificar permisos
    if (!req.user) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    const resultado = await chatwootAutomationService.sendPaymentConfirmation(
      phoneNumber, 
      paymentData
    );

    res.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error enviando confirmación de pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// ============================================
// MENSAJE DIRECTO VÍA CHATWOOT
// ============================================

/**
 * POST /api/auto-assign/enviar-mensaje
 * Enviar mensaje directo vía Chatwoot
 */
router.post('/enviar-mensaje', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber, message, metadata = {} } = req.body;

    if (!phoneNumber || !message) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere número de teléfono y mensaje'
      });
    }

    console.log(`📤 Enviando mensaje directo a ${phoneNumber}`);

    // Verificar permisos
    if (!req.user) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    const resultado = await chatwootAutomationService.sendWhatsAppMessage(
      phoneNumber, 
      message, 
      metadata
    );

    res.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error enviando mensaje directo:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// ============================================
// ESTADÍSTICAS Y REPORTES
// ============================================

/**
 * GET /api/auto-assign/estadisticas
 * Obtener estadísticas de asignación automática
 */
router.get('/estadisticas', authenticateToken, async (req, res) => {
  try {
    const { desde, hasta, servicio } = req.query;

    console.log('📊 Solicitando estadísticas de asignación automática');

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    const filtros = { desde, hasta, servicio };
    const resultado = await autoAssignmentService.getAsignacionStats(filtros);

    res.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * GET /api/auto-assign/chatwoot-stats
 * Obtener estadísticas del servicio de Chatwoot
 */
router.get('/chatwoot-stats', authenticateToken, async (req, res) => {
  try {
    console.log('📊 Solicitando estadísticas de Chatwoot');

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    const resultado = await chatwootAutomationService.getServiceStats();

    res.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de Chatwoot:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// ============================================
// CONFIGURACIÓN Y ESTADO
// ============================================

/**
 * GET /api/auto-assign/estado
 * Obtener estado del sistema de automatización
 */
router.get('/estado', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Verificando estado del sistema de automatización');

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    // Verificar configuración de Chatwoot
    const chatwootStatus = chatwootAutomationService.validateConfiguration();

    // Verificar configuración de email
    const emailService = require('../services/emailService');
    const emailStatus = emailService.validateConfiguration();

    const estado = {
      chatwoot: chatwootStatus,
      email: emailStatus,
      timestamp: new Date().toISOString(),
      servicios: {
        autoAssignment: 'activo',
        chatwootAutomation: chatwootStatus.isValid ? 'activo' : 'inactivo',
        email: emailStatus.isValid ? 'activo' : 'inactivo'
      }
    };

    res.json({
      success: true,
      data: estado
    });

  } catch (error) {
    console.error('❌ Error verificando estado:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/auto-assign/limpiar-cache
 * Limpiar cache de conversaciones de Chatwoot
 */
router.post('/limpiar-cache', authenticateToken, async (req, res) => {
  try {
    console.log('🧹 Limpiando cache de Chatwoot');

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    chatwootAutomationService.clearCache();

    res.json({
      success: true,
      message: 'Cache limpiado exitosamente'
    });

  } catch (error) {
    console.error('❌ Error limpiando cache:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

module.exports = router;
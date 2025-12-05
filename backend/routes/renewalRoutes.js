/**
 * ============================================
 * RENEWAL ROUTES - CUENTY MVP
 * ============================================
 * Rutas para gestión de renovaciones automáticas
 */

const express = require('express');
const router = express.Router();
const renewalService = require('../services/renewalService');
const chatwootAutomationService = require('../services/chatwootAutomationService');
const { authenticateToken } = require('../middleware/auth');

// ============================================
// RENOVACIONES AUTOMÁTICAS
// ============================================

/**
 * POST /api/renewals/verificar-renovaciones
 * Verificar y procesar renovaciones automáticas
 */
router.post('/verificar-renovaciones', authenticateToken, async (req, res) => {
  try {
    console.log('🔄 Solicitando verificación de renovaciones automáticas');

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    const resultado = await renewalService.verificarRenovaciones();

    res.json({
      success: true,
      message: 'Verificación de renovaciones completada',
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error en verificación de renovaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/renewals/verificar-vencimientos
 * Verificar suscripciones próximas a vencer
 */
router.post('/verificar-vencimientos', authenticateToken, async (req, res) => {
  try {
    console.log('⏰ Solicitando verificación de vencimientos');

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    const resultado = await renewalService.verificarVencimientosProximos();

    res.json({
      success: true,
      message: 'Verificación de vencimientos completada',
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error en verificación de vencimientos:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/renewals/procesar-renovacion/:id
 * Procesar renovación de una suscripción específica
 */
router.post('/procesar-renovacion/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    console.log(`🔄 Procesando renovación para suscripción ${id}`);

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    const resultado = await renewalService.procesarRenovacion(parseInt(id));

    if (resultado.success) {
      res.json({
        success: true,
        message: 'Renovación procesada exitosamente',
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
    console.error('❌ Error procesando renovación:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// ============================================
// RECORDATORIOS VÍA CHATWOOT
// ============================================

/**
 * POST /api/renewals/enviar-recordatorio
 * Enviar recordatorio de vencimiento vía Chatwoot
 */
router.post('/enviar-recordatorio', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber, renewalData } = req.body;

    if (!phoneNumber || !renewalData) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere número de teléfono y datos de renovación'
      });
    }

    console.log(`⏰ Enviando recordatorio a ${phoneNumber}`);

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    const resultado = await chatwootAutomationService.sendRenewalReminder(
      phoneNumber, 
      renewalData
    );

    res.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error enviando recordatorio:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/renewals/notificar-renovacion-exitosa
 * Notificar renovación exitosa vía Chatwoot
 */
router.post('/notificar-renovacion-exitosa', authenticateToken, async (req, res) => {
  try {
    const { phoneNumber, renewalData } = req.body;

    if (!phoneNumber || !renewalData) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere número de teléfono y datos de renovación'
      });
    }

    console.log(`🎉 Notificando renovación exitosa a ${phoneNumber}`);

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    // Convertir al formato esperado por el servicio
    const suscripcion = {
      clientes: { telefono: phoneNumber },
      service_plans: { servicios: { nombre: renewalData.service } },
      fecha_proxima_renovacion: renewalData.expirationDate,
      renovaciones_realizadas: renewalData.renewalNumber || 1
    };

    const resultado = await renewalService.notificarRenovacionExitosa(
      { 
        clientes: { telefono: phoneNumber },
        service_plans: { servicios: { nombre: renewalData.service } }
      },
      suscripcion
    );

    res.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error notificando renovación exitosa:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

// ============================================
// GESTIÓN MANUAL DE RENOVACIONES
// ============================================

/**
 * POST /api/renewals/forzar-verificacion
 * Forzar verificación manual completa de renovaciones
 */
router.post('/forzar-verificacion', authenticateToken, async (req, res) => {
  try {
    console.log('🔄 Forzando verificación manual completa');

    // Verificar permisos
    if (!req.user || req.user.rol !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Solo los super administradores pueden forzar verificaciones' 
      });
    }

    // Ejecutar ambas verificaciones
    const [renovacionesResult, vencimientosResult] = await Promise.allSettled([
      renewalService.verificarRenovaciones(),
      renewalService.verificarVencimientosProximos()
    ]);

    const resultado = {
      renovaciones: renovacionesResult.status === 'fulfilled' 
        ? renovacionesResult.value 
        : { success: false, error: renovacionesResult.reason?.message },
      vencimientos: vencimientosResult.status === 'fulfilled' 
        ? vencimientosResult.value 
        : { success: false, error: vencimientosResult.reason?.message }
    };

    res.json({
      success: true,
      message: 'Verificación forzada completada',
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error en verificación forzada:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/renewals/limpiar-logs
 * Limpiar logs antiguos del sistema de renovaciones
 */
router.post('/limpiar-logs', authenticateToken, async (req, res) => {
  try {
    console.log('🧹 Limpiando logs de renovaciones');

    // Verificar permisos
    if (!req.user || req.user.rol !== 'super_admin') {
      return res.status(403).json({ 
        success: false, 
        error: 'Solo los super administradores pueden limpiar logs' 
      });
    }

    await renewalService.limpiarLogsAntiguos();

    res.json({
      success: true,
      message: 'Logs limpiados exitosamente'
    });

  } catch (error) {
    console.error('❌ Error limpiando logs:', error);
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
 * GET /api/renewals/estadisticas
 * Obtener estadísticas de renovaciones
 */
router.get('/estadisticas', authenticateToken, async (req, res) => {
  try {
    const { desde, hasta } = req.query;

    console.log('📊 Solicitando estadísticas de renovaciones');

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    const filtros = { desde, hasta };
    const resultado = await renewalService.getRenewalStats(filtros);

    res.json({
      success: true,
      data: resultado
    });

  } catch (error) {
    console.error('❌ Error obteniendo estadísticas de renovaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * GET /api/renewals/reporte-renovaciones
 * Obtener reporte detallado de renovaciones
 */
router.get('/reporte-renovaciones', authenticateToken, async (req, res) => {
  try {
    const { desde, hasta, servicio } = req.query;

    console.log('📊 Solicitando reporte detallado de renovaciones');

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    // Obtener estadísticas base
    const stats = await renewalService.getRenewalStats({ desde, hasta });

    // TODO: Implementar reporte más detallado con datos específicos
    const reporte = {
      ...stats,
      recomendaciones: [
        'Monitorear tasas de renovación mensual',
        'Identificar servicios con mayor churn',
        'Optimizar timing de recordatorios'
      ]
    };

    res.json({
      success: true,
      data: reporte
    });

  } catch (error) {
    console.error('❌ Error obteniendo reporte de renovaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * GET /api/renewals/renovaciones-proximas
 * Obtener lista de suscripciones próximas a vencer
 */
router.get('/renovaciones-proximas', authenticateToken, async (req, res) => {
  try {
    const { dias = 7 } = req.query;

    console.log(`📋 Obteniendo renovaciones próximas (${dias} días)`);

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    // TODO: Implementar consulta específica para renovaciones próximas
    const proximasRenovaciones = [];

    res.json({
      success: true,
      data: {
        proximasRenovaciones,
        diasLimite: parseInt(dias)
      }
    });

  } catch (error) {
    console.error('❌ Error obteniendo renovaciones próximas:', error);
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
 * GET /api/renewals/estado
 * Obtener estado del sistema de renovaciones
 */
router.get('/estado', authenticateToken, async (req, res) => {
  try {
    console.log('🔍 Verificando estado del sistema de renovaciones');

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    const estado = {
      timestamp: new Date().toISOString(),
      servicios: {
        renewalService: 'activo',
        cronJobs: 'configurado',
        chatwootAutomation: chatwootAutomationService.validateConfiguration().isValid ? 'activo' : 'inactivo'
      },
      config: {
        renovacionesProgramadas: 'diarias 9:00 AM',
        recordatoriosVencimiento: 'cada 6 horas',
        limpiezaLogs: 'diaria 2:00 AM'
      },
      estadisticas: {
        uptime: process.uptime(),
        memoryUsage: process.memoryUsage()
      }
    };

    res.json({
      success: true,
      data: estado
    });

  } catch (error) {
    console.error('❌ Error verificando estado de renovaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

/**
 * POST /api/renewals/programar-notificaciones
 * Programar notificaciones para una suscripción
 */
router.post('/programar-notificaciones', authenticateToken, async (req, res) => {
  try {
    const { suscripcionId } = req.body;

    if (!suscripcionId) {
      return res.status(400).json({
        success: false,
        error: 'Se requiere ID de suscripción'
      });
    }

    console.log(`📅 Programando notificaciones para suscripción ${suscripcionId}`);

    // Verificar permisos
    if (!req.user || (req.user.rol !== 'admin' && req.user.rol !== 'super_admin')) {
      return res.status(403).json({ 
        success: false, 
        error: 'No tienes permisos para realizar esta acción' 
      });
    }

    await renewalService.programarNotificacionesVencimiento(parseInt(suscripcionId));

    res.json({
      success: true,
      message: 'Notificaciones programadas exitosamente'
    });

  } catch (error) {
    console.error('❌ Error programando notificaciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error interno del servidor',
      details: error.message
    });
  }
});

module.exports = router;
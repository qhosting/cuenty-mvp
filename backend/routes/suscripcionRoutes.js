/**
 * Rutas de Suscripciones
 * Define endpoints para administración y gestión de suscripciones
 */

const express = require('express');
const router = express.Router();
const suscripcionController = require('../controllers/suscripcionController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { verifyClientToken } = require('../middleware/clientAuth');

// ============================================================================
// RUTAS DE ADMINISTRADOR
// ============================================================================

/**
 * GET /api/suscripciones/admin
 * Listar todas las suscripciones con filtros opcionales
 */
router.get('/admin', verifyToken, verifyAdmin, suscripcionController.listarSuscripciones);

/**
 * GET /api/suscripciones/admin/estadisticas
 * Obtener estadísticas de suscripciones
 */
router.get('/admin/estadisticas', verifyToken, verifyAdmin, suscripcionController.obtenerEstadisticas);

/**
 * GET /api/suscripciones/admin/:id
 * Obtener detalle de una suscripción específica
 */
router.get('/admin/:id', verifyToken, verifyAdmin, suscripcionController.obtenerSuscripcion);

/**
 * POST /api/suscripciones/admin
 * Crear nueva suscripción manualmente
 */
router.post('/admin', verifyToken, verifyAdmin, suscripcionController.crearSuscripcion);

/**
 * POST /api/suscripciones/admin/:id/pausar
 * Pausar una suscripción activa
 */
router.post('/admin/:id/pausar', verifyToken, verifyAdmin, suscripcionController.pausarSuscripcion);

/**
 * POST /api/suscripciones/admin/:id/reanudar
 * Reanudar una suscripción pausada
 */
router.post('/admin/:id/reanudar', verifyToken, verifyAdmin, suscripcionController.reanudarSuscripcion);

/**
 * POST /api/suscripciones/admin/:id/cancelar
 * Cancelar una suscripción
 */
router.post('/admin/:id/cancelar', verifyToken, verifyAdmin, suscripcionController.cancelarSuscripcion);

/**
 * POST /api/suscripciones/admin/:id/renovar
 * Renovar una suscripción manualmente
 */
router.post('/admin/:id/renovar', verifyToken, verifyAdmin, suscripcionController.renovarSuscripcion);

/**
 * POST /api/suscripciones/admin/verificar-vencimientos
 * Ejecutar verificación de vencimientos manualmente
 */
router.post('/admin/verificar-vencimientos', verifyToken, verifyAdmin, suscripcionController.verificarVencimientos);

// ============================================================================
// RUTAS DE CLIENTE
// ============================================================================

/**
 * GET /api/suscripciones/client
 * Listar suscripciones del cliente autenticado
 */
router.get('/client', verifyClientToken, suscripcionController.listarMisSuscripciones);

/**
 * GET /api/suscripciones/client/:id
 * Obtener detalle de una suscripción del cliente
 */
router.get('/client/:id', verifyClientToken, suscripcionController.obtenerSuscripcion);

/**
 * POST /api/suscripciones/client/:id/renovar
 * Solicitar renovación de una suscripción
 */
router.post('/client/:id/renovar', verifyClientToken, suscripcionController.renovarSuscripcion);

/**
 * PUT /api/suscripciones/client/:id/config
 * Actualizar configuración de una suscripción (ej: renovación automática)
 */
router.put('/client/:id/config', verifyClientToken, suscripcionController.actualizarConfiguracion);

/**
 * POST /api/suscripciones/client/:id/cancelar
 * Cancelar una suscripción del cliente
 */
router.post('/client/:id/cancelar', verifyClientToken, suscripcionController.cancelarSuscripcion);

module.exports = router;

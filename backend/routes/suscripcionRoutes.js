const express = require('express');
const router = express.Router();
const suscripcionController = require('../controllers/suscripcionController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

/**
 * Rutas de Suscripciones
 * Todas las rutas requieren autenticación
 */

// ============================================================================
// RUTAS PÚBLICAS (requieren autenticación de usuario)
// ============================================================================

/**
 * GET /api/suscripciones/usuario/:celular
 * Obtener suscripciones de un usuario específico
 */
router.get('/usuario/:celular', verifyToken, suscripcionController.obtenerSuscripcionesUsuario);

// ============================================================================
// RUTAS DE ADMINISTRACIÓN (requieren autenticación de admin)
// ============================================================================

/**
 * GET /api/suscripciones
 * Obtener todas las suscripciones (con filtros y paginación)
 * Query params: estado, celularUsuario, idPlan, page, limit
 */
router.get('/', verifyAdmin, suscripcionController.obtenerSuscripciones);

/**
 * GET /api/suscripciones/estadisticas
 * Obtener estadísticas de suscripciones
 */
router.get('/estadisticas', verifyAdmin, suscripcionController.obtenerEstadisticas);

/**
 * GET /api/suscripciones/:id
 * Obtener una suscripción por ID
 */
router.get('/:id', verifyAdmin, suscripcionController.obtenerSuscripcionPorId);

/**
 * POST /api/suscripciones
 * Crear una nueva suscripción
 * Body: { celularUsuario, idPlan, idOrden?, fechaInicio?, duracionMeses?, duracionDias?, renovacionAutomatica?, notasAdmin? }
 */
router.post('/', verifyAdmin, suscripcionController.crearSuscripcion);

/**
 * PUT /api/suscripciones/:id
 * Actualizar una suscripción
 * Body: { estado?, fechaVencimiento?, renovacionAutomatica?, notasAdmin? }
 */
router.put('/:id', verifyAdmin, suscripcionController.actualizarSuscripcion);

/**
 * DELETE /api/suscripciones/:id
 * Eliminar una suscripción
 */
router.delete('/:id', verifyAdmin, suscripcionController.eliminarSuscripcion);

/**
 * POST /api/suscripciones/:id/renovar
 * Renovar una suscripción manualmente
 */
router.post('/:id/renovar', verifyAdmin, suscripcionController.renovarSuscripcion);

/**
 * POST /api/suscripciones/verificar-vencimientos
 * Verificar y actualizar suscripciones vencidas (proceso manual)
 */
router.post('/verificar-vencimientos', verifyAdmin, suscripcionController.verificarVencimientos);

/**
 * POST /api/suscripciones/procesar-renovaciones
 * Procesar renovaciones automáticas (proceso manual)
 */
router.post('/procesar-renovaciones', verifyAdmin, suscripcionController.procesarRenovacionesAutomaticas);

module.exports = router;

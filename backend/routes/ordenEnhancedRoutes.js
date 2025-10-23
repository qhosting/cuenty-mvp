
const express = require('express');
const router = express.Router();
const ordenEnhancedController = require('../controllers/ordenEnhancedController');
const { verifyToken, verifyUser, verifyAdmin, optionalToken } = require('../middleware/auth');
const { optionalClientToken } = require('../middleware/clientAuth');
const { validateOrden, validateOrdenEstado } = require('../middleware/validation');

// Middleware combinado: permite autenticación de usuario regular o cliente
const optionalCombinedAuth = (req, res, next) => {
  optionalToken(req, res, () => {
    optionalClientToken(req, res, next);
  });
};

// Rutas de usuario - Ahora con soporte para clientes registrados
router.post('/', verifyToken, verifyUser, optionalCombinedAuth, validateOrden, ordenEnhancedController.crearDesdeCarrito);
router.get('/mis-ordenes', verifyToken, verifyUser, ordenEnhancedController.listarMisOrdenes);
router.get('/:id', verifyToken, ordenEnhancedController.obtenerPorId);

// Rutas de administrador
router.get('/', verifyToken, verifyAdmin, ordenEnhancedController.listarTodas);
router.put('/:id/estado', verifyToken, verifyAdmin, validateOrdenEstado, ordenEnhancedController.actualizarEstado);
router.post('/items/:id_order_item/asignar', verifyToken, verifyAdmin, ordenEnhancedController.asignarCredenciales);
router.post('/items/:id_order_item/entregar', verifyToken, verifyAdmin, ordenEnhancedController.marcarEntregada);
router.get('/admin/estadisticas', verifyToken, verifyAdmin, ordenEnhancedController.obtenerEstadisticas);

module.exports = router;

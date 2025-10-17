
const express = require('express');
const router = express.Router();
const ordenEnhancedController = require('../controllers/ordenEnhancedController');
const { verifyToken, verifyUser, verifyAdmin, optionalToken } = require('../middleware/auth');
const { validateOrden, validateOrdenEstado } = require('../middleware/validation');

// Rutas de usuario
router.post('/', verifyToken, verifyUser, validateOrden, ordenEnhancedController.crearDesdeCarrito);
router.get('/mis-ordenes', verifyToken, verifyUser, ordenEnhancedController.listarMisOrdenes);
router.get('/:id', verifyToken, ordenEnhancedController.obtenerPorId);

// Rutas de administrador
router.get('/', verifyToken, verifyAdmin, ordenEnhancedController.listarTodas);
router.put('/:id/estado', verifyToken, verifyAdmin, validateOrdenEstado, ordenEnhancedController.actualizarEstado);
router.post('/items/:id_order_item/asignar', verifyToken, verifyAdmin, ordenEnhancedController.asignarCredenciales);
router.post('/items/:id_order_item/entregar', verifyToken, verifyAdmin, ordenEnhancedController.marcarEntregada);
router.get('/admin/estadisticas', verifyToken, verifyAdmin, ordenEnhancedController.obtenerEstadisticas);

module.exports = router;

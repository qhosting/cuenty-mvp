const express = require('express');
const router = express.Router();
const paymentConfigController = require('../controllers/paymentConfigController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Ruta pública - obtener configuración activa
router.get('/activa', paymentConfigController.obtenerActiva);

// Rutas protegidas (admin)
router.get('/', verifyToken, verifyAdmin, paymentConfigController.listarTodas);
router.post('/', verifyToken, verifyAdmin, paymentConfigController.crear);
router.put('/:id', verifyToken, verifyAdmin, paymentConfigController.actualizar);
router.patch('/:id/toggle', verifyToken, verifyAdmin, paymentConfigController.toggleActivo);
router.delete('/:id', verifyToken, verifyAdmin, paymentConfigController.eliminar);

module.exports = router;

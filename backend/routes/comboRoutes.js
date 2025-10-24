const express = require('express');
const router = express.Router();
const comboController = require('../controllers/comboController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Rutas públicas
router.get('/activos', comboController.listarActivos);
router.get('/:id', comboController.obtenerPorId);

// Rutas protegidas (admin)
router.get('/', verifyToken, verifyAdmin, comboController.listarTodos);
router.post('/', verifyToken, verifyAdmin, comboController.crear);
router.post('/calcular-totales', verifyToken, verifyAdmin, comboController.calcularTotales);
router.put('/:id', verifyToken, verifyAdmin, comboController.actualizar);
router.delete('/:id', verifyToken, verifyAdmin, comboController.eliminar);

module.exports = router;

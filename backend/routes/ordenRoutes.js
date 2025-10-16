
const express = require('express');
const router = express.Router();
const ordenController = require('../controllers/ordenController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Rutas públicas (para crear órdenes)
router.post('/', ordenController.crear);

// Rutas que requieren autenticación
router.get('/usuario/:celular', ordenController.listarPorUsuario);
router.get('/:id', ordenController.obtenerPorId);

// Rutas de administrador
router.get('/', verifyToken, verifyAdmin, ordenController.listarTodas);
router.post('/:id/aprobar', verifyToken, verifyAdmin, ordenController.aprobarPago);
router.put('/:id/estado', verifyToken, verifyAdmin, ordenController.actualizarEstado);

module.exports = router;

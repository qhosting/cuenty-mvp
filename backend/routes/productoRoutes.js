
const express = require('express');
const router = express.Router();
const productoController = require('../controllers/productoController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Rutas públicas (para clientes)
router.get('/activos', productoController.listarActivos);
router.get('/:id', productoController.obtenerPorId);

// Rutas protegidas (admin)
router.get('/', verifyToken, verifyAdmin, productoController.listarTodos);
router.post('/', verifyToken, verifyAdmin, productoController.crear);
router.put('/:id', verifyToken, verifyAdmin, productoController.actualizar);
router.delete('/:id', verifyToken, verifyAdmin, productoController.eliminar);

module.exports = router;

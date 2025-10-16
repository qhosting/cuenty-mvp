
const express = require('express');
const router = express.Router();
const ticketController = require('../controllers/ticketController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Rutas públicas
router.post('/', ticketController.crear);
router.get('/:id', ticketController.obtenerPorId);

// Rutas de administrador
router.get('/', verifyToken, verifyAdmin, ticketController.listarTodos);
router.get('/stats/general', verifyToken, verifyAdmin, ticketController.obtenerEstadisticas);
router.post('/:id/mensajes', ticketController.agregarMensaje);
router.put('/:id/estado', verifyToken, verifyAdmin, ticketController.actualizarEstado);

module.exports = router;

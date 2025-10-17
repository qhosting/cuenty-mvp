
const express = require('express');
const router = express.Router();
const servicioController = require('../controllers/servicioController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { validateServicio, validateId } = require('../middleware/validation');

// Rutas públicas
router.get('/activos', servicioController.listarActivos);
router.get('/:id', servicioController.obtenerPorId);

// Rutas protegidas (admin)
router.get('/', verifyToken, verifyAdmin, servicioController.listarTodos);
router.post('/', verifyToken, verifyAdmin, validateServicio, servicioController.crear);
router.put('/:id', verifyToken, verifyAdmin, validateId, servicioController.actualizar);
router.delete('/:id', verifyToken, verifyAdmin, validateId, servicioController.eliminar);

module.exports = router;


const express = require('express');
const router = express.Router();
const servicePlanController = require('../controllers/servicePlanController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');
const { validateServicePlan, validateId } = require('../middleware/validation');

// Rutas públicas
router.get('/activos', servicePlanController.listarActivos);
router.get('/:id', servicePlanController.obtenerPorId);

// Rutas protegidas (admin)
router.get('/', verifyToken, verifyAdmin, servicePlanController.listarTodos);
router.post('/', verifyToken, verifyAdmin, validateServicePlan, servicePlanController.crear);
router.put('/:id', verifyToken, verifyAdmin, validateId, servicePlanController.actualizar);
router.delete('/:id', verifyToken, verifyAdmin, validateId, servicePlanController.eliminar);

module.exports = router;

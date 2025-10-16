
const express = require('express');
const router = express.Router();
const cuentaController = require('../controllers/cuentaController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Todas las rutas de cuentas requieren autenticación de admin
router.use(verifyToken, verifyAdmin);

router.get('/', cuentaController.listarTodas);
router.get('/:id', cuentaController.obtenerPorId);
router.post('/', cuentaController.crear);
router.put('/:id/credenciales', cuentaController.actualizarCredenciales);
router.put('/:id/estado', cuentaController.actualizarEstado);
router.delete('/:id', cuentaController.eliminar);

module.exports = router;

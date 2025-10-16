
const express = require('express');
const router = express.Router();
const usuarioController = require('../controllers/usuarioController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Rutas que requieren autenticación de admin
router.get('/', verifyToken, verifyAdmin, usuarioController.listarTodos);
router.get('/:celular', usuarioController.obtenerPorCelular);
router.get('/:celular/estadisticas', usuarioController.obtenerEstadisticas);
router.post('/', verifyToken, verifyAdmin, usuarioController.crear);

module.exports = router;

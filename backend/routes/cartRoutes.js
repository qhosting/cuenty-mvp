
const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const { verifyToken, verifyUser } = require('../middleware/auth');
const { validateCartItem } = require('../middleware/validation');

// Todas las rutas requieren autenticación de usuario
router.get('/', verifyToken, verifyUser, cartController.obtenerCarrito);
router.post('/items', verifyToken, verifyUser, validateCartItem, cartController.agregarItem);
router.put('/items', verifyToken, verifyUser, validateCartItem, cartController.actualizarCantidad);
router.delete('/items/:id_plan', verifyToken, verifyUser, cartController.eliminarItem);
router.delete('/', verifyToken, verifyUser, cartController.vaciarCarrito);
router.get('/disponibilidad', verifyToken, verifyUser, cartController.verificarDisponibilidad);

module.exports = router;

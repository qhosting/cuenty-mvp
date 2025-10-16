
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middleware/auth');

// Registro de admin (proteger en producción)
router.post('/register', authController.registrarAdmin);

// Login
router.post('/login', authController.loginAdmin);

// Obtener perfil (requiere autenticación)
router.get('/profile', verifyToken, authController.obtenerPerfil);

module.exports = router;

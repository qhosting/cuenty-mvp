
const express = require('express');
const router = express.Router();
const authEnhancedController = require('../controllers/authEnhancedController');
const { verifyToken, verifyUser } = require('../middleware/auth');
const { validatePhoneRequest, validateCodeVerification } = require('../middleware/validation');

// Rutas públicas de autenticación con teléfono
router.post('/phone/request-code', validatePhoneRequest, authEnhancedController.solicitarCodigo);
router.post('/phone/verify-code', validateCodeVerification, authEnhancedController.verificarCodigo);

// Rutas protegidas de usuario
router.get('/profile', verifyToken, verifyUser, authEnhancedController.obtenerPerfil);
router.put('/profile', verifyToken, verifyUser, authEnhancedController.actualizarPerfil);
router.post('/logout', verifyToken, authEnhancedController.logout);

module.exports = router;

const express = require('express');
const router = express.Router();
const { verifyClientToken } = require('../middleware/clientAuth');
const clientAuthController = require('../controllers/clientAuthController');
const clientController = require('../controllers/clientController');

// ============================================================================
// AUTENTICACIÓN (Rutas públicas)
// ============================================================================

// Registro
router.post('/auth/register', clientAuthController.register);

// Login
router.post('/auth/login', clientAuthController.login);

// Recuperación de contraseña
router.post('/auth/forgot-password', clientAuthController.requestPasswordReset);
router.post('/auth/reset-password', clientAuthController.resetPassword);

// ============================================================================
// PERFIL (Rutas protegidas)
// ============================================================================

// Obtener perfil
router.get('/profile', verifyClientToken, clientAuthController.getProfile);

// Actualizar perfil
router.put('/profile', verifyClientToken, clientAuthController.updateProfile);

// Cambiar contraseña
router.put('/change-password', verifyClientToken, clientAuthController.changePassword);

// ============================================================================
// DASHBOARD (Rutas protegidas)
// ============================================================================

// Dashboard con resumen
router.get('/dashboard', verifyClientToken, clientController.getDashboard);

// ============================================================================
// ÓRDENES (Rutas protegidas)
// ============================================================================

// Obtener historial de órdenes
router.get('/orders', verifyClientToken, clientController.getOrders);

// Obtener detalle de una orden
router.get('/orders/:id', verifyClientToken, clientController.getOrderById);

// ============================================================================
// CUENTAS (Rutas protegidas)
// ============================================================================

// Obtener todas las cuentas activas
router.get('/accounts', verifyClientToken, clientController.getAccounts);

// Obtener credenciales de una cuenta específica
router.get('/accounts/:id/credentials', verifyClientToken, clientController.getAccountCredentials);

module.exports = router;

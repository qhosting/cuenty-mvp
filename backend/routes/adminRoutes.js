
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authController = require('../controllers/authController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// ============================================================================
// AUTENTICACIÓN
// ============================================================================

// Login de administrador
router.post('/login', authController.loginAdmin);

// Obtener perfil del admin autenticado
router.get('/profile', verifyToken, verifyAdmin, authController.obtenerPerfil);

// ============================================================================
// SERVICIOS DE STREAMING - CRUD
// Requiere autenticación de administrador
// ============================================================================

// Listar todos los servicios (incluye inactivos)
router.get('/services', verifyToken, verifyAdmin, adminController.listarServicios);

// Crear nuevo servicio
router.post('/services', verifyToken, verifyAdmin, adminController.crearServicio);

// Actualizar servicio
router.put('/services/:id', verifyToken, verifyAdmin, adminController.actualizarServicio);

// Eliminar (desactivar) servicio
router.delete('/services/:id', verifyToken, verifyAdmin, adminController.eliminarServicio);

// ============================================================================
// PLANES - CRUD
// Requiere autenticación de administrador
// ============================================================================

// Listar todos los planes (incluye inactivos)
// Query params: ?id_servicio=X para filtrar por servicio
router.get('/plans', verifyToken, verifyAdmin, adminController.listarPlanes);

// Crear nuevo plan
router.post('/plans', verifyToken, verifyAdmin, adminController.crearPlan);

// Actualizar plan
router.put('/plans/:id', verifyToken, verifyAdmin, adminController.actualizarPlan);

// Eliminar (desactivar) plan
router.delete('/plans/:id', verifyToken, verifyAdmin, adminController.eliminarPlan);

// ============================================================================
// GESTIÓN DE ÓRDENES
// Requiere autenticación de administrador
// ============================================================================

// Listar todas las órdenes con filtros
// Query params: ?estado=X&celular=X&fecha_desde=X&fecha_hasta=X&limit=X&offset=X
router.get('/orders', verifyToken, verifyAdmin, adminController.listarOrdenes);

// Obtener detalles de una orden específica
router.get('/orders/:id', verifyToken, verifyAdmin, adminController.obtenerOrden);

// Actualizar estado de una orden
router.put('/orders/:id/status', verifyToken, verifyAdmin, adminController.actualizarEstadoOrden);

// Confirmar pago de una orden (FASE 4.1)
router.post('/orders/:id/confirm-payment', verifyToken, verifyAdmin, adminController.confirmarPago);

// ============================================================================
// CUENTAS DE STREAMING - CRUD
// Requiere autenticación de administrador
// ============================================================================

// Listar cuentas de streaming
// Query params: ?id_plan=X&estado=X&limit=X&offset=X
router.get('/accounts', verifyToken, verifyAdmin, adminController.listarCuentas);

// Crear nueva cuenta
router.post('/accounts', verifyToken, verifyAdmin, adminController.crearCuenta);

// Actualizar cuenta
router.put('/accounts/:id', verifyToken, verifyAdmin, adminController.actualizarCuenta);

// Eliminar cuenta
router.delete('/accounts/:id', verifyToken, verifyAdmin, adminController.eliminarCuenta);

// ============================================================================
// DASHBOARD - ESTADÍSTICAS
// Requiere autenticación de administrador
// ============================================================================

// Obtener estadísticas generales del dashboard
router.get('/dashboard', verifyToken, verifyAdmin, adminController.obtenerDashboard);

// ============================================================================
// CONFIGURACIÓN DE EVOLUTION API
// Requiere autenticación de administrador
// ============================================================================

// Obtener configuración actual de Evolution API
router.get('/config/evolution', verifyToken, verifyAdmin, adminController.obtenerConfigEvolution);

// Guardar/actualizar configuración de Evolution API
router.post('/config/evolution', verifyToken, verifyAdmin, adminController.guardarConfigEvolution);

// ============================================================================
// CONFIGURACIÓN DE CHATWOOT
// Requiere autenticación de administrador
// ============================================================================

// Obtener configuración actual de Chatwoot
router.get('/config/chatwoot', verifyToken, verifyAdmin, adminController.obtenerConfigChatwoot);

// Guardar/actualizar configuración de Chatwoot
router.post('/config/chatwoot', verifyToken, verifyAdmin, adminController.guardarConfigChatwoot);

// ============================================================================
// CONFIGURACIÓN GENERAL (Evolution + Chatwoot)
// Requiere autenticación de administrador
// ============================================================================

// Obtener todas las configuraciones
router.get('/config', verifyToken, verifyAdmin, adminController.obtenerConfiguraciones);

// Guardar todas las configuraciones
router.post('/config', verifyToken, verifyAdmin, adminController.guardarConfiguraciones);

module.exports = router;

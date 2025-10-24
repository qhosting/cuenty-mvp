const express = require('express');
const router = express.Router();
const usersAdminController = require('../controllers/usersAdminController');
const { verifyToken, verifyAdmin } = require('../middleware/auth');

// Todas las rutas requieren autenticación de administrador
router.use(verifyToken, verifyAdmin);

// ============================================================================
// GESTIÓN DE USUARIOS (CLIENTES)
// ============================================================================

// Obtener estadísticas de usuarios
router.get('/stats', usersAdminController.obtenerEstadisticas);

// Listar todos los usuarios
// Query params: ?search=X&activo=true/false&page=1&limit=20
router.get('/', usersAdminController.listarUsuarios);

// Obtener un usuario específico
router.get('/:id', usersAdminController.obtenerUsuario);

// Crear nuevo usuario
router.post('/', usersAdminController.crearUsuario);

// Actualizar usuario
router.put('/:id', usersAdminController.actualizarUsuario);

// Cambiar estado del usuario (activar/desactivar)
router.patch('/:id/status', usersAdminController.cambiarEstadoUsuario);

// Eliminar (desactivar) usuario
router.delete('/:id', usersAdminController.eliminarUsuario);

module.exports = router;

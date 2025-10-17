
const express = require('express');
const router = express.Router();
const contactController = require('../controllers/contactController');

// Ruta pública para enviar mensajes de contacto
router.post('/', contactController.enviarContacto);

module.exports = router;

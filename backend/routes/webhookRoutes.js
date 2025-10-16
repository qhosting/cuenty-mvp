
const express = require('express');
const router = express.Router();
const webhookController = require('../controllers/webhookController');
const webhookAuth = require('../middleware/webhookAuth');

// Webhooks para n8n (protegidos con webhook secret)
router.get('/obtener-cuenta', webhookAuth, webhookController.obtenerCuentaOrden);
router.get('/proximas-vencer', webhookAuth, webhookController.obtenerProximasAVencer);

module.exports = router;

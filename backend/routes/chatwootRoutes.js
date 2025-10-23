
/**
 * ============================================
 * CHATWOOT ROUTES
 * ============================================
 * Rutas para la integración con Chatwoot
 */

const express = require('express');
const router = express.Router();
const chatwootWebhookController = require('../controllers/chatwootWebhookController');

// Webhook para recibir eventos de Chatwoot (sin autenticación para webhooks externos)
router.post('/webhook', chatwootWebhookController.handleChatwootWebhook);

// Endpoints internos (protegidos con autenticación si lo deseas)
router.post('/buscar-info', chatwootWebhookController.buscarInformacionManual);
router.post('/enviar-mensaje', chatwootWebhookController.enviarMensajeChatwoot);
router.get('/configuracion', chatwootWebhookController.probarConfiguracion);

module.exports = router;

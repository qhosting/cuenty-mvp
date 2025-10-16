
/**
 * Middleware para autenticar webhooks de n8n
 */
const webhookAuth = (req, res, next) => {
  const webhookSecret = req.headers['x-webhook-secret'];
  const expectedSecret = process.env.N8N_WEBHOOK_SECRET || 'tu-secreto-webhook-n8n';

  if (!webhookSecret || webhookSecret !== expectedSecret) {
    return res.status(401).json({ error: 'Webhook no autorizado' });
  }

  next();
};

module.exports = webhookAuth;

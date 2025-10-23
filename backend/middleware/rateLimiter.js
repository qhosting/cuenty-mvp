/**
 * RATE LIMITER - Middleware para limitar tasa de peticiones
 * Previene abuso de la API y ataques DDoS básicos
 */

const rateLimit = require('express-rate-limit');

// ============================================================================
// LIMITADORES DE TASA
// ============================================================================

/**
 * Limitador general para todas las rutas
 * Máximo 100 peticiones por 15 minutos por IP
 */
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // 100 peticiones
  message: {
    success: false,
    message: 'Demasiadas peticiones desde esta IP. Por favor intenta de nuevo más tarde.'
  },
  standardHeaders: true, // Retorna info de rate limit en headers
  legacyHeaders: false,
  // Handler personalizado
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Demasiadas peticiones desde esta IP. Por favor intenta de nuevo en 15 minutos.',
      retryAfter: '15 minutos'
    });
  }
});

/**
 * Limitador estricto para login y autenticación
 * Máximo 5 intentos por 15 minutos por IP
 */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 5, // 5 intentos
  message: {
    success: false,
    message: 'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true, // No contar peticiones exitosas
  handler: (req, res) => {
    console.warn(`Rate limit excedido para IP: ${req.ip} en ruta: ${req.path}`);
    res.status(429).json({
      success: false,
      message: 'Demasiados intentos de inicio de sesión. Por favor intenta de nuevo en 15 minutos.',
      retryAfter: '15 minutos'
    });
  }
});

/**
 * Limitador moderado para creación de recursos
 * Máximo 20 peticiones por hora por IP
 */
const createLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 20, // 20 peticiones
  message: {
    success: false,
    message: 'Demasiadas operaciones de creación. Por favor intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Demasiadas operaciones de creación. Por favor intenta de nuevo en 1 hora.',
      retryAfter: '1 hora'
    });
  }
});

/**
 * Limitador para API pública
 * Máximo 50 peticiones por 15 minutos por IP
 */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 50, // 50 peticiones
  message: {
    success: false,
    message: 'Demasiadas peticiones a la API. Por favor intenta de nuevo más tarde.'
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: 'Demasiadas peticiones a la API. Por favor intenta de nuevo en 15 minutos.',
      retryAfter: '15 minutos'
    });
  }
});

module.exports = {
  generalLimiter,
  authLimiter,
  createLimiter,
  apiLimiter
};

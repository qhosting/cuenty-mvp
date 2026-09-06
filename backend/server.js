
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const { createProxyMiddleware } = require('http-proxy-middleware');
require('dotenv').config();

const app = express();

// Environment configuration - Must be defined early
const NEXTJS_PORT = process.env.NEXTJS_PORT || 3001;
const NEXTJS_URL = `http://localhost:${NEXTJS_PORT}`;

// Middlewares de seguridad
// Configure helmet to disable CSP as it blocks Next.js inline scripts
// Next.js requires inline scripts for hydration and functionality
app.use(helmet({
  contentSecurityPolicy: false,
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos solo desde /public (imágenes, etc)
// NO servir index.html automáticamente para evitar conflictos con Next.js
app.use('/public', express.static('public'));

// Proxy helper para rutas API de Next.js
const nextjsApiProxy = createProxyMiddleware({
  target: NEXTJS_URL,
  changeOrigin: true,
  ws: true,
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔀 Proxy API: ${req.method} ${req.originalUrl || req.url} -> ${NEXTJS_URL}${req.originalUrl || req.url}`);
  },
  onError: (err, req, res) => {
    console.error('❌ Error en proxy API a Next.js:', err.message);
    res.status(503).json({ error: 'Servicio frontend no disponible' });
  }
});

// Rutas de la API

// Versión de la API (público)
app.use('/api/version', require('./routes/versionRoutes'));

// Proxy para endpoints de NextAuth hacia Next.js
app.use([
  '/api/auth/session',
  '/api/auth/providers',
  '/api/auth/csrf',
  '/api/auth/signin',
  '/api/auth/callback',
  '/api/auth/signout',
  '/api/auth/error'
], nextjsApiProxy);

// Autenticación Backend
app.use('/api/auth', require('./routes/authRoutes')); // Admin auth (legacy)
app.use('/api/auth/user', require('./routes/authEnhancedRoutes')); // User auth con teléfono

// Admin - Panel de administración completo
app.use('/api/admin', require('./routes/adminRoutes'));

// Admin - Gestión de usuarios
app.use('/api/admin/users', require('./routes/usersAdminRoutes'));

// Cliente - Panel de clientes
app.use('/api/client', require('./routes/clientRoutes'));

// Servicios y Planes (nueva estructura)
app.use('/api/servicios', require('./routes/servicioRoutes'));
app.use('/api/planes', require('./routes/servicePlanRoutes'));
app.use('/api/combos', require('./routes/comboRoutes'));

// Configuración de pago
app.use('/api/payment-config', require('./routes/paymentConfigRoutes'));

// Carrito de compras
app.use('/api/cart', require('./routes/cartRoutes'));

// Órdenes (enhanced)
app.use('/api/ordenes-new', require('./routes/ordenEnhancedRoutes'));

// Suscripciones
app.use('/api/suscripciones', require('./routes/suscripcionRoutes'));

// Legacy routes (mantener compatibilidad)
app.use('/api/productos', require('./routes/productoRoutes'));
app.use('/api/ordenes', require('./routes/ordenRoutes'));
app.use('/api/cuentas', require('./routes/cuentaRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/webhooks/n8n', require('./routes/webhookRoutes'));

// Integración con Chatwoot
app.use('/api/chatwoot', require('./routes/chatwootRoutes'));

// ============================================
// AUTOMATIZACIÓN COMPLETA - FASE 4
// ============================================

// Asignación automática de cuentas
app.use('/api/auto-assign', require('./routes/autoAssignRoutes'));

// Renovaciones automáticas
app.use('/api/renewals', require('./routes/renewalRoutes'));

// Proxies dedicados para rutas de Next.js API
app.use('/api/products', nextjsApiProxy);
app.use('/api/orders', nextjsApiProxy);
app.use('/api/signup', nextjsApiProxy);
app.use('/api/site-config', nextjsApiProxy);

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CUENTY API is running' });
});

// Ruta de información de la API (solo para /api-info)
app.get('/api-info', (req, res) => {
  res.json({
    name: 'CUENTY API - E-Commerce Enhanced',
    version: '2.0.0',
    status: 'online',
    description: 'API completa para gestión de e-commerce de cuentas de streaming',
    endpoints: {
      // Información del sistema
      'version': '/api/version',
      'health': '/health',
      
      // Autenticación
      'auth_admin': '/api/auth',
      'auth_user': '/api/auth/user',
      
      // Admin Panel
      'admin': '/api/admin',
      
      // Nuevas características E-Commerce
      'servicios': '/api/servicios',
      'planes': '/api/planes',
      'carrito': '/api/cart',
      'ordenes_new': '/api/ordenes-new',
      'suscripciones': '/api/suscripciones',
      
      // Legacy (compatibilidad)
      'productos': '/api/productos',
      'ordenes': '/api/ordenes',
      'cuentas': '/api/cuentas',
      'usuarios': '/api/usuarios',
      'tickets': '/api/tickets',
      'contact': '/api/contact',
      'webhooks': '/api/webhooks/n8n',
      
      // Automatización Fase 4
      'auto_assign': '/api/auto-assign',
      'renewals': '/api/renewals'
    },
    features: {
      user_authentication: 'Autenticación con teléfono y código de verificación',
      shopping_cart: 'Carrito de compras completo',
      services_catalog: 'Catálogo de servicios con múltiples planes',
      flexible_pricing: 'Precios con costo y margen de ganancia configurables',
      order_management: 'Gestión avanzada de órdenes con estados',
      payment_instructions: 'Instrucciones de pago bancario automáticas',
      credential_delivery: 'Entrega de credenciales por WhatsApp, email o web',
      admin_panel: 'Panel de administración completo',
      
      // Automatización Fase 4
      auto_assignment: 'Asignación automática de cuentas a órdenes pagadas',
      auto_renewals: 'Renovaciones automáticas con cron jobs',
      chatwoot_integration: 'Envío de mensajes WhatsApp vía Chatwoot',
      email_automation: 'Emails transaccionales automáticos',
      smart_notifications: 'Notificaciones inteligentes de vencimiento',
      bulk_processing: 'Procesamiento masivo de asignaciones'
    },
    documentation: {
      message: 'Documentación completa disponible en /api/docs',
      frontend: '/'
    },
    timestamp: new Date().toISOString()
  });
});

// Proxy para Next.js Frontend - Debe estar DESPUÉS de todas las rutas de API
// pero ANTES del manejo de errores 404
// Proxy fallback para cualquier otra ruta de /api no capturada por Express hacia Next.js
app.use('/api', (req, res, next) => {
  return nextjsApiProxy(req, res, next);
});

// Proxy para Next.js Frontend - Páginas y recursos estáticos
// Solo evitar proxy si es health check, api-info, o archivos estáticos de Express
app.use('/', (req, res, next) => {
  if (req.path.startsWith('/health') || 
      req.path.startsWith('/api-info') ||
      req.path.startsWith('/public')) {
    return next();
  }
  
  // Para todas las demás rutas, hacer proxy a Next.js
  return createProxyMiddleware({
    target: NEXTJS_URL,
    changeOrigin: true,
    ws: true, // Soporte para WebSockets
    onProxyReq: (proxyReq, req, res) => {
      console.log(`🔀 Proxy: ${req.method} ${req.path} -> ${NEXTJS_URL}${req.path}`);
    },
    onError: (err, req, res) => {
      console.error('❌ Error en proxy a Next.js:', err.message);
      console.log(`💡 Asegúrate de que Next.js esté corriendo en ${NEXTJS_URL}`);
      res.status(503).send(`
        <html>
          <head><title>CUENTY - Servicio no disponible</title></head>
          <body style="font-family: Arial, sans-serif; text-align: center; padding: 50px;">
            <h1>🚧 Frontend no disponible</h1>
            <p>El servidor frontend de Next.js no está corriendo.</p>
            <p>Por favor, inicia el sistema con:</p>
            <pre style="background: #f0f0f0; padding: 20px; display: inline-block;">
./start.sh
            </pre>
            <p><a href="/api-info">Ver información de la API</a></p>
          </body>
        </html>
      `);
    }
  })(req, res, next);
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Error interno del servidor', 
    message: process.env.NODE_ENV === 'development' ? err.message : undefined 
  });
});

const packageJson = require('./package.json');
const PORT = process.env.PORT || 3000;

// Inicializar administrador al arrancar
const { initAdmin } = require('./scripts/init-admin');

// Inicializar cron jobs de suscripciones
const { iniciarCronJobs } = require('./utils/cronJobs');

// Función para iniciar el servidor
async function startServer() {
  try {
    // Inicializar administrador
    await initAdmin();
    
    // Iniciar cron jobs de suscripciones
    iniciarCronJobs();
    
    // Iniciar servidor escuchando en 0.0.0.0 para acceso público
    // CRÍTICO: Sin '0.0.0.0', Express escucha solo en localhost
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`
╔═══════════════════════════════════════════════════════════╗
║              🚀 CUENTY API - Sistema Iniciado             ║
╚═══════════════════════════════════════════════════════════╝
  📦 Versión: ${packageJson.version}
  🌐 Puerto: ${PORT}
  🌐 Hostname: 0.0.0.0 (accesible públicamente)
  📊 Entorno: ${process.env.NODE_ENV || 'development'}
  ⏰ Timestamp: ${new Date().toISOString()}
  🔗 API Version: http://localhost:${PORT}/api/version
  🔀 Proxy Frontend: ${NEXTJS_URL}
╔═══════════════════════════════════════════════════════════╗
      `);
    });
  } catch (error) {
    console.error('❌ Error al iniciar el servidor:', error);
    process.exit(1);
  }
}

// Iniciar el servidor
startServer();

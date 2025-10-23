
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

// Rutas de la API

// Versión de la API (público)
app.use('/api/version', require('./routes/versionRoutes'));

// Autenticación
app.use('/api/auth', require('./routes/authRoutes')); // Admin auth (legacy)
app.use('/api/auth/user', require('./routes/authEnhancedRoutes')); // User auth con teléfono

// Admin - Panel de administración completo
app.use('/api/admin', require('./routes/adminRoutes'));

// Cliente - Panel de clientes
app.use('/api/client', require('./routes/clientRoutes'));

// Servicios y Planes (nueva estructura)
app.use('/api/servicios', require('./routes/servicioRoutes'));
app.use('/api/planes', require('./routes/servicePlanRoutes'));

// Suscripciones (Fase 4.3)
app.use('/api/suscripciones', require('./routes/suscripcionRoutes'));

// Carrito de compras
app.use('/api/cart', require('./routes/cartRoutes'));

// Órdenes (enhanced)
app.use('/api/ordenes-new', require('./routes/ordenEnhancedRoutes'));

// Legacy routes (mantener compatibilidad)
app.use('/api/productos', require('./routes/productoRoutes'));
app.use('/api/ordenes', require('./routes/ordenRoutes'));
app.use('/api/cuentas', require('./routes/cuentaRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/contact', require('./routes/contactRoutes'));
app.use('/api/webhooks/n8n', require('./routes/webhookRoutes'));

// Alias para compatibilidad con Next.js frontend  
// Proxy /api/products to Next.js API
app.use('/api/products', createProxyMiddleware({
  target: NEXTJS_URL,
  changeOrigin: true,
  pathRewrite: {
    '^/api/products': '/api/products',
  },
  onProxyReq: (proxyReq, req, res) => {
    console.log(`🔀 Proxy API: ${req.method} ${req.path} -> ${NEXTJS_URL}${req.path}`);
  },
}));

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
      
      // Legacy (compatibilidad)
      'productos': '/api/productos',
      'ordenes': '/api/ordenes',
      'cuentas': '/api/cuentas',
      'usuarios': '/api/usuarios',
      'tickets': '/api/tickets',
      'contact': '/api/contact',
      'webhooks': '/api/webhooks/n8n'
    },
    features: {
      user_authentication: 'Autenticación con teléfono y código de verificación',
      shopping_cart: 'Carrito de compras completo',
      services_catalog: 'Catálogo de servicios con múltiples planes',
      flexible_pricing: 'Precios con costo y margen de ganancia configurables',
      order_management: 'Gestión avanzada de órdenes con estados',
      payment_instructions: 'Instrucciones de pago bancario automáticas',
      credential_delivery: 'Entrega de credenciales por WhatsApp, email o web',
      admin_panel: 'Panel de administración completo'
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
// (NEXTJS_URL defined at top of file)

// Solo hacer proxy si NO es una ruta de API, health check, o recursos estáticos
app.use('/', (req, res, next) => {
  // Si es una ruta de API, health check, o recursos estáticos, pasar al siguiente middleware
  if (req.path.startsWith('/api') || 
      req.path.startsWith('/health') || 
      req.path.startsWith('/api-info') ||
      req.path.startsWith('/public')) {
    return next();
  }
  
  // Para todas las demás rutas, hacer proxy a Next.js
  return createProxyMiddleware({
    target: NEXTJS_URL,
    changeOrigin: true,
    ws: true, // Soporte para WebSockets (útil para hot reload en desarrollo)
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

// Importar cron job de suscripciones
const { inicializarCronJob } = require('./jobs/suscripcionesJob');

// Función para iniciar el servidor
async function startServer() {
  try {
    // Inicializar administrador
    await initAdmin();
    
    // Inicializar cron job de suscripciones
    inicializarCronJob();
    
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

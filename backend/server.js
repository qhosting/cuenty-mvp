
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
require('dotenv').config();

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true
}));
app.use(compression());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estáticos
app.use(express.static('public'));
app.use('/frontend', express.static('../frontend'));

// Rutas de la API

// Versión de la API (público)
app.use('/api/version', require('./routes/versionRoutes'));

// Autenticación
app.use('/api/auth', require('./routes/authRoutes')); // Admin auth (legacy)
app.use('/api/auth/user', require('./routes/authEnhancedRoutes')); // User auth con teléfono

// Admin - Panel de administración completo
app.use('/api/admin', require('./routes/adminRoutes'));

// Servicios y Planes (nueva estructura)
app.use('/api/servicios', require('./routes/servicioRoutes'));
app.use('/api/planes', require('./routes/servicePlanRoutes'));

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

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CUENTY API is running' });
});

// Ruta principal - Información de la API
app.get('/', (req, res) => {
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
      frontend: '/frontend/customer/'
    },
    timestamp: new Date().toISOString()
  });
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

app.listen(PORT, () => {
  console.log(`
╔═══════════════════════════════════════════════════════════╗
║              🚀 CUENTY API - Sistema Iniciado             ║
╚═══════════════════════════════════════════════════════════╝
  📦 Versión: ${packageJson.version}
  🌐 Puerto: ${PORT}
  📊 Entorno: ${process.env.NODE_ENV || 'development'}
  ⏰ Timestamp: ${new Date().toISOString()}
  🔗 API Version: http://localhost:${PORT}/api/version
╔═══════════════════════════════════════════════════════════╗
  `);
});


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
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/productos', require('./routes/productoRoutes'));
app.use('/api/ordenes', require('./routes/ordenRoutes'));
app.use('/api/cuentas', require('./routes/cuentaRoutes'));
app.use('/api/usuarios', require('./routes/usuarioRoutes'));
app.use('/api/tickets', require('./routes/ticketRoutes'));
app.use('/api/webhooks/n8n', require('./routes/webhookRoutes'));

// Ruta de salud del servidor
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'CUENTY API is running' });
});

// Ruta principal - Información de la API
app.get('/', (req, res) => {
  res.json({
    name: 'CUENTY API',
    version: '1.0.0',
    status: 'online',
    description: 'API para gestión de productos digitales y cuentas',
    endpoints: {
      auth: '/api/auth',
      productos: '/api/productos',
      ordenes: '/api/ordenes',
      cuentas: '/api/cuentas',
      usuarios: '/api/usuarios',
      tickets: '/api/tickets',
      webhooks: '/api/webhooks/n8n',
      health: '/health'
    },
    documentation: {
      message: 'Para más información sobre los endpoints disponibles, contacta al administrador',
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 CUENTY API corriendo en puerto ${PORT}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV || 'development'}`);
});

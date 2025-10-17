const express = require('express');
const router = express.Router();
const packageJson = require('../package.json');

/**
 * GET /api/version
 * Retorna información sobre la versión actual de la API
 * Endpoint público para verificación rápida de versión en producción
 */
router.get('/', (req, res) => {
  try {
    const versionInfo = {
      version: packageJson.version,
      environment: process.env.NODE_ENV || 'development',
      timestamp: new Date().toISOString(),
      name: packageJson.name,
      description: packageJson.description
    };

    res.json(versionInfo);
  } catch (error) {
    console.error('Error al obtener información de versión:', error);
    res.status(500).json({ 
      error: 'Error al obtener información de versión',
      version: 'unknown' 
    });
  }
});

module.exports = router;

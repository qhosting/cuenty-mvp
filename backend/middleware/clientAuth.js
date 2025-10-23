const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-jwt-cambiar-en-produccion';

/**
 * Middleware para verificar el token JWT de cliente
 */
const verifyClientToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar que es un token de cliente
    if (!decoded.isCliente || !decoded.clienteId) {
      return res.status(403).json({ 
        error: 'Token inválido. Se requiere autenticación de cliente' 
      });
    }

    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

/**
 * Middleware opcional para verificar token de cliente (no falla si no hay token)
 */
const optionalClientToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      if (decoded.isCliente && decoded.clienteId) {
        req.user = decoded;
      }
    } catch (error) {
      // Token inválido pero no falla la petición
      req.user = null;
    }
  }
  
  next();
};

module.exports = {
  verifyClientToken,
  optionalClientToken
};

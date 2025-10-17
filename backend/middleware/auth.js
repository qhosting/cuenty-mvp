
const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'tu-secreto-jwt-cambiar-en-produccion';

/**
 * Middleware para verificar el token JWT
 */
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

/**
 * Middleware para verificar que el usuario es administrador
 */
const verifyAdmin = (req, res, next) => {
  if (!req.user || !req.user.isAdmin) {
    return res.status(403).json({ error: 'Acceso denegado. Se requieren permisos de administrador' });
  }
  next();
};

/**
 * Middleware para verificar que es un usuario regular (no admin)
 */
const verifyUser = (req, res, next) => {
  if (!req.user || !req.user.isUser) {
    return res.status(403).json({ error: 'Acceso denegado. Se requiere autenticación de usuario' });
  }
  next();
};

/**
 * Middleware opcional para verificar token (no falla si no hay token)
 */
const optionalToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  
  if (token) {
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
    } catch (error) {
      // Token inválido pero no falla la petición
      req.user = null;
    }
  }
  
  next();
};

/**
 * Genera un token JWT para un usuario
 * @param {object} payload - Datos a incluir en el token
 * @returns {string} - Token JWT
 */
const generateToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};

module.exports = {
  verifyToken,
  verifyAdmin,
  verifyUser,
  optionalToken,
  generateToken
};

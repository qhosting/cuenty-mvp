const { body, param, query, validationResult } = require('express-validator');

/**
 * Middleware para manejar errores de validación
 */
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      error: 'Errores de validación',
      details: errors.array()
    });
  }
  
  next();
};

/**
 * Validaciones para autenticación
 */
const validatePhoneRequest = [
  body('celular')
    .notEmpty().withMessage('Celular es requerido')
    .matches(/^\d{10}$/).withMessage('El celular debe tener 10 dígitos'),
  handleValidationErrors
];

const validateCodeVerification = [
  body('celular')
    .notEmpty().withMessage('Celular es requerido')
    .matches(/^\d{10}$/).withMessage('El celular debe tener 10 dígitos'),
  body('codigo')
    .notEmpty().withMessage('Código es requerido')
    .isLength({ min: 6, max: 6 }).withMessage('El código debe tener 6 dígitos'),
  handleValidationErrors
];

/**
 * Validaciones para servicios
 */
const validateServicio = [
  body('nombre')
    .notEmpty().withMessage('Nombre es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('descripcion')
    .optional()
    .isLength({ max: 500 }).withMessage('La descripción no puede exceder 500 caracteres'),
  body('categoria')
    .optional()
    .isIn(['streaming', 'musica', 'gaming', 'educacion', 'otro']).withMessage('Categoría inválida'),
  handleValidationErrors
];

/**
 * Validaciones para planes de servicio
 */
const validateServicePlan = [
  body('id_servicio')
    .notEmpty().withMessage('id_servicio es requerido')
    .isInt({ min: 1 }).withMessage('id_servicio debe ser un número positivo'),
  body('nombre_plan')
    .notEmpty().withMessage('nombre_plan es requerido')
    .isLength({ min: 2, max: 100 }).withMessage('El nombre debe tener entre 2 y 100 caracteres'),
  body('duracion_meses')
    .notEmpty().withMessage('duracion_meses es requerido')
    .isInt({ min: 1, max: 24 }).withMessage('La duración debe estar entre 1 y 24 meses'),
  body('costo')
    .notEmpty().withMessage('costo es requerido')
    .isFloat({ min: 0 }).withMessage('El costo debe ser un número positivo'),
  body('margen_ganancia')
    .notEmpty().withMessage('margen_ganancia es requerido')
    .isFloat({ min: 0 }).withMessage('El margen debe ser un número positivo'),
  handleValidationErrors
];

/**
 * Validaciones para carrito
 */
const validateCartItem = [
  body('id_plan')
    .notEmpty().withMessage('id_plan es requerido')
    .isInt({ min: 1 }).withMessage('id_plan debe ser un número positivo'),
  body('cantidad')
    .optional()
    .isInt({ min: 1, max: 10 }).withMessage('La cantidad debe estar entre 1 y 10'),
  handleValidationErrors
];

/**
 * Validaciones para órdenes
 */
const validateOrden = [
  body('metodo_entrega')
    .optional()
    .isIn(['whatsapp', 'email', 'website']).withMessage('Método de entrega inválido'),
  handleValidationErrors
];

const validateOrdenEstado = [
  body('estado')
    .notEmpty().withMessage('Estado es requerido')
    .isIn(['pendiente', 'pendiente_pago', 'pagada', 'en_proceso', 'entregada', 'cancelada'])
    .withMessage('Estado inválido'),
  handleValidationErrors
];

/**
 * Validaciones de parámetros ID
 */
const validateId = [
  param('id').isInt({ min: 1 }).withMessage('ID inválido'),
  handleValidationErrors
];

module.exports = {
  handleValidationErrors,
  validatePhoneRequest,
  validateCodeVerification,
  validateServicio,
  validateServicePlan,
  validateCartItem,
  validateOrden,
  validateOrdenEstado,
  validateId
};

/**
 * VALIDATORS - Módulo de validaciones centralizadas para CUENTY MVP
 * Proporciona funciones de validación robustas para todos los inputs del sistema
 */

// ============================================================================
// VALIDADORES GENERALES
// ============================================================================

/**
 * Valida que un campo no esté vacío
 */
const isRequired = (value, fieldName) => {
  if (value === undefined || value === null || value === '') {
    return { valid: false, message: `${fieldName} es requerido` };
  }
  return { valid: true };
};

/**
 * Valida que un string tenga una longitud mínima y máxima
 */
const validateStringLength = (value, fieldName, min = 1, max = 255) => {
  if (typeof value !== 'string') {
    return { valid: false, message: `${fieldName} debe ser un texto` };
  }
  
  const trimmed = value.trim();
  
  if (trimmed.length < min) {
    return { valid: false, message: `${fieldName} debe tener al menos ${min} caracteres` };
  }
  
  if (trimmed.length > max) {
    return { valid: false, message: `${fieldName} no puede exceder ${max} caracteres` };
  }
  
  return { valid: true, value: trimmed };
};

/**
 * Valida que un valor sea un número dentro de un rango
 */
const validateNumber = (value, fieldName, min = null, max = null) => {
  const num = Number(value);
  
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} debe ser un número válido` };
  }
  
  if (min !== null && num < min) {
    return { valid: false, message: `${fieldName} debe ser mayor o igual a ${min}` };
  }
  
  if (max !== null && num > max) {
    return { valid: false, message: `${fieldName} debe ser menor o igual a ${max}` };
  }
  
  return { valid: true, value: num };
};

/**
 * Valida formato de URL
 */
const validateURL = (value, fieldName, required = false) => {
  if (!value || value.trim() === '') {
    if (required) {
      return { valid: false, message: `${fieldName} es requerida` };
    }
    return { valid: true, value: null };
  }
  
  try {
    const url = new URL(value);
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, message: `${fieldName} debe ser una URL HTTP o HTTPS válida` };
    }
    return { valid: true, value: value.trim() };
  } catch (error) {
    return { valid: false, message: `${fieldName} debe ser una URL válida` };
  }
};

/**
 * Valida formato de email
 */
const validateEmail = (value, fieldName, required = false) => {
  if (!value || value.trim() === '') {
    if (required) {
      return { valid: false, message: `${fieldName} es requerido` };
    }
    return { valid: true, value: null };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(value)) {
    return { valid: false, message: `${fieldName} debe ser un email válido` };
  }
  
  return { valid: true, value: value.trim().toLowerCase() };
};

/**
 * Valida que un valor esté dentro de un conjunto de valores permitidos
 */
const validateEnum = (value, fieldName, allowedValues) => {
  if (!allowedValues.includes(value)) {
    return { 
      valid: false, 
      message: `${fieldName} debe ser uno de: ${allowedValues.join(', ')}` 
    };
  }
  return { valid: true, value };
};

/**
 * Valida formato de teléfono (Chile)
 */
const validatePhone = (value, fieldName) => {
  if (!value || value.trim() === '') {
    return { valid: false, message: `${fieldName} es requerido` };
  }
  
  // Remover espacios y caracteres especiales
  const cleaned = value.replace(/[\s\-\(\)]/g, '');
  
  // Validar que solo contenga números y tenga entre 9 y 15 dígitos
  const phoneRegex = /^\+?[0-9]{9,15}$/;
  
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, message: `${fieldName} debe ser un número válido (9-15 dígitos)` };
  }
  
  return { valid: true, value: cleaned };
};

/**
 * Sanitiza texto para prevenir XSS
 */
const sanitizeText = (value) => {
  if (typeof value !== 'string') return value;
  
  return value
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
};

// ============================================================================
// VALIDADORES ESPECÍFICOS DE NEGOCIO
// ============================================================================

/**
 * Valida datos de un servicio de streaming
 */
const validateServicioData = (data) => {
  const errors = [];
  
  // Nombre (requerido, 3-100 caracteres)
  const nombreValidation = validateStringLength(data.nombre, 'Nombre del servicio', 3, 100);
  if (!nombreValidation.valid) {
    errors.push(nombreValidation.message);
  }
  
  // Descripción (opcional, máximo 500 caracteres)
  if (data.descripcion) {
    const descValidation = validateStringLength(data.descripcion, 'Descripción', 0, 500);
    if (!descValidation.valid) {
      errors.push(descValidation.message);
    }
  }
  
  // Logo URL (opcional)
  if (data.logo_url) {
    const logoValidation = validateURL(data.logo_url, 'Logo URL', false);
    if (!logoValidation.valid) {
      errors.push(logoValidation.message);
    }
  }
  
  // Categoría (opcional, máximo 50 caracteres)
  if (data.categoria) {
    const catValidation = validateStringLength(data.categoria, 'Categoría', 0, 50);
    if (!catValidation.valid) {
      errors.push(catValidation.message);
    }
  }
  
  // Activo (boolean)
  if (data.activo !== undefined && typeof data.activo !== 'boolean') {
    errors.push('Activo debe ser verdadero o falso');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      nombre: data.nombre ? data.nombre.trim() : null,
      descripcion: data.descripcion ? data.descripcion.trim() : null,
      logo_url: data.logo_url ? data.logo_url.trim() : null,
      categoria: data.categoria ? data.categoria.trim() : 'streaming',
      activo: data.activo !== undefined ? data.activo : true
    }
  };
};

/**
 * Valida datos de un plan de servicio
 */
const validatePlanData = (data) => {
  const errors = [];
  
  // ID de servicio (requerido)
  if (!data.servicio_id && !data.id_servicio) {
    errors.push('ID de servicio es requerido');
  }
  
  // Nombre del plan (requerido, 3-100 caracteres)
  const nombreValidation = validateStringLength(
    data.nombre || data.nombre_plan, 
    'Nombre del plan', 
    3, 
    100
  );
  if (!nombreValidation.valid) {
    errors.push(nombreValidation.message);
  }
  
  // Duración en meses (requerido, 1-36 meses)
  const duracionValidation = validateNumber(
    data.duracion_meses, 
    'Duración', 
    1, 
    36
  );
  if (!duracionValidation.valid) {
    errors.push(duracionValidation.message);
  }
  
  // Precio (requerido, > 0)
  const precioValidation = validateNumber(data.precio, 'Precio', 0.01);
  if (!precioValidation.valid) {
    errors.push(precioValidation.message);
  }
  
  // Costo (opcional, >= 0)
  if (data.costo !== undefined) {
    const costoValidation = validateNumber(data.costo, 'Costo', 0);
    if (!costoValidation.valid) {
      errors.push(costoValidation.message);
    }
  }
  
  // Margen de ganancia (opcional, 0-100%)
  if (data.margen_ganancia !== undefined) {
    const margenValidation = validateNumber(data.margen_ganancia, 'Margen de ganancia', 0, 100);
    if (!margenValidation.valid) {
      errors.push(margenValidation.message);
    }
  }
  
  // Descripción (opcional, máximo 500 caracteres)
  if (data.descripcion) {
    const descValidation = validateStringLength(data.descripcion, 'Descripción', 0, 500);
    if (!descValidation.valid) {
      errors.push(descValidation.message);
    }
  }
  
  // Activo (boolean)
  if (data.activo !== undefined && typeof data.activo !== 'boolean') {
    errors.push('Activo debe ser verdadero o falso');
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      id_servicio: data.servicio_id || data.id_servicio,
      nombre_plan: (data.nombre || data.nombre_plan || '').trim(),
      duracion_meses: duracionValidation.value || data.duracion_meses,
      precio: precioValidation.value || data.precio,
      costo: data.costo,
      margen_ganancia: data.margen_ganancia,
      descripcion: data.descripcion ? data.descripcion.trim() : null,
      activo: data.activo !== undefined ? data.activo : true
    }
  };
};

/**
 * Valida datos de una cuenta de streaming
 */
const validateCuentaData = (data) => {
  const errors = [];
  
  // ID de plan (requerido)
  if (!data.id_plan) {
    errors.push('ID de plan es requerido');
  }
  
  // Correo (requerido)
  const correoValidation = validateEmail(data.correo, 'Correo electrónico', true);
  if (!correoValidation.valid) {
    errors.push(correoValidation.message);
  }
  
  // Contraseña (requerida, mínimo 6 caracteres)
  const passwordValidation = validateStringLength(data.contrasena, 'Contraseña', 6, 100);
  if (!passwordValidation.valid) {
    errors.push(passwordValidation.message);
  }
  
  // Perfil (opcional, máximo 50 caracteres)
  if (data.perfil) {
    const perfilValidation = validateStringLength(data.perfil, 'Perfil', 0, 50);
    if (!perfilValidation.valid) {
      errors.push(perfilValidation.message);
    }
  }
  
  // PIN (opcional, 4-10 caracteres numéricos)
  if (data.pin) {
    const pinValidation = validateStringLength(data.pin, 'PIN', 0, 10);
    if (!pinValidation.valid) {
      errors.push(pinValidation.message);
    }
  }
  
  // Notas (opcional, máximo 500 caracteres)
  if (data.notas) {
    const notasValidation = validateStringLength(data.notas, 'Notas', 0, 500);
    if (!notasValidation.valid) {
      errors.push(notasValidation.message);
    }
  }
  
  // Estado (opcional, enum)
  if (data.estado) {
    const estadoValidation = validateEnum(
      data.estado, 
      'Estado', 
      ['disponible', 'asignada', 'mantenimiento', 'bloqueada']
    );
    if (!estadoValidation.valid) {
      errors.push(estadoValidation.message);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      id_plan: data.id_plan,
      correo: correoValidation.value || data.correo,
      contrasena: passwordValidation.value || data.contrasena,
      perfil: data.perfil ? data.perfil.trim() : null,
      pin: data.pin ? data.pin.trim() : null,
      notas: data.notas ? data.notas.trim() : null,
      estado: data.estado || 'disponible'
    }
  };
};

/**
 * Valida cambio de estado de orden
 */
const validateOrdenEstado = (estadoActual, estadoNuevo) => {
  const transicionesValidas = {
    'pendiente': ['pendiente_pago', 'cancelada'],
    'pendiente_pago': ['pagada', 'cancelada'],
    'pagada': ['en_proceso', 'cancelada'],
    'en_proceso': ['entregada', 'cancelada'],
    'entregada': [],
    'cancelada': []
  };
  
  const estadosValidos = Object.keys(transicionesValidas);
  
  // Validar que el estado nuevo sea válido
  if (!estadosValidos.includes(estadoNuevo)) {
    return {
      valid: false,
      message: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
    };
  }
  
  // Validar transición
  const transicionesPosibles = transicionesValidas[estadoActual] || [];
  
  if (!transicionesPosibles.includes(estadoNuevo)) {
    return {
      valid: false,
      message: `No se puede cambiar de "${estadoActual}" a "${estadoNuevo}". Transiciones válidas: ${transicionesPosibles.join(', ') || 'ninguna'}`
    };
  }
  
  return { valid: true, value: estadoNuevo };
};

/**
 * Valida datos de actualización de orden
 */
const validateOrdenUpdate = (data) => {
  const errors = [];
  
  // Estado (opcional pero si se proporciona debe ser válido)
  if (data.estado) {
    const estadosValidos = ['pendiente', 'pendiente_pago', 'pagada', 'en_proceso', 'entregada', 'cancelada'];
    const estadoValidation = validateEnum(data.estado, 'Estado', estadosValidos);
    if (!estadoValidation.valid) {
      errors.push(estadoValidation.message);
    }
  }
  
  // Notas de admin (opcional, máximo 1000 caracteres)
  if (data.notas_admin) {
    const notasValidation = validateStringLength(data.notas_admin, 'Notas de administrador', 0, 1000);
    if (!notasValidation.valid) {
      errors.push(notasValidation.message);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
    sanitized: {
      estado: data.estado,
      notas_admin: data.notas_admin ? data.notas_admin.trim() : null
    }
  };
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Validadores generales
  isRequired,
  validateStringLength,
  validateNumber,
  validateURL,
  validateEmail,
  validateEnum,
  validatePhone,
  sanitizeText,
  
  // Validadores específicos
  validateServicioData,
  validatePlanData,
  validateCuentaData,
  validateOrdenEstado,
  validateOrdenUpdate
};

/**
 * VALIDATORS - Módulo de validaciones centralizadas para el Frontend
 * Proporciona funciones de validación robustas para formularios
 */

// ============================================================================
// TIPOS
// ============================================================================

interface ValidationResult {
  valid: boolean
  message?: string
  value?: any
}

interface ValidationErrors {
  [key: string]: string
}

// ============================================================================
// VALIDADORES GENERALES
// ============================================================================

/**
 * Valida que un campo no esté vacío
 */
export const isRequired = (value: any, fieldName: string): ValidationResult => {
  if (value === undefined || value === null || value === '') {
    return { valid: false, message: `${fieldName} es requerido` }
  }
  return { valid: true, value }
}

/**
 * Valida que un string tenga una longitud mínima y máxima
 */
export const validateStringLength = (
  value: string,
  fieldName: string,
  min: number = 1,
  max: number = 255
): ValidationResult => {
  if (typeof value !== 'string') {
    return { valid: false, message: `${fieldName} debe ser un texto` }
  }
  
  const trimmed = value.trim()
  
  if (trimmed.length < min) {
    return { valid: false, message: `${fieldName} debe tener al menos ${min} caracteres` }
  }
  
  if (trimmed.length > max) {
    return { valid: false, message: `${fieldName} no puede exceder ${max} caracteres` }
  }
  
  return { valid: true, value: trimmed }
}

/**
 * Valida que un valor sea un número dentro de un rango
 */
export const validateNumber = (
  value: any,
  fieldName: string,
  min: number | null = null,
  max: number | null = null
): ValidationResult => {
  const num = Number(value)
  
  if (isNaN(num)) {
    return { valid: false, message: `${fieldName} debe ser un número válido` }
  }
  
  if (min !== null && num < min) {
    return { valid: false, message: `${fieldName} debe ser mayor o igual a ${min}` }
  }
  
  if (max !== null && num > max) {
    return { valid: false, message: `${fieldName} debe ser menor o igual a ${max}` }
  }
  
  return { valid: true, value: num }
}

/**
 * Valida formato de URL
 */
export const validateURL = (
  value: string,
  fieldName: string,
  required: boolean = false
): ValidationResult => {
  if (!value || value.trim() === '') {
    if (required) {
      return { valid: false, message: `${fieldName} es requerida` }
    }
    return { valid: true, value: null }
  }
  
  try {
    const url = new URL(value)
    if (!['http:', 'https:'].includes(url.protocol)) {
      return { valid: false, message: `${fieldName} debe ser una URL HTTP o HTTPS válida` }
    }
    return { valid: true, value: value.trim() }
  } catch (error) {
    return { valid: false, message: `${fieldName} debe ser una URL válida` }
  }
}

/**
 * Valida formato de email
 */
export const validateEmail = (
  value: string,
  fieldName: string,
  required: boolean = false
): ValidationResult => {
  if (!value || value.trim() === '') {
    if (required) {
      return { valid: false, message: `${fieldName} es requerido` }
    }
    return { valid: true, value: null }
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  
  if (!emailRegex.test(value)) {
    return { valid: false, message: `${fieldName} debe ser un email válido` }
  }
  
  return { valid: true, value: value.trim().toLowerCase() }
}

// ============================================================================
// VALIDADORES ESPECÍFICOS DE NEGOCIO
// ============================================================================

/**
 * Valida datos de un servicio de streaming
 */
export const validateServiceData = (data: {
  nombre?: string
  descripcion?: string
  logo_url?: string
  categoria?: string
  activo?: boolean
}): { valid: boolean; errors: ValidationErrors } => {
  const errors: ValidationErrors = {}
  
  // Nombre (requerido, 3-100 caracteres)
  if (!data.nombre) {
    errors.nombre = 'Nombre del servicio es requerido'
  } else {
    const nombreValidation = validateStringLength(data.nombre, 'Nombre del servicio', 3, 100)
    if (!nombreValidation.valid) {
      errors.nombre = nombreValidation.message || 'Nombre inválido'
    }
  }
  
  // Descripción (opcional, máximo 500 caracteres)
  if (data.descripcion) {
    const descValidation = validateStringLength(data.descripcion, 'Descripción', 0, 500)
    if (!descValidation.valid) {
      errors.descripcion = descValidation.message || 'Descripción inválida'
    }
  }
  
  // Logo URL (opcional)
  if (data.logo_url) {
    const logoValidation = validateURL(data.logo_url, 'Logo URL', false)
    if (!logoValidation.valid) {
      errors.logo_url = logoValidation.message || 'URL inválida'
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Valida datos de un plan de servicio
 */
export const validatePlanData = (data: {
  servicio_id?: string | number
  nombre?: string
  duracion_meses?: string | number
  precio?: string | number
  slots_disponibles?: string | number
}): { valid: boolean; errors: ValidationErrors } => {
  const errors: ValidationErrors = {}
  
  // Servicio ID (requerido)
  if (!data.servicio_id) {
    errors.servicio_id = 'Debe seleccionar un servicio'
  }
  
  // Nombre del plan (requerido, 3-100 caracteres)
  if (!data.nombre) {
    errors.nombre = 'Nombre del plan es requerido'
  } else {
    const nombreValidation = validateStringLength(data.nombre, 'Nombre del plan', 3, 100)
    if (!nombreValidation.valid) {
      errors.nombre = nombreValidation.message || 'Nombre inválido'
    }
  }
  
  // Duración en meses (requerido, 1-36 meses)
  if (!data.duracion_meses) {
    errors.duracion_meses = 'Duración es requerida'
  } else {
    const duracionValidation = validateNumber(data.duracion_meses, 'Duración', 1, 36)
    if (!duracionValidation.valid) {
      errors.duracion_meses = duracionValidation.message || 'Duración inválida'
    }
  }
  
  // Precio (requerido, > 0)
  if (data.precio === undefined || data.precio === null || data.precio === '') {
    errors.precio = 'Precio es requerido'
  } else {
    const precioValidation = validateNumber(data.precio, 'Precio', 1)
    if (!precioValidation.valid) {
      errors.precio = precioValidation.message || 'Precio inválido'
    }
  }
  
  // Slots disponibles (opcional, 1-10)
  if (data.slots_disponibles !== undefined && data.slots_disponibles !== '') {
    const slotsValidation = validateNumber(data.slots_disponibles, 'Slots disponibles', 1, 10)
    if (!slotsValidation.valid) {
      errors.slots_disponibles = slotsValidation.message || 'Slots inválido'
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Valida datos de una cuenta de streaming
 */
export const validateAccountData = (data: {
  id_plan?: string | number
  correo?: string
  contrasena?: string
  perfil?: string
  pin?: string
  notas?: string
  estado?: string
}): { valid: boolean; errors: ValidationErrors } => {
  const errors: ValidationErrors = {}
  
  // ID de plan (requerido)
  if (!data.id_plan) {
    errors.id_plan = 'Debe seleccionar un plan'
  }
  
  // Correo (requerido)
  if (!data.correo) {
    errors.correo = 'Correo electrónico es requerido'
  } else {
    const correoValidation = validateEmail(data.correo, 'Correo electrónico', true)
    if (!correoValidation.valid) {
      errors.correo = correoValidation.message || 'Correo inválido'
    }
  }
  
  // Contraseña (requerida, mínimo 6 caracteres)
  if (!data.contrasena) {
    errors.contrasena = 'Contraseña es requerida'
  } else {
    const passwordValidation = validateStringLength(data.contrasena, 'Contraseña', 6, 100)
    if (!passwordValidation.valid) {
      errors.contrasena = passwordValidation.message || 'Contraseña inválida'
    }
  }
  
  // Perfil (opcional, máximo 50 caracteres)
  if (data.perfil) {
    const perfilValidation = validateStringLength(data.perfil, 'Perfil', 0, 50)
    if (!perfilValidation.valid) {
      errors.perfil = perfilValidation.message || 'Perfil inválido'
    }
  }
  
  // PIN (opcional, 4-10 caracteres)
  if (data.pin) {
    const pinValidation = validateStringLength(data.pin, 'PIN', 0, 10)
    if (!pinValidation.valid) {
      errors.pin = pinValidation.message || 'PIN inválido'
    }
  }
  
  // Notas (opcional, máximo 500 caracteres)
  if (data.notas) {
    const notasValidation = validateStringLength(data.notas, 'Notas', 0, 500)
    if (!notasValidation.valid) {
      errors.notas = notasValidation.message || 'Notas inválidas'
    }
  }
  
  // Estado (opcional, enum)
  if (data.estado) {
    const estadosValidos = ['disponible', 'asignada', 'mantenimiento', 'bloqueada']
    if (!estadosValidos.includes(data.estado)) {
      errors.estado = `Estado debe ser uno de: ${estadosValidos.join(', ')}`
    }
  }
  
  return {
    valid: Object.keys(errors).length === 0,
    errors
  }
}

/**
 * Formatea un número como moneda chilena
 */
export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('es-CL', {
    style: 'currency',
    currency: 'CLP',
    minimumFractionDigits: 0
  }).format(value)
}

/**
 * Valida y formatea un número de teléfono chileno
 */
export const validatePhoneNumber = (value: string): ValidationResult => {
  if (!value || value.trim() === '') {
    return { valid: false, message: 'Teléfono es requerido' }
  }
  
  // Remover espacios y caracteres especiales
  const cleaned = value.replace(/[\s\-\(\)]/g, '')
  
  // Validar que solo contenga números y tenga entre 9 y 15 dígitos
  const phoneRegex = /^\+?[0-9]{9,15}$/
  
  if (!phoneRegex.test(cleaned)) {
    return { valid: false, message: 'Teléfono debe ser un número válido (9-15 dígitos)' }
  }
  
  return { valid: true, value: cleaned }
}

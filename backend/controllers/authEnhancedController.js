const Usuario = require('../models/Usuario');
const PhoneVerification = require('../models/PhoneVerification');
const { generateToken } = require('../middleware/auth');

/**
 * Solicitar código de verificación para registro/login
 */
exports.solicitarCodigo = async (req, res) => {
  try {
    const { celular } = req.body;

    if (!celular) {
      return res.status(400).json({ 
        success: false,
        error: 'Número de celular requerido' 
      });
    }

    // Validar formato de celular (10 dígitos)
    if (!/^\d{10}$/.test(celular)) {
      return res.status(400).json({ 
        success: false,
        error: 'Formato de celular inválido. Debe tener 10 dígitos' 
      });
    }

    // Invalidar códigos anteriores
    await PhoneVerification.invalidarAnteriores(celular);

    // Generar nuevo código
    const verification = await PhoneVerification.crear(celular);

    // En producción, aquí se enviaría el código por SMS/WhatsApp
    // Por ahora, lo retornamos en la respuesta (solo para desarrollo)
    const response = {
      success: true,
      message: 'Código de verificación enviado',
      celular
    };

    // En desarrollo, incluir el código
    if (process.env.NODE_ENV === 'development') {
      response.codigo = verification.codigo;
      response.dev_message = 'Código visible solo en desarrollo';
    }

    res.json(response);
  } catch (error) {
    console.error('Error al solicitar código:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al enviar código de verificación' 
    });
  }
};

/**
 * Verificar código y registrar/loguear usuario
 */
exports.verificarCodigo = async (req, res) => {
  try {
    const { celular, codigo, nombre, email, metodo_entrega_preferido } = req.body;

    if (!celular || !codigo) {
      return res.status(400).json({ 
        success: false,
        error: 'Celular y código son requeridos' 
      });
    }

    // Validar código
    const esValido = await PhoneVerification.validar(celular, codigo);

    if (!esValido) {
      return res.status(401).json({ 
        success: false,
        error: 'Código inválido o expirado' 
      });
    }

    // Buscar o crear usuario
    let usuario = await Usuario.buscarPorCelular(celular);

    if (!usuario) {
      // Registrar nuevo usuario
      usuario = await Usuario.crear(celular, nombre, email, metodo_entrega_preferido);
    } else {
      // Actualizar último acceso
      await Usuario.actualizarUltimoAcceso(celular);
      
      // Actualizar datos si se proporcionaron
      if (nombre || email || metodo_entrega_preferido) {
        usuario = await Usuario.actualizarPerfil(celular, {
          nombre,
          email,
          metodo_entrega_preferido
        });
      }
    }

    // Generar token JWT
    const token = generateToken({
      celular: usuario.celular,
      nombre: usuario.nombre,
      isUser: true
    });

    res.json({
      success: true,
      message: 'Verificación exitosa',
      data: {
        token,
        usuario: {
          celular: usuario.celular,
          nombre: usuario.nombre,
          email: usuario.email,
          metodo_entrega_preferido: usuario.metodo_entrega_preferido
        }
      }
    });
  } catch (error) {
    console.error('Error al verificar código:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al verificar código' 
    });
  }
};

/**
 * Obtener perfil del usuario autenticado
 */
exports.obtenerPerfil = async (req, res) => {
  try {
    const usuario = await Usuario.buscarPorCelular(req.user.celular);

    if (!usuario) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }

    res.json({
      success: true,
      data: {
        celular: usuario.celular,
        nombre: usuario.nombre,
        email: usuario.email,
        metodo_entrega_preferido: usuario.metodo_entrega_preferido,
        verificado: usuario.verificado,
        fecha_creacion: usuario.fecha_creacion
      }
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener perfil' 
    });
  }
};

/**
 * Actualizar perfil del usuario
 */
exports.actualizarPerfil = async (req, res) => {
  try {
    const { nombre, email, metodo_entrega_preferido } = req.body;

    const usuario = await Usuario.actualizarPerfil(req.user.celular, {
      nombre,
      email,
      metodo_entrega_preferido
    });

    if (!usuario) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Perfil actualizado correctamente',
      data: {
        celular: usuario.celular,
        nombre: usuario.nombre,
        email: usuario.email,
        metodo_entrega_preferido: usuario.metodo_entrega_preferido
      }
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al actualizar perfil' 
    });
  }
};

/**
 * Logout (invalidar token - frontend debe eliminar el token)
 */
exports.logout = async (req, res) => {
  res.json({
    success: true,
    message: 'Sesión cerrada correctamente'
  });
};

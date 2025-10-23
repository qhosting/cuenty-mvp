const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { generateToken } = require('../middleware/auth');

const prisma = new PrismaClient();

/**
 * Registro de nuevo cliente
 */
const register = async (req, res) => {
  try {
    const { email, password, nombre, apellido, telefono, whatsapp } = req.body;

    // Validar campos requeridos
    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({ 
        error: 'Email, contraseña, nombre y apellido son requeridos' 
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Validar longitud de contraseña
    if (password.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Verificar si el email ya existe
    const existingCliente = await prisma.cliente.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingCliente) {
      return res.status(400).json({ 
        error: 'Este email ya está registrado' 
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear cliente
    const cliente = await prisma.cliente.create({
      data: {
        email: email.toLowerCase(),
        password: hashedPassword,
        nombre,
        apellido,
        telefono: telefono || null,
        whatsapp: whatsapp || null
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        whatsapp: true,
        emailVerificado: true,
        fechaCreacion: true
      }
    });

    // Generar token JWT
    const token = generateToken({
      clienteId: cliente.id,
      email: cliente.email,
      isCliente: true
    });

    res.status(201).json({
      message: 'Cliente registrado exitosamente',
      cliente,
      token
    });
  } catch (error) {
    console.error('Error en registro de cliente:', error);
    res.status(500).json({ 
      error: 'Error al registrar cliente',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Login de cliente
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        error: 'Email y contraseña son requeridos' 
      });
    }

    // Buscar cliente
    const cliente = await prisma.cliente.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!cliente) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Verificar si el cliente está activo
    if (!cliente.activo) {
      return res.status(403).json({ 
        error: 'Cuenta desactivada. Contacte al administrador' 
      });
    }

    // Verificar contraseña
    const isPasswordValid = await bcrypt.compare(password, cliente.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Credenciales inválidas' 
      });
    }

    // Actualizar último acceso
    await prisma.cliente.update({
      where: { id: cliente.id },
      data: { ultimoAcceso: new Date() }
    });

    // Generar token JWT
    const token = generateToken({
      clienteId: cliente.id,
      email: cliente.email,
      isCliente: true
    });

    // Remover contraseña de la respuesta
    const { password: _, ...clienteData } = cliente;

    res.json({
      message: 'Login exitoso',
      cliente: clienteData,
      token
    });
  } catch (error) {
    console.error('Error en login de cliente:', error);
    res.status(500).json({ 
      error: 'Error al iniciar sesión',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener perfil del cliente autenticado
 */
const getProfile = async (req, res) => {
  try {
    const clienteId = req.user.clienteId;

    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        whatsapp: true,
        emailVerificado: true,
        fechaCreacion: true,
        ultimoAcceso: true
      }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    res.json({ cliente });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ 
      error: 'Error al obtener perfil',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualizar perfil del cliente
 */
const updateProfile = async (req, res) => {
  try {
    const clienteId = req.user.clienteId;
    const { nombre, apellido, telefono, whatsapp } = req.body;

    const updateData = {};
    if (nombre) updateData.nombre = nombre;
    if (apellido) updateData.apellido = apellido;
    if (telefono !== undefined) updateData.telefono = telefono;
    if (whatsapp !== undefined) updateData.whatsapp = whatsapp;

    const cliente = await prisma.cliente.update({
      where: { id: clienteId },
      data: updateData,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        whatsapp: true,
        emailVerificado: true,
        fechaCreacion: true,
        fechaActualizacion: true
      }
    });

    res.json({
      message: 'Perfil actualizado exitosamente',
      cliente
    });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ 
      error: 'Error al actualizar perfil',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Cambiar contraseña
 */
const changePassword = async (req, res) => {
  try {
    const clienteId = req.user.clienteId;
    const { currentPassword, newPassword } = req.body;

    // Validar campos requeridos
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ 
        error: 'Contraseña actual y nueva contraseña son requeridas' 
      });
    }

    // Validar longitud de nueva contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'La nueva contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Obtener cliente
    const cliente = await prisma.cliente.findUnique({
      where: { id: clienteId }
    });

    if (!cliente) {
      return res.status(404).json({ error: 'Cliente no encontrado' });
    }

    // Verificar contraseña actual
    const isPasswordValid = await bcrypt.compare(currentPassword, cliente.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        error: 'Contraseña actual incorrecta' 
      });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña
    await prisma.cliente.update({
      where: { id: clienteId },
      data: { password: hashedPassword }
    });

    res.json({
      message: 'Contraseña actualizada exitosamente'
    });
  } catch (error) {
    console.error('Error al cambiar contraseña:', error);
    res.status(500).json({ 
      error: 'Error al cambiar contraseña',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Solicitar recuperación de contraseña
 */
const requestPasswordReset = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'Email es requerido' });
    }

    // Buscar cliente
    const cliente = await prisma.cliente.findUnique({
      where: { email: email.toLowerCase() }
    });

    // Por seguridad, siempre retornar éxito aunque el email no exista
    if (!cliente) {
      return res.json({
        message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña'
      });
    }

    // Generar token de recuperación
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); // 1 hora

    // Guardar token en la base de datos
    await prisma.cliente.update({
      where: { id: cliente.id },
      data: {
        resetPasswordToken: resetToken,
        resetPasswordExpires: resetTokenExpires
      }
    });

    // TODO: Enviar email con el token (integrar con servicio de email)
    // Por ahora, en desarrollo, retornar el token
    const resetData = process.env.NODE_ENV === 'development' 
      ? { resetToken } 
      : {};

    res.json({
      message: 'Si el email existe, recibirás instrucciones para restablecer tu contraseña',
      ...resetData
    });
  } catch (error) {
    console.error('Error al solicitar recuperación de contraseña:', error);
    res.status(500).json({ 
      error: 'Error al solicitar recuperación de contraseña',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Resetear contraseña con token
 */
const resetPassword = async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({ 
        error: 'Token y nueva contraseña son requeridos' 
      });
    }

    // Validar longitud de contraseña
    if (newPassword.length < 6) {
      return res.status(400).json({ 
        error: 'La contraseña debe tener al menos 6 caracteres' 
      });
    }

    // Buscar cliente con token válido
    const cliente = await prisma.cliente.findFirst({
      where: {
        resetPasswordToken: token,
        resetPasswordExpires: {
          gte: new Date() // Token no expirado
        }
      }
    });

    if (!cliente) {
      return res.status(400).json({ 
        error: 'Token inválido o expirado' 
      });
    }

    // Hashear nueva contraseña
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Actualizar contraseña y limpiar token
    await prisma.cliente.update({
      where: { id: cliente.id },
      data: {
        password: hashedPassword,
        resetPasswordToken: null,
        resetPasswordExpires: null
      }
    });

    res.json({
      message: 'Contraseña restablecida exitosamente'
    });
  } catch (error) {
    console.error('Error al restablecer contraseña:', error);
    res.status(500).json({ 
      error: 'Error al restablecer contraseña',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  requestPasswordReset,
  resetPassword
};

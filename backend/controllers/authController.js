
const bcrypt = require('bcryptjs');
const { generateToken } = require('../middleware/auth');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Validaciones de entrada
 */
const validarUsername = (username) => {
  if (!username || typeof username !== 'string') {
    return { valid: false, error: 'Username es requerido' };
  }
  if (username.length < 3 || username.length > 50) {
    return { valid: false, error: 'Username debe tener entre 3 y 50 caracteres' };
  }
  if (!/^[a-zA-Z0-9_-]+$/.test(username)) {
    return { valid: false, error: 'Username solo puede contener letras, números, guiones y guiones bajos' };
  }
  return { valid: true };
};

const validarPassword = (password) => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password es requerido' };
  }
  if (password.length < 6) {
    return { valid: false, error: 'Password debe tener al menos 6 caracteres' };
  }
  if (password.length > 100) {
    return { valid: false, error: 'Password no puede exceder 100 caracteres' };
  }
  return { valid: true };
};

const validarEmail = (email) => {
  if (!email) {
    return { valid: true }; // Email es opcional
  }
  if (typeof email !== 'string') {
    return { valid: false, error: 'Email debe ser una cadena de texto' };
  }
  if (email.length > 100) {
    return { valid: false, error: 'Email no puede exceder 100 caracteres' };
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Formato de email inválido' };
  }
  return { valid: true };
};

/**
 * Registro de administrador
 * En producción, esto debería ser un endpoint protegido o script de inicialización
 */
exports.registrarAdmin = async (req, res) => {
  try {
    const { username, password, email } = req.body;

    // Validar username
    const usernameValidation = validarUsername(username);
    if (!usernameValidation.valid) {
      return res.status(400).json({ 
        success: false,
        error: usernameValidation.error 
      });
    }

    // Validar password
    const passwordValidation = validarPassword(password);
    if (!passwordValidation.valid) {
      return res.status(400).json({ 
        success: false,
        error: passwordValidation.error 
      });
    }

    // Validar email (si se proporciona)
    if (email) {
      const emailValidation = validarEmail(email);
      if (!emailValidation.valid) {
        return res.status(400).json({ 
          success: false,
          error: emailValidation.error 
        });
      }
    }

    // Verificar si ya existe un admin con ese username usando Prisma
    const adminExistente = await prisma.admins.findUnique({
      where: { username: username.toLowerCase().trim() }
    });

    if (adminExistente) {
      return res.status(400).json({ 
        success: false,
        error: 'El usuario ya existe' 
      });
    }

    // Verificar si ya existe un admin con ese email (si se proporciona)
    if (email) {
      const adminConEmail = await prisma.admins.findFirst({
        where: { 
          email: email.toLowerCase().trim(),
          NOT: { email: null }
        }
      });

      if (adminConEmail) {
        return res.status(400).json({ 
          success: false,
          error: 'El email ya está registrado' 
        });
      }
    }

    // Hash de la contraseña con bcrypt (10 rounds es seguro y eficiente)
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear admin usando Prisma
    const nuevoAdmin = await prisma.admins.create({
      data: {
        username: username.toLowerCase().trim(),
        password: hashedPassword,
        email: email ? email.toLowerCase().trim() : null
      },
      select: {
        id: true,
        username: true,
        email: true,
        fecha_creacion: true
      }
    });

    res.status(201).json({
      success: true,
      message: 'Administrador creado exitosamente',
      data: nuevoAdmin
    });
  } catch (error) {
    console.error('Error en registro:', error);
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return res.status(400).json({ 
        success: false,
        error: 'El usuario ya existe' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Error al registrar administrador',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Login de administrador
 * Acepta login por username o email
 */
exports.loginAdmin = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // El usuario puede enviar username o email
    const loginIdentifier = username || email;

    // Validar datos de entrada
    if (!loginIdentifier || typeof loginIdentifier !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Username o email es requerido' 
      });
    }

    if (!password || typeof password !== 'string') {
      return res.status(400).json({ 
        success: false,
        error: 'Password es requerido' 
      });
    }

    console.log(`[AuthController] Intento de login con: ${loginIdentifier}`);

    // Buscar admin por username o email usando Prisma
    let admin = null;
    
    // Intentar buscar por username primero
    admin = await prisma.admins.findUnique({
      where: { username: loginIdentifier.toLowerCase().trim() }
    });

    // Si no se encuentra por username, intentar por email
    if (!admin) {
      admin = await prisma.admins.findFirst({
        where: { 
          email: loginIdentifier.toLowerCase().trim()
        }
      });
    }

    if (!admin) {
      console.warn(`[AuthController] Admin no encontrado: ${loginIdentifier}`);
      return res.status(401).json({ 
        success: false,
        error: 'Credenciales inválidas',
        message: 'Usuario no encontrado'
      });
    }

    console.log(`[AuthController] Admin encontrado: ${admin.username} (ID: ${admin.id})`);

    // Verificar contraseña
    const passwordValida = await bcrypt.compare(password, admin.password);

    if (!passwordValida) {
      console.warn(`[AuthController] Contraseña inválida para: ${admin.username}`);
      return res.status(401).json({ 
        success: false,
        error: 'Credenciales inválidas',
        message: 'Contraseña incorrecta'
      });
    }

    console.log(`[AuthController] Login exitoso para: ${admin.username}`);

    // Generar token JWT
    const token = generateToken({
      id: admin.id,
      username: admin.username,
      isAdmin: true
    });

    res.json({
      success: true,
      message: 'Login exitoso',
      token: token, // Asegurar que el token esté en el nivel principal
      data: {
        token,
        user: {
          id: admin.id,
          username: admin.username,
          email: admin.email
        }
      }
    });
  } catch (error) {
    console.error('[AuthController] Error en login:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al iniciar sesión',
      message: error.message,
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Obtener perfil del admin autenticado
 */
exports.obtenerPerfil = async (req, res) => {
  try {
    // Buscar admin usando Prisma
    const admin = await prisma.admins.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        username: true,
        email: true,
        fecha_creacion: true
      }
    });

    if (!admin) {
      return res.status(404).json({ 
        success: false,
        error: 'Usuario no encontrado' 
      });
    }

    res.json({
      success: true,
      data: admin
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener perfil',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

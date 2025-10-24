const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

/**
 * Listar todos los usuarios (clientes)
 * Query params: ?search=X&activo=true/false&page=1&limit=20
 */
const listarUsuarios = async (req, res) => {
  try {
    const { search, activo, page = 1, limit = 20 } = req.query;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Construir filtro
    const where = {};

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (activo !== undefined) {
      where.activo = activo === 'true';
    }

    // Obtener usuarios y total
    const [usuarios, total] = await Promise.all([
      prisma.clientes.findMany({
        where,
        skip,
        take,
        orderBy: { fecha_creacion: 'desc' },
        select: {
          id: true,
          email: true,
          nombre: true,
          apellido: true,
          telefono: true,
          whatsapp: true,
          email_verificado: true,
          activo: true,
          fecha_creacion: true,
          ultimo_acceso: true,
        },
      }),
      prisma.clientes.count({ where }),
    ]);

    res.json({
      success: true,
      data: usuarios,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({
      success: false,
      message: 'Error al listar usuarios',
      error: error.message,
    });
  }
};

/**
 * Obtener un usuario específico
 */
const obtenerUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    const usuario = await prisma.clientes.findUnique({
      where: { id: parseInt(id) },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        whatsapp: true,
        email_verificado: true,
        activo: true,
        fecha_creacion: true,
        fecha_actualizacion: true,
        ultimo_acceso: true,
      },
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    res.json({
      success: true,
      data: usuario,
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener usuario',
      error: error.message,
    });
  }
};

/**
 * Crear nuevo usuario
 */
const crearUsuario = async (req, res) => {
  try {
    const {
      email,
      password,
      nombre,
      apellido,
      telefono,
      whatsapp,
      email_verificado = false,
      activo = true,
    } = req.body;

    // Validar campos requeridos
    if (!email || !password || !nombre || !apellido) {
      return res.status(400).json({
        success: false,
        message: 'Email, contraseña, nombre y apellido son requeridos',
      });
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'El formato del email no es válido',
      });
    }

    // Verificar si el email ya existe
    const existente = await prisma.clientes.findUnique({
      where: { email },
    });

    if (existente) {
      return res.status(409).json({
        success: false,
        message: 'El email ya está registrado',
      });
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Crear usuario
    const nuevoUsuario = await prisma.clientes.create({
      data: {
        email,
        password: hashedPassword,
        nombre,
        apellido,
        telefono: telefono || null,
        whatsapp: whatsapp || null,
        email_verificado,
        activo,
        fecha_actualizacion: new Date(),
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        whatsapp: true,
        email_verificado: true,
        activo: true,
        fecha_creacion: true,
      },
    });

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: nuevoUsuario,
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear usuario',
      error: error.message,
    });
  }
};

/**
 * Actualizar usuario
 */
const actualizarUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      email,
      nombre,
      apellido,
      telefono,
      whatsapp,
      email_verificado,
      activo,
      password,
    } = req.body;

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.clientes.findUnique({
      where: { id: parseInt(id) },
    });

    if (!usuarioExistente) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Si se está actualizando el email, verificar que no esté en uso
    if (email && email !== usuarioExistente.email) {
      const emailEnUso = await prisma.clientes.findUnique({
        where: { email },
      });

      if (emailEnUso) {
        return res.status(409).json({
          success: false,
          message: 'El email ya está en uso por otro usuario',
        });
      }
    }

    // Preparar datos a actualizar
    const dataToUpdate = {
      fecha_actualizacion: new Date(),
    };

    if (email) dataToUpdate.email = email;
    if (nombre) dataToUpdate.nombre = nombre;
    if (apellido) dataToUpdate.apellido = apellido;
    if (telefono !== undefined) dataToUpdate.telefono = telefono || null;
    if (whatsapp !== undefined) dataToUpdate.whatsapp = whatsapp || null;
    if (email_verificado !== undefined) dataToUpdate.email_verificado = email_verificado;
    if (activo !== undefined) dataToUpdate.activo = activo;

    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
      dataToUpdate.password = await bcrypt.hash(password, 10);
    }

    // Actualizar usuario
    const usuarioActualizado = await prisma.clientes.update({
      where: { id: parseInt(id) },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        whatsapp: true,
        email_verificado: true,
        activo: true,
        fecha_creacion: true,
        fecha_actualizacion: true,
      },
    });

    res.json({
      success: true,
      message: 'Usuario actualizado exitosamente',
      data: usuarioActualizado,
    });
  } catch (error) {
    console.error('Error al actualizar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar usuario',
      error: error.message,
    });
  }
};

/**
 * Eliminar usuario (desactivar)
 */
const eliminarUsuario = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que el usuario existe
    const usuario = await prisma.clientes.findUnique({
      where: { id: parseInt(id) },
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Desactivar usuario en lugar de eliminar
    const usuarioDesactivado = await prisma.clientes.update({
      where: { id: parseInt(id) },
      data: {
        activo: false,
        fecha_actualizacion: new Date(),
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        activo: true,
      },
    });

    res.json({
      success: true,
      message: 'Usuario desactivado exitosamente',
      data: usuarioDesactivado,
    });
  } catch (error) {
    console.error('Error al eliminar usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar usuario',
      error: error.message,
    });
  }
};

/**
 * Activar/Desactivar usuario
 */
const cambiarEstadoUsuario = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    if (activo === undefined) {
      return res.status(400).json({
        success: false,
        message: 'El campo activo es requerido',
      });
    }

    // Verificar que el usuario existe
    const usuario = await prisma.clientes.findUnique({
      where: { id: parseInt(id) },
    });

    if (!usuario) {
      return res.status(404).json({
        success: false,
        message: 'Usuario no encontrado',
      });
    }

    // Actualizar estado
    const usuarioActualizado = await prisma.clientes.update({
      where: { id: parseInt(id) },
      data: {
        activo,
        fecha_actualizacion: new Date(),
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        activo: true,
      },
    });

    res.json({
      success: true,
      message: `Usuario ${activo ? 'activado' : 'desactivado'} exitosamente`,
      data: usuarioActualizado,
    });
  } catch (error) {
    console.error('Error al cambiar estado del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al cambiar estado del usuario',
      error: error.message,
    });
  }
};

/**
 * Obtener estadísticas de usuarios
 */
const obtenerEstadisticas = async (req, res) => {
  try {
    const [totalUsuarios, usuariosActivos, usuariosInactivos, usuariosVerificados] = await Promise.all([
      prisma.clientes.count(),
      prisma.clientes.count({ where: { activo: true } }),
      prisma.clientes.count({ where: { activo: false } }),
      prisma.clientes.count({ where: { email_verificado: true } }),
    ]);

    res.json({
      success: true,
      data: {
        total: totalUsuarios,
        activos: usuariosActivos,
        inactivos: usuariosInactivos,
        verificados: usuariosVerificados,
      },
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message,
    });
  }
};

module.exports = {
  listarUsuarios,
  obtenerUsuario,
  crearUsuario,
  actualizarUsuario,
  eliminarUsuario,
  cambiarEstadoUsuario,
  obtenerEstadisticas,
};

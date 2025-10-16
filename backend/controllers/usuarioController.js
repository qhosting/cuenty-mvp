
const Usuario = require('../models/Usuario');

/**
 * Listar todos los usuarios (admin)
 */
exports.listarTodos = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const offset = parseInt(req.query.offset) || 0;

    const usuarios = await Usuario.listarTodos(limit, offset);

    res.json({
      success: true,
      data: usuarios,
      pagination: {
        limit,
        offset
      }
    });
  } catch (error) {
    console.error('Error al listar usuarios:', error);
    res.status(500).json({ error: 'Error al obtener usuarios' });
  }
};

/**
 * Obtener usuario por celular
 */
exports.obtenerPorCelular = async (req, res) => {
  try {
    const { celular } = req.params;
    const usuario = await Usuario.buscarPorCelular(celular);

    if (!usuario) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      data: usuario
    });
  } catch (error) {
    console.error('Error al obtener usuario:', error);
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
};

/**
 * Obtener estadísticas de usuario
 */
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const { celular } = req.params;
    const estadisticas = await Usuario.obtenerEstadisticas(celular);

    if (!estadisticas) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

/**
 * Crear usuario manualmente (admin)
 */
exports.crear = async (req, res) => {
  try {
    const { celular } = req.body;

    if (!celular) {
      return res.status(400).json({ error: 'Celular es requerido' });
    }

    // Verificar si ya existe
    const existe = await Usuario.buscarPorCelular(celular);
    if (existe) {
      return res.status(400).json({ error: 'El usuario ya existe' });
    }

    const usuario = await Usuario.crear(celular);

    res.status(201).json({
      success: true,
      message: 'Usuario creado exitosamente',
      data: usuario
    });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ error: 'Error al crear usuario' });
  }
};

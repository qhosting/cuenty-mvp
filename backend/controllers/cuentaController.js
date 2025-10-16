
const Cuenta = require('../models/Cuenta');

/**
 * Crear cuenta en el inventario (admin)
 */
exports.crear = async (req, res) => {
  try {
    const { id_producto, correo, contrasena, perfil, pin } = req.body;

    if (!id_producto || !correo || !contrasena) {
      return res.status(400).json({ 
        error: 'id_producto, correo y contrasena son requeridos' 
      });
    }

    const cuenta = await Cuenta.crear(id_producto, correo, contrasena, perfil, pin);

    res.status(201).json({
      success: true,
      message: 'Cuenta agregada al inventario exitosamente',
      data: {
        id_cuenta: cuenta.id_cuenta,
        id_producto: cuenta.id_producto,
        perfil: cuenta.perfil,
        pin: cuenta.pin,
        estado: cuenta.estado
      }
    });
  } catch (error) {
    console.error('Error al crear cuenta:', error);
    res.status(500).json({ error: 'Error al crear cuenta' });
  }
};

/**
 * Obtener cuenta por ID (admin)
 */
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const cuenta = await Cuenta.obtenerPorId(id);

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    res.json({
      success: true,
      data: cuenta
    });
  } catch (error) {
    console.error('Error al obtener cuenta:', error);
    res.status(500).json({ error: 'Error al obtener cuenta' });
  }
};

/**
 * Listar cuentas del inventario (admin)
 */
exports.listarTodas = async (req, res) => {
  try {
    const filtros = {
      id_producto: req.query.id_producto,
      estado: req.query.estado
    };

    const cuentas = await Cuenta.listarTodas(filtros);

    res.json({
      success: true,
      data: cuentas
    });
  } catch (error) {
    console.error('Error al listar cuentas:', error);
    res.status(500).json({ error: 'Error al obtener cuentas' });
  }
};

/**
 * Actualizar credenciales de cuenta (admin)
 */
exports.actualizarCredenciales = async (req, res) => {
  try {
    const { id } = req.params;
    const { correo, contrasena, perfil, pin } = req.body;

    const cuenta = await Cuenta.actualizarCredenciales(id, correo, contrasena, perfil, pin);

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    res.json({
      success: true,
      message: 'Cuenta actualizada exitosamente',
      data: {
        id_cuenta: cuenta.id_cuenta,
        id_producto: cuenta.id_producto,
        perfil: cuenta.perfil,
        pin: cuenta.pin,
        estado: cuenta.estado
      }
    });
  } catch (error) {
    console.error('Error al actualizar cuenta:', error);
    res.status(500).json({ error: 'Error al actualizar cuenta' });
  }
};

/**
 * Actualizar estado de cuenta (admin)
 */
exports.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: 'Estado es requerido' });
    }

    const cuenta = await Cuenta.actualizarEstado(id, estado);

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: cuenta
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

/**
 * Eliminar cuenta (admin)
 */
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const cuenta = await Cuenta.eliminar(id);

    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    res.json({
      success: true,
      message: 'Cuenta eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    res.status(500).json({ error: 'Error al eliminar cuenta' });
  }
};

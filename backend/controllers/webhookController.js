
const Orden = require('../models/Orden');
const Cuenta = require('../models/Cuenta');

/**
 * Endpoint para n8n: Obtener datos completos de cuenta de una orden
 */
exports.obtenerCuentaOrden = async (req, res) => {
  try {
    const { id_orden } = req.query;

    if (!id_orden) {
      return res.status(400).json({ error: 'id_orden es requerido' });
    }

    // Obtener orden
    const orden = await Orden.obtenerPorId(id_orden);
    if (!orden) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    if (!orden.id_cuenta_asignada) {
      return res.status(400).json({ error: 'La orden no tiene cuenta asignada' });
    }

    // Obtener cuenta con credenciales desencriptadas
    const cuenta = await Cuenta.obtenerPorId(orden.id_cuenta_asignada);
    if (!cuenta) {
      return res.status(404).json({ error: 'Cuenta no encontrada' });
    }

    // Retornar datos para n8n
    res.json({
      success: true,
      data: {
        id_cuenta: cuenta.id_cuenta,
        nombre_servicio: cuenta.nombre_servicio,
        correo: cuenta.correo,
        contrasena: cuenta.contrasena,
        perfil: cuenta.perfil,
        pin: cuenta.pin,
        fecha_vencimiento: orden.fecha_vencimiento_servicio,
        plan: cuenta.plan
      }
    });
  } catch (error) {
    console.error('Error al obtener cuenta de orden:', error);
    res.status(500).json({ error: 'Error al obtener datos de cuenta' });
  }
};

/**
 * Endpoint para n8n: Obtener órdenes próximas a vencer
 */
exports.obtenerProximasAVencer = async (req, res) => {
  try {
    const dias = parseInt(req.query.dias) || 3;
    const ordenes = await Orden.obtenerProximasAVencer(dias);

    res.json({
      success: true,
      data: ordenes
    });
  } catch (error) {
    console.error('Error al obtener órdenes próximas a vencer:', error);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};

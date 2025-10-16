
const Orden = require('../models/Orden');
const Cuenta = require('../models/Cuenta');
const Usuario = require('../models/Usuario');
const axios = require('axios').default || require('axios');

/**
 * Crear una nueva orden
 */
exports.crear = async (req, res) => {
  try {
    const { celular_usuario, id_producto, monto_pagado } = req.body;

    if (!celular_usuario || !id_producto || !monto_pagado) {
      return res.status(400).json({ 
        error: 'celular_usuario, id_producto y monto_pagado son requeridos' 
      });
    }

    // Verificar o crear usuario
    let usuario = await Usuario.buscarPorCelular(celular_usuario);
    if (!usuario) {
      usuario = await Usuario.crear(celular_usuario);
    }

    // Crear orden
    const orden = await Orden.crear(celular_usuario, id_producto, monto_pagado);

    res.status(201).json({
      success: true,
      message: 'Orden creada exitosamente',
      data: orden
    });
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({ error: 'Error al crear orden' });
  }
};

/**
 * Obtener orden por ID
 */
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const orden = await Orden.obtenerPorId(id);

    if (!orden) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json({
      success: true,
      data: orden
    });
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({ error: 'Error al obtener orden' });
  }
};

/**
 * Listar órdenes de un usuario
 */
exports.listarPorUsuario = async (req, res) => {
  try {
    const { celular } = req.params;
    const ordenes = await Orden.listarPorUsuario(celular);

    res.json({
      success: true,
      data: ordenes
    });
  } catch (error) {
    console.error('Error al listar órdenes:', error);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};

/**
 * Listar todas las órdenes (admin)
 */
exports.listarTodas = async (req, res) => {
  try {
    const filtros = {
      estado: req.query.estado,
      celular_usuario: req.query.celular_usuario
    };

    const ordenes = await Orden.listarTodas(filtros);

    res.json({
      success: true,
      data: ordenes
    });
  } catch (error) {
    console.error('Error al listar órdenes:', error);
    res.status(500).json({ error: 'Error al obtener órdenes' });
  }
};

/**
 * Aprobar pago y asignar cuenta (admin)
 */
exports.aprobarPago = async (req, res) => {
  try {
    const { id } = req.params;

    // Obtener orden
    const orden = await Orden.obtenerPorId(id);
    if (!orden) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    if (orden.estado === 'pagada') {
      return res.status(400).json({ error: 'La orden ya fue aprobada' });
    }

    // Buscar cuenta disponible
    const cuenta = await Cuenta.obtenerDisponible(orden.id_producto);
    if (!cuenta) {
      return res.status(400).json({ 
        error: 'No hay cuentas disponibles para este producto' 
      });
    }

    // Asignar cuenta a la orden
    const ordenActualizada = await Orden.asignarCuenta(id, cuenta.id_cuenta);

    // Llamar a n8n para notificar al cliente (si está configurado)
    try {
      const n8nWebhookUrl = process.env.N8N_WEBHOOK_ENTREGA_CUENTA;
      if (n8nWebhookUrl) {
        await axios.post(n8nWebhookUrl, {
          id_orden: ordenActualizada.id_orden,
          celular_usuario: ordenActualizada.celular_usuario
        }, {
          headers: {
            'X-Webhook-Secret': process.env.N8N_WEBHOOK_SECRET
          },
          timeout: 5000
        }).catch(err => console.error('Error al llamar n8n:', err.message));
      }
    } catch (error) {
      console.error('Error al notificar n8n:', error.message);
      // No fallar la operación si n8n falla
    }

    res.json({
      success: true,
      message: 'Pago aprobado y cuenta asignada exitosamente',
      data: ordenActualizada
    });
  } catch (error) {
    console.error('Error al aprobar pago:', error);
    res.status(500).json({ error: 'Error al aprobar pago' });
  }
};

/**
 * Actualizar estado de orden (admin)
 */
exports.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: 'Estado es requerido' });
    }

    const orden = await Orden.actualizarEstado(id, estado);

    if (!orden) {
      return res.status(404).json({ error: 'Orden no encontrada' });
    }

    res.json({
      success: true,
      message: 'Estado de orden actualizado',
      data: orden
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

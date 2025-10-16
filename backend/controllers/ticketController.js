
const Ticket = require('../models/Ticket');
const axios = require('axios').default || require('axios');

/**
 * Crear ticket
 */
exports.crear = async (req, res) => {
  try {
    const { celular_usuario, titulo_problema, descripcion } = req.body;

    if (!celular_usuario || !titulo_problema) {
      return res.status(400).json({ 
        error: 'celular_usuario y titulo_problema son requeridos' 
      });
    }

    const ticket = await Ticket.crear(celular_usuario, titulo_problema, descripcion);

    res.status(201).json({
      success: true,
      message: 'Ticket creado exitosamente',
      data: ticket
    });
  } catch (error) {
    console.error('Error al crear ticket:', error);
    res.status(500).json({ error: 'Error al crear ticket' });
  }
};

/**
 * Obtener ticket por ID
 */
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const ticket = await Ticket.obtenerPorId(id);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    console.error('Error al obtener ticket:', error);
    res.status(500).json({ error: 'Error al obtener ticket' });
  }
};

/**
 * Listar tickets (admin puede ver todos, usuario solo los suyos)
 */
exports.listarTodos = async (req, res) => {
  try {
    const filtros = {
      estado: req.query.estado,
      celular_usuario: req.query.celular_usuario
    };

    const tickets = await Ticket.listarTodos(filtros);

    res.json({
      success: true,
      data: tickets
    });
  } catch (error) {
    console.error('Error al listar tickets:', error);
    res.status(500).json({ error: 'Error al obtener tickets' });
  }
};

/**
 * Agregar mensaje a ticket
 */
exports.agregarMensaje = async (req, res) => {
  try {
    const { id } = req.params;
    const { remitente, cuerpo_mensaje, nombre_agente } = req.body;

    if (!remitente || !cuerpo_mensaje) {
      return res.status(400).json({ 
        error: 'remitente y cuerpo_mensaje son requeridos' 
      });
    }

    if (!['usuario', 'agente'].includes(remitente)) {
      return res.status(400).json({ 
        error: 'remitente debe ser "usuario" o "agente"' 
      });
    }

    // Verificar que el ticket existe
    const ticket = await Ticket.obtenerPorId(id);
    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    // Agregar mensaje
    const mensaje = await Ticket.agregarMensaje(id, remitente, cuerpo_mensaje);

    // Si es respuesta de un agente, notificar al usuario por WhatsApp
    if (remitente === 'agente') {
      try {
        const n8nWebhookUrl = process.env.N8N_WEBHOOK_RESPUESTA_AGENTE;
        if (n8nWebhookUrl) {
          await axios.post(n8nWebhookUrl, {
            id_ticket: ticket.id_ticket,
            celular_usuario: ticket.celular_usuario,
            mensaje_agente: cuerpo_mensaje,
            nombre_agente: nombre_agente || 'Agente de Soporte',
            estado_ticket: ticket.estado
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
    }

    res.status(201).json({
      success: true,
      message: 'Mensaje agregado exitosamente',
      data: mensaje
    });
  } catch (error) {
    console.error('Error al agregar mensaje:', error);
    res.status(500).json({ error: 'Error al agregar mensaje' });
  }
};

/**
 * Actualizar estado de ticket
 */
exports.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado } = req.body;

    if (!estado) {
      return res.status(400).json({ error: 'Estado es requerido' });
    }

    const ticket = await Ticket.actualizarEstado(id, estado);

    if (!ticket) {
      return res.status(404).json({ error: 'Ticket no encontrado' });
    }

    res.json({
      success: true,
      message: 'Estado actualizado exitosamente',
      data: ticket
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ error: 'Error al actualizar estado' });
  }
};

/**
 * Obtener estadísticas de tickets (admin)
 */
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await Ticket.obtenerEstadisticas();

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ error: 'Error al obtener estadísticas' });
  }
};

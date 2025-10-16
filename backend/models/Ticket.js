
const pool = require('../config/database');

class Ticket {
  /**
   * Crear un nuevo ticket
   */
  static async crear(celular_usuario, titulo_problema, descripcion = null) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Crear el ticket
      const ticketQuery = `
        INSERT INTO tickets (celular_usuario, titulo_problema, estado)
        VALUES ($1, $2, 'abierto')
        RETURNING *
      `;
      const ticketResult = await client.query(ticketQuery, [celular_usuario, titulo_problema]);
      const ticket = ticketResult.rows[0];

      // Si hay descripción, agregar como primer mensaje del usuario
      if (descripcion) {
        await client.query(
          'INSERT INTO ticket_mensajes (id_ticket, remitente, cuerpo_mensaje) VALUES ($1, $2, $3)',
          [ticket.id_ticket, 'usuario', descripcion]
        );
      }

      await client.query('COMMIT');
      return ticket;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtener ticket por ID con sus mensajes
   */
  static async obtenerPorId(id_ticket) {
    const ticketQuery = `
      SELECT 
        t.*,
        u.celular,
        u.fecha_creacion as fecha_registro_usuario
      FROM tickets t
      JOIN usuarios u ON t.celular_usuario = u.celular
      WHERE t.id_ticket = $1
    `;
    const ticketResult = await pool.query(ticketQuery, [id_ticket]);
    
    if (ticketResult.rows.length === 0) return null;

    const ticket = ticketResult.rows[0];

    // Obtener mensajes del ticket
    const mensajesQuery = `
      SELECT * FROM ticket_mensajes
      WHERE id_ticket = $1
      ORDER BY timestamp ASC
    `;
    const mensajesResult = await pool.query(mensajesQuery, [id_ticket]);

    return {
      ...ticket,
      mensajes: mensajesResult.rows
    };
  }

  /**
   * Listar tickets de un usuario
   */
  static async listarPorUsuario(celular_usuario) {
    const query = `
      SELECT 
        t.*,
        COUNT(tm.id_mensaje) as total_mensajes,
        MAX(tm.timestamp) as ultima_actividad
      FROM tickets t
      LEFT JOIN ticket_mensajes tm ON t.id_ticket = tm.id_ticket
      WHERE t.celular_usuario = $1
      GROUP BY t.id_ticket
      ORDER BY t.fecha_ultima_actualizacion DESC
    `;
    const result = await pool.query(query, [celular_usuario]);
    return result.rows;
  }

  /**
   * Listar todos los tickets (admin)
   */
  static async listarTodos(filtros = {}) {
    let query = `
      SELECT 
        t.*,
        u.celular,
        COUNT(tm.id_mensaje) as total_mensajes,
        MAX(tm.timestamp) as ultima_actividad
      FROM tickets t
      JOIN usuarios u ON t.celular_usuario = u.celular
      LEFT JOIN ticket_mensajes tm ON t.id_ticket = tm.id_ticket
      WHERE 1=1
    `;
    const params = [];

    if (filtros.estado) {
      params.push(filtros.estado);
      query += ` AND t.estado = $${params.length}`;
    }

    if (filtros.celular_usuario) {
      params.push(filtros.celular_usuario);
      query += ` AND t.celular_usuario = $${params.length}`;
    }

    query += ` GROUP BY t.id_ticket, u.celular
               ORDER BY t.fecha_ultima_actualizacion DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Agregar mensaje a un ticket
   */
  static async agregarMensaje(id_ticket, remitente, cuerpo_mensaje) {
    const query = `
      INSERT INTO ticket_mensajes (id_ticket, remitente, cuerpo_mensaje)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const result = await pool.query(query, [id_ticket, remitente, cuerpo_mensaje]);
    return result.rows[0];
  }

  /**
   * Actualizar estado de ticket
   */
  static async actualizarEstado(id_ticket, estado) {
    const query = `
      UPDATE tickets 
      SET estado = $1, fecha_ultima_actualizacion = NOW()
      WHERE id_ticket = $2
      RETURNING *
    `;
    const result = await pool.query(query, [estado, id_ticket]);
    return result.rows[0];
  }

  /**
   * Obtener estadísticas de tickets
   */
  static async obtenerEstadisticas() {
    const query = `
      SELECT 
        COUNT(*) as total_tickets,
        COUNT(*) FILTER (WHERE estado = 'abierto') as abiertos,
        COUNT(*) FILTER (WHERE estado = 'en_proceso') as en_proceso,
        COUNT(*) FILTER (WHERE estado = 'resuelto') as resueltos,
        COUNT(*) FILTER (WHERE estado = 'cerrado') as cerrados
      FROM tickets
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = Ticket;

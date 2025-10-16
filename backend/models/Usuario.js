
const pool = require('../config/database');

class Usuario {
  /**
   * Crear un nuevo usuario
   */
  static async crear(celular) {
    const query = 'INSERT INTO usuarios (celular) VALUES ($1) RETURNING *';
    const result = await pool.query(query, [celular]);
    return result.rows[0];
  }

  /**
   * Buscar usuario por celular
   */
  static async buscarPorCelular(celular) {
    const query = 'SELECT * FROM usuarios WHERE celular = $1';
    const result = await pool.query(query, [celular]);
    return result.rows[0];
  }

  /**
   * Listar todos los usuarios
   */
  static async listarTodos(limit = 50, offset = 0) {
    const query = `
      SELECT 
        u.celular,
        u.fecha_creacion,
        COUNT(o.id_orden) as total_ordenes,
        COUNT(o.id_orden) FILTER (WHERE o.estado = 'pagada') as ordenes_pagadas
      FROM usuarios u
      LEFT JOIN ordenes o ON u.celular = o.celular_usuario
      GROUP BY u.celular, u.fecha_creacion
      ORDER BY u.fecha_creacion DESC
      LIMIT $1 OFFSET $2
    `;
    const result = await pool.query(query, [limit, offset]);
    return result.rows;
  }

  /**
   * Obtener estadísticas de un usuario
   */
  static async obtenerEstadisticas(celular) {
    const query = `
      SELECT 
        u.celular,
        u.fecha_creacion,
        COUNT(o.id_orden) as total_ordenes,
        COUNT(o.id_orden) FILTER (WHERE o.estado = 'pagada') as ordenes_pagadas,
        COUNT(o.id_orden) FILTER (WHERE o.estado = 'pendiente_pago') as ordenes_pendientes,
        COUNT(t.id_ticket) as total_tickets,
        COUNT(t.id_ticket) FILTER (WHERE t.estado = 'abierto') as tickets_abiertos
      FROM usuarios u
      LEFT JOIN ordenes o ON u.celular = o.celular_usuario
      LEFT JOIN tickets t ON u.celular = t.celular_usuario
      WHERE u.celular = $1
      GROUP BY u.celular, u.fecha_creacion
    `;
    const result = await pool.query(query, [celular]);
    return result.rows[0];
  }
}

module.exports = Usuario;

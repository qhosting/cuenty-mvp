
const pool = require('../config/database');

class Usuario {
  /**
   * Crear un nuevo usuario
   */
  static async crear(celular, nombre = null, email = null, metodo_entrega_preferido = 'whatsapp') {
    const query = `
      INSERT INTO usuarios (celular, nombre, email, metodo_entrega_preferido, verificado)
      VALUES ($1, $2, $3, $4, true)
      RETURNING *
    `;
    const result = await pool.query(query, [celular, nombre, email, metodo_entrega_preferido]);
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
   * Actualizar perfil de usuario
   */
  static async actualizarPerfil(celular, datos) {
    const { nombre, email, metodo_entrega_preferido } = datos;
    const query = `
      UPDATE usuarios
      SET nombre = COALESCE($2, nombre),
          email = COALESCE($3, email),
          metodo_entrega_preferido = COALESCE($4, metodo_entrega_preferido),
          ultimo_acceso = NOW()
      WHERE celular = $1
      RETURNING *
    `;
    const result = await pool.query(query, [celular, nombre, email, metodo_entrega_preferido]);
    return result.rows[0];
  }

  /**
   * Actualizar último acceso
   */
  static async actualizarUltimoAcceso(celular) {
    const query = 'UPDATE usuarios SET ultimo_acceso = NOW() WHERE celular = $1';
    await pool.query(query, [celular]);
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

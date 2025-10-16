
const pool = require('../config/database');

class Orden {
  /**
   * Crear una nueva orden
   */
  static async crear(celular_usuario, id_producto, monto_pagado, datos_pago_spei = null) {
    const query = `
      INSERT INTO ordenes 
      (celular_usuario, id_producto, monto_pagado, estado, datos_pago_spei)
      VALUES ($1, $2, $3, 'pendiente_pago', $4)
      RETURNING *
    `;
    const result = await pool.query(query, [
      celular_usuario,
      id_producto,
      monto_pagado,
      datos_pago_spei ? JSON.stringify(datos_pago_spei) : null
    ]);
    return result.rows[0];
  }

  /**
   * Obtener orden por ID
   */
  static async obtenerPorId(id_orden) {
    const query = `
      SELECT 
        o.*,
        p.nombre_servicio,
        p.descripcion as descripcion_producto,
        p.duracion_dias,
        u.fecha_creacion as fecha_registro_usuario
      FROM ordenes o
      JOIN productos p ON o.id_producto = p.id_producto
      JOIN usuarios u ON o.celular_usuario = u.celular
      WHERE o.id_orden = $1
    `;
    const result = await pool.query(query, [id_orden]);
    return result.rows[0];
  }

  /**
   * Listar órdenes de un usuario
   */
  static async listarPorUsuario(celular_usuario) {
    const query = `
      SELECT 
        o.*,
        p.nombre_servicio,
        p.descripcion as descripcion_producto
      FROM ordenes o
      JOIN productos p ON o.id_producto = p.id_producto
      WHERE o.celular_usuario = $1
      ORDER BY o.fecha_creacion DESC
    `;
    const result = await pool.query(query, [celular_usuario]);
    return result.rows;
  }

  /**
   * Listar todas las órdenes (admin)
   */
  static async listarTodas(filtros = {}) {
    let query = `
      SELECT 
        o.*,
        p.nombre_servicio,
        u.celular
      FROM ordenes o
      JOIN productos p ON o.id_producto = p.id_producto
      JOIN usuarios u ON o.celular_usuario = u.celular
      WHERE 1=1
    `;
    const params = [];

    if (filtros.estado) {
      params.push(filtros.estado);
      query += ` AND o.estado = $${params.length}`;
    }

    if (filtros.celular_usuario) {
      params.push(filtros.celular_usuario);
      query += ` AND o.celular_usuario = $${params.length}`;
    }

    query += ' ORDER BY o.fecha_creacion DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Actualizar estado de orden
   */
  static async actualizarEstado(id_orden, estado) {
    const query = 'UPDATE ordenes SET estado = $1 WHERE id_orden = $2 RETURNING *';
    const result = await pool.query(query, [estado, id_orden]);
    return result.rows[0];
  }

  /**
   * Asignar cuenta a una orden (al aprobar pago)
   */
  static async asignarCuenta(id_orden, id_cuenta_asignada) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Obtener la orden para calcular fecha de vencimiento
      const ordenQuery = `
        SELECT o.*, p.duracion_dias
        FROM ordenes o
        JOIN productos p ON o.id_producto = p.id_producto
        WHERE o.id_orden = $1
      `;
      const ordenResult = await client.query(ordenQuery, [id_orden]);
      const orden = ordenResult.rows[0];

      if (!orden) {
        throw new Error('Orden no encontrada');
      }

      // Calcular fecha de vencimiento
      const fecha_vencimiento = new Date();
      fecha_vencimiento.setDate(fecha_vencimiento.getDate() + orden.duracion_dias);

      // Actualizar orden
      const updateOrdenQuery = `
        UPDATE ordenes
        SET id_cuenta_asignada = $1,
            estado = 'pagada',
            fecha_vencimiento_servicio = $2
        WHERE id_orden = $3
        RETURNING *
      `;
      const ordenActualizada = await client.query(updateOrdenQuery, [
        id_cuenta_asignada,
        fecha_vencimiento,
        id_orden
      ]);

      // Marcar cuenta como asignada
      await client.query(
        'UPDATE inventario_cuentas SET estado = $1 WHERE id_cuenta = $2',
        ['asignada', id_cuenta_asignada]
      );

      await client.query('COMMIT');
      return ordenActualizada.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtener órdenes próximas a vencer (para recordatorios)
   */
  static async obtenerProximasAVencer(dias = 3) {
    const query = `
      SELECT 
        o.*,
        p.nombre_servicio,
        p.descripcion as plan
      FROM ordenes o
      JOIN productos p ON o.id_producto = p.id_producto
      WHERE o.estado = 'pagada'
        AND o.fecha_vencimiento_servicio BETWEEN NOW() AND NOW() + INTERVAL '${dias} days'
        AND o.fecha_vencimiento_servicio > NOW()
      ORDER BY o.fecha_vencimiento_servicio ASC
    `;
    const result = await pool.query(query);
    return result.rows;
  }
}

module.exports = Orden;

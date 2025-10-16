
const pool = require('../config/database');

class Producto {
  /**
   * Crear un nuevo producto
   */
  static async crear(nombre_servicio, descripcion, precio, duracion_dias) {
    const query = `
      INSERT INTO productos (nombre_servicio, descripcion, precio, duracion_dias)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [nombre_servicio, descripcion, precio, duracion_dias]);
    return result.rows[0];
  }

  /**
   * Obtener producto por ID
   */
  static async obtenerPorId(id_producto) {
    const query = 'SELECT * FROM productos WHERE id_producto = $1';
    const result = await pool.query(query, [id_producto]);
    return result.rows[0];
  }

  /**
   * Listar productos activos
   */
  static async listarActivos() {
    const query = `
      SELECT 
        p.*,
        COUNT(ic.id_cuenta) FILTER (WHERE ic.estado = 'disponible') as cuentas_disponibles
      FROM productos p
      LEFT JOIN inventario_cuentas ic ON p.id_producto = ic.id_producto
      WHERE p.activo = true
      GROUP BY p.id_producto
      ORDER BY p.nombre_servicio
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Listar todos los productos (admin)
   */
  static async listarTodos() {
    const query = `
      SELECT 
        p.*,
        COUNT(ic.id_cuenta) FILTER (WHERE ic.estado = 'disponible') as cuentas_disponibles,
        COUNT(ic.id_cuenta) FILTER (WHERE ic.estado = 'asignada') as cuentas_asignadas,
        COUNT(ic.id_cuenta) as total_cuentas
      FROM productos p
      LEFT JOIN inventario_cuentas ic ON p.id_producto = ic.id_producto
      GROUP BY p.id_producto
      ORDER BY p.nombre_servicio
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Actualizar producto
   */
  static async actualizar(id_producto, datos) {
    const { nombre_servicio, descripcion, precio, duracion_dias, activo } = datos;
    const query = `
      UPDATE productos
      SET nombre_servicio = COALESCE($2, nombre_servicio),
          descripcion = COALESCE($3, descripcion),
          precio = COALESCE($4, precio),
          duracion_dias = COALESCE($5, duracion_dias),
          activo = COALESCE($6, activo)
      WHERE id_producto = $1
      RETURNING *
    `;
    const result = await pool.query(query, [
      id_producto,
      nombre_servicio,
      descripcion,
      precio,
      duracion_dias,
      activo
    ]);
    return result.rows[0];
  }

  /**
   * Eliminar producto (soft delete - marcar como inactivo)
   */
  static async eliminar(id_producto) {
    const query = 'UPDATE productos SET activo = false WHERE id_producto = $1 RETURNING *';
    const result = await pool.query(query, [id_producto]);
    return result.rows[0];
  }
}

module.exports = Producto;

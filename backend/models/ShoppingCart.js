
const pool = require('../config/database');

class ShoppingCart {
  /**
   * Agregar item al carrito o actualizar cantidad
   */
  static async agregarItem(celular_usuario, id_plan, cantidad = 1) {
    const query = `
      INSERT INTO shopping_cart (celular_usuario, id_plan, cantidad)
      VALUES ($1, $2, $3)
      ON CONFLICT (celular_usuario, id_plan) 
      DO UPDATE SET cantidad = shopping_cart.cantidad + $3
      RETURNING *
    `;
    const result = await pool.query(query, [celular_usuario, id_plan, cantidad]);
    return result.rows[0];
  }

  /**
   * Actualizar cantidad de un item
   */
  static async actualizarCantidad(celular_usuario, id_plan, cantidad) {
    if (cantidad <= 0) {
      return this.eliminarItem(celular_usuario, id_plan);
    }

    const query = `
      UPDATE shopping_cart
      SET cantidad = $3
      WHERE celular_usuario = $1 AND id_plan = $2
      RETURNING *
    `;
    const result = await pool.query(query, [celular_usuario, id_plan, cantidad]);
    return result.rows[0];
  }

  /**
   * Eliminar item del carrito
   */
  static async eliminarItem(celular_usuario, id_plan) {
    const query = `
      DELETE FROM shopping_cart
      WHERE celular_usuario = $1 AND id_plan = $2
      RETURNING *
    `;
    const result = await pool.query(query, [celular_usuario, id_plan]);
    return result.rows[0];
  }

  /**
   * Obtener carrito de un usuario con detalles
   */
  static async obtenerCarrito(celular_usuario) {
    const query = `
      SELECT 
        sc.*,
        sp.nombre_plan,
        sp.duracion_meses,
        sp.precio_venta,
        sp.descripcion,
        s.nombre as nombre_servicio,
        s.logo_url,
        (sp.precio_venta * sc.cantidad) as subtotal
      FROM shopping_cart sc
      JOIN service_plans sp ON sc.id_plan = sp.id_plan
      JOIN servicios s ON sp.id_servicio = s.id_servicio
      WHERE sc.celular_usuario = $1
      ORDER BY sc.fecha_agregado DESC
    `;
    const result = await pool.query(query, [celular_usuario]);
    
    // Calcular total
    const items = result.rows;
    const total = items.reduce((sum, item) => sum + parseFloat(item.subtotal), 0);
    
    return {
      items,
      total,
      cantidad_items: items.length
    };
  }

  /**
   * Vaciar carrito de un usuario
   */
  static async vaciarCarrito(celular_usuario) {
    const query = 'DELETE FROM shopping_cart WHERE celular_usuario = $1';
    const result = await pool.query(query, [celular_usuario]);
    return result.rowCount;
  }

  /**
   * Verificar disponibilidad de items en carrito
   */
  static async verificarDisponibilidad(celular_usuario) {
    const query = `
      SELECT 
        sc.id_plan,
        sc.cantidad,
        s.nombre as servicio,
        sp.nombre_plan,
        COUNT(ic.id_cuenta) FILTER (WHERE ic.estado = 'disponible') as disponibles
      FROM shopping_cart sc
      JOIN service_plans sp ON sc.id_plan = sp.id_plan
      JOIN servicios s ON sp.id_servicio = s.id_servicio
      LEFT JOIN inventario_cuentas ic ON sp.id_plan = ic.id_plan
      WHERE sc.celular_usuario = $1
      GROUP BY sc.id_plan, sc.cantidad, s.nombre, sp.nombre_plan
      HAVING COUNT(ic.id_cuenta) FILTER (WHERE ic.estado = 'disponible') < sc.cantidad
    `;
    const result = await pool.query(query, [celular_usuario]);
    return result.rows;
  }
}

module.exports = ShoppingCart;


const pool = require('../config/database');

class ServicePlan {
  /**
   * Crear un nuevo plan de servicio
   */
  static async crear(datos) {
    const { id_servicio, nombre_plan, duracion_meses, costo, margen_ganancia, descripcion } = datos;
    const query = `
      INSERT INTO service_plans 
      (id_servicio, nombre_plan, duracion_meses, costo, margen_ganancia, descripcion)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;
    const result = await pool.query(query, [
      id_servicio,
      nombre_plan,
      duracion_meses,
      costo,
      margen_ganancia,
      descripcion
    ]);
    return result.rows[0];
  }

  /**
   * Obtener plan por ID
   */
  static async obtenerPorId(id_plan) {
    const query = `
      SELECT 
        sp.*,
        s.nombre as nombre_servicio,
        s.descripcion as descripcion_servicio,
        s.logo_url,
        s.categoria
      FROM service_plans sp
      JOIN servicios s ON sp.id_servicio = s.id_servicio
      WHERE sp.id_plan = $1
    `;
    const result = await pool.query(query, [id_plan]);
    return result.rows[0];
  }

  /**
   * Obtener planes por servicio
   */
  static async obtenerPorServicio(id_servicio, soloActivos = true) {
    let query = `
      SELECT 
        sp.*,
        s.nombre as nombre_servicio,
        s.descripcion as descripcion_servicio,
        s.logo_url,
        s.categoria,
        COUNT(ic.id_cuenta) FILTER (WHERE ic.estado = 'disponible') as cuentas_disponibles
      FROM service_plans sp
      JOIN servicios s ON sp.id_servicio = s.id_servicio
      LEFT JOIN inventario_cuentas ic ON sp.id_plan = ic.id_plan
      WHERE sp.id_servicio = $1
    `;
    
    if (soloActivos) {
      query += ' AND sp.activo = true AND s.activo = true';
    }
    
    query += `
      GROUP BY sp.id_plan, s.id_servicio
      ORDER BY sp.duracion_meses
    `;
    
    const result = await pool.query(query, [id_servicio]);
    return result.rows;
  }

  /**
   * Listar planes activos para clientes
   */
  static async listarActivos() {
    const query = `
      SELECT 
        sp.*,
        s.nombre as nombre_servicio,
        s.descripcion as descripcion_servicio,
        s.logo_url,
        s.categoria,
        COUNT(ic.id_cuenta) FILTER (WHERE ic.estado = 'disponible') as cuentas_disponibles
      FROM service_plans sp
      JOIN servicios s ON sp.id_servicio = s.id_servicio
      LEFT JOIN inventario_cuentas ic ON sp.id_plan = ic.id_plan
      WHERE sp.activo = true AND s.activo = true
      GROUP BY sp.id_plan, s.id_servicio
      ORDER BY s.nombre, sp.duracion_meses
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Listar todos los planes (admin)
   */
  static async listarTodos() {
    const query = `
      SELECT 
        sp.*,
        s.nombre as nombre_servicio,
        s.logo_url,
        s.categoria,
        COUNT(ic.id_cuenta) FILTER (WHERE ic.estado = 'disponible') as cuentas_disponibles,
        COUNT(ic.id_cuenta) FILTER (WHERE ic.estado = 'asignada') as cuentas_asignadas,
        COUNT(ic.id_cuenta) as total_cuentas
      FROM service_plans sp
      JOIN servicios s ON sp.id_servicio = s.id_servicio
      LEFT JOIN inventario_cuentas ic ON sp.id_plan = ic.id_plan
      GROUP BY sp.id_plan, s.id_servicio
      ORDER BY s.nombre, sp.duracion_meses
    `;
    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Actualizar plan
   */
  static async actualizar(id_plan, datos) {
    const { nombre_plan, duracion_meses, costo, margen_ganancia, descripcion, activo } = datos;
    const query = `
      UPDATE service_plans
      SET nombre_plan = COALESCE($2, nombre_plan),
          duracion_meses = COALESCE($3, duracion_meses),
          costo = COALESCE($4, costo),
          margen_ganancia = COALESCE($5, margen_ganancia),
          descripcion = COALESCE($6, descripcion),
          activo = COALESCE($7, activo)
      WHERE id_plan = $1
      RETURNING *
    `;
    const result = await pool.query(query, [
      id_plan,
      nombre_plan,
      duracion_meses,
      costo,
      margen_ganancia,
      descripcion,
      activo
    ]);
    return result.rows[0];
  }

  /**
   * Eliminar plan (soft delete)
   */
  static async eliminar(id_plan) {
    const query = 'UPDATE service_plans SET activo = false WHERE id_plan = $1 RETURNING *';
    const result = await pool.query(query, [id_plan]);
    return result.rows[0];
  }
}

module.exports = ServicePlan;

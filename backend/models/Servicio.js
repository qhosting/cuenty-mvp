
const pool = require('../config/database');

class Servicio {
  /**
   * Crear un nuevo servicio
   */
  static async crear(nombre, descripcion, logo_url, categoria) {
    const query = `
      INSERT INTO servicios (nombre, descripcion, logo_url, categoria)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `;
    const result = await pool.query(query, [nombre, descripcion, logo_url, categoria]);
    return result.rows[0];
  }

  /**
   * Obtener servicio por ID
   */
  static async obtenerPorId(id_servicio) {
    const query = 'SELECT * FROM servicios WHERE id_servicio = $1';
    const result = await pool.query(query, [id_servicio]);
    return result.rows[0];
  }

  /**
   * Listar todos los servicios con sus planes
   */
  static async listarTodos(soloActivos = false) {
    let query = `
      SELECT 
        s.*,
        COUNT(sp.id_plan) as total_planes,
        COUNT(sp.id_plan) FILTER (WHERE sp.activo = true) as planes_activos,
        json_agg(
          json_build_object(
            'id_plan', sp.id_plan,
            'nombre_plan', sp.nombre_plan,
            'duracion_meses', sp.duracion_meses,
            'precio_venta', sp.precio_venta,
            'activo', sp.activo
          ) ORDER BY sp.duracion_meses
        ) FILTER (WHERE sp.id_plan IS NOT NULL) as planes
      FROM servicios s
      LEFT JOIN service_plans sp ON s.id_servicio = sp.id_servicio
    `;

    if (soloActivos) {
      query += ' WHERE s.activo = true AND (sp.activo = true OR sp.id_plan IS NULL)';
    }

    query += `
      GROUP BY s.id_servicio
      ORDER BY s.nombre
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Actualizar servicio
   */
  static async actualizar(id_servicio, datos) {
    const { nombre, descripcion, logo_url, categoria, activo } = datos;
    const query = `
      UPDATE servicios
      SET nombre = COALESCE($2, nombre),
          descripcion = COALESCE($3, descripcion),
          logo_url = COALESCE($4, logo_url),
          categoria = COALESCE($5, categoria),
          activo = COALESCE($6, activo)
      WHERE id_servicio = $1
      RETURNING *
    `;
    const result = await pool.query(query, [
      id_servicio,
      nombre,
      descripcion,
      logo_url,
      categoria,
      activo
    ]);
    return result.rows[0];
  }

  /**
   * Eliminar servicio (soft delete)
   */
  static async eliminar(id_servicio) {
    const query = 'UPDATE servicios SET activo = false WHERE id_servicio = $1 RETURNING *';
    const result = await pool.query(query, [id_servicio]);
    return result.rows[0];
  }
}

module.exports = Servicio;

const pool = require('../config/database');

class Combo {
  /**
   * Crear un nuevo combo con sus planes incluidos
   */
  static async crear(datos) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { nombre, descripcion, precio_total, costo_total, imagen_url, planes } = datos;

      // Crear el combo
      const comboQuery = `
        INSERT INTO combos (nombre, descripcion, precio_total, costo_total, imagen_url)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const comboResult = await client.query(comboQuery, [
        nombre,
        descripcion,
        precio_total,
        costo_total,
        imagen_url
      ]);

      const combo = comboResult.rows[0];

      // Insertar los planes del combo
      if (planes && planes.length > 0) {
        for (const plan of planes) {
          const itemQuery = `
            INSERT INTO combo_items (id_combo, id_plan, cantidad)
            VALUES ($1, $2, $3)
          `;
          await client.query(itemQuery, [combo.id_combo, plan.id_plan, plan.cantidad || 1]);
        }
      }

      await client.query('COMMIT');

      // Obtener el combo completo con sus items
      return await this.obtenerPorId(combo.id_combo);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtener combo por ID con sus planes incluidos
   */
  static async obtenerPorId(id_combo) {
    const query = `
      SELECT 
        c.*,
        json_agg(
          json_build_object(
            'id_plan', sp.id_plan,
            'id_servicio', sp.id_servicio,
            'nombre_plan', sp.nombre_plan,
            'tipo_plan', sp.tipo_plan,
            'precio_venta', sp.precio_venta,
            'costo', sp.costo,
            'cantidad', ci.cantidad,
            'servicio_nombre', s.nombre,
            'servicio_logo', s.logo_url
          ) ORDER BY s.nombre
        ) FILTER (WHERE sp.id_plan IS NOT NULL) as planes
      FROM combos c
      LEFT JOIN combo_items ci ON c.id_combo = ci.id_combo
      LEFT JOIN service_plans sp ON ci.id_plan = sp.id_plan
      LEFT JOIN servicios s ON sp.id_servicio = s.id_servicio
      WHERE c.id_combo = $1
      GROUP BY c.id_combo
    `;
    const result = await pool.query(query, [id_combo]);
    return result.rows[0];
  }

  /**
   * Listar todos los combos
   */
  static async listarTodos(soloActivos = false) {
    let query = `
      SELECT 
        c.*,
        COUNT(ci.id_plan) as total_planes,
        json_agg(
          json_build_object(
            'id_plan', sp.id_plan,
            'nombre_servicio', s.nombre,
            'tipo_plan', sp.tipo_plan,
            'logo_url', s.logo_url,
            'cantidad', ci.cantidad
          ) ORDER BY s.nombre
        ) FILTER (WHERE sp.id_plan IS NOT NULL) as planes
      FROM combos c
      LEFT JOIN combo_items ci ON c.id_combo = ci.id_combo
      LEFT JOIN service_plans sp ON ci.id_plan = sp.id_plan
      LEFT JOIN servicios s ON sp.id_servicio = s.id_servicio
    `;

    if (soloActivos) {
      query += ' WHERE c.activo = true';
    }

    query += `
      GROUP BY c.id_combo
      ORDER BY c.fecha_creacion DESC
    `;

    const result = await pool.query(query);
    return result.rows;
  }

  /**
   * Actualizar combo
   */
  static async actualizar(id_combo, datos) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const { nombre, descripcion, precio_total, costo_total, imagen_url, activo, planes } = datos;

      // Actualizar datos del combo
      const comboQuery = `
        UPDATE combos
        SET nombre = COALESCE($2, nombre),
            descripcion = COALESCE($3, descripcion),
            precio_total = COALESCE($4, precio_total),
            costo_total = COALESCE($5, costo_total),
            imagen_url = COALESCE($6, imagen_url),
            activo = COALESCE($7, activo)
        WHERE id_combo = $1
        RETURNING *
      `;
      await client.query(comboQuery, [
        id_combo,
        nombre,
        descripcion,
        precio_total,
        costo_total,
        imagen_url,
        activo
      ]);

      // Si se proporcionan planes, actualizar la relación
      if (planes) {
        // Eliminar planes existentes
        await client.query('DELETE FROM combo_items WHERE id_combo = $1', [id_combo]);

        // Insertar nuevos planes
        if (planes.length > 0) {
          for (const plan of planes) {
            const itemQuery = `
              INSERT INTO combo_items (id_combo, id_plan, cantidad)
              VALUES ($1, $2, $3)
            `;
            await client.query(itemQuery, [id_combo, plan.id_plan, plan.cantidad || 1]);
          }
        }
      }

      await client.query('COMMIT');

      // Obtener el combo actualizado completo
      return await this.obtenerPorId(id_combo);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Eliminar combo (soft delete)
   */
  static async eliminar(id_combo) {
    const query = 'UPDATE combos SET activo = false WHERE id_combo = $1 RETURNING *';
    const result = await pool.query(query, [id_combo]);
    return result.rows[0];
  }

  /**
   * Eliminar combo permanentemente
   */
  static async eliminarPermanente(id_combo) {
    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Primero eliminar los combo_items
      await client.query('DELETE FROM combo_items WHERE id_combo = $1', [id_combo]);

      // Luego eliminar el combo
      const result = await client.query('DELETE FROM combos WHERE id_combo = $1 RETURNING *', [id_combo]);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Calcular precio y costo total basado en los planes incluidos
   */
  static async calcularTotales(planes) {
    if (!planes || planes.length === 0) {
      return { precio_total: 0, costo_total: 0 };
    }

    const planIds = planes.map(p => p.id_plan);
    const query = `
      SELECT 
        SUM(precio_venta) as precio_total,
        SUM(costo) as costo_total
      FROM service_plans
      WHERE id_plan = ANY($1)
    `;
    
    const result = await pool.query(query, [planIds]);
    return {
      precio_total: parseFloat(result.rows[0].precio_total || 0),
      costo_total: parseFloat(result.rows[0].costo_total || 0)
    };
  }
}

module.exports = Combo;

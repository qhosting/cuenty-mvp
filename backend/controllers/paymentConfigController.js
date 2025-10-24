const pool = require('../config/database');

/**
 * Obtener configuración de pago activa
 */
exports.obtenerActiva = async (req, res) => {
  try {
    const query = `
      SELECT * FROM payment_instructions 
      WHERE activo = true 
      ORDER BY fecha_creacion DESC 
      LIMIT 1
    `;
    const result = await pool.query(query);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'No hay configuración de pago activa'
      });
    }

    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al obtener configuración de pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener configuración de pago'
    });
  }
};

/**
 * Listar todas las configuraciones de pago (admin)
 */
exports.listarTodas = async (req, res) => {
  try {
    const query = `
      SELECT * FROM payment_instructions 
      ORDER BY fecha_creacion DESC
    `;
    const result = await pool.query(query);

    res.json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    console.error('Error al listar configuraciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error al listar configuraciones de pago'
    });
  }
};

/**
 * Crear nueva configuración de pago (admin)
 */
exports.crear = async (req, res) => {
  try {
    const {
      banco,
      titular,
      numero_cuenta,
      clabe,
      concepto_referencia,
      instrucciones_adicionales
    } = req.body;

    if (!banco || !titular) {
      return res.status(400).json({
        success: false,
        error: 'Banco y titular son requeridos'
      });
    }

    const query = `
      INSERT INTO payment_instructions 
      (banco, titular, numero_cuenta, clabe, concepto_referencia, instrucciones_adicionales)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const result = await pool.query(query, [
      banco,
      titular,
      numero_cuenta,
      clabe,
      concepto_referencia,
      instrucciones_adicionales
    ]);

    res.status(201).json({
      success: true,
      message: 'Configuración de pago creada correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al crear configuración de pago:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear configuración de pago',
      details: error.message
    });
  }
};

/**
 * Actualizar configuración de pago (admin)
 */
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      banco,
      titular,
      numero_cuenta,
      clabe,
      concepto_referencia,
      instrucciones_adicionales,
      activo
    } = req.body;

    const query = `
      UPDATE payment_instructions
      SET banco = COALESCE($2, banco),
          titular = COALESCE($3, titular),
          numero_cuenta = COALESCE($4, numero_cuenta),
          clabe = COALESCE($5, clabe),
          concepto_referencia = COALESCE($6, concepto_referencia),
          instrucciones_adicionales = COALESCE($7, instrucciones_adicionales),
          activo = COALESCE($8, activo)
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [
      id,
      banco,
      titular,
      numero_cuenta,
      clabe,
      concepto_referencia,
      instrucciones_adicionales,
      activo
    ]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Configuración no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Configuración actualizada correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar configuración de pago',
      details: error.message
    });
  }
};

/**
 * Activar/desactivar configuración (admin)
 */
exports.toggleActivo = async (req, res) => {
  try {
    const { id } = req.params;
    const { activo } = req.body;

    // Si se está activando esta configuración, desactivar todas las demás
    if (activo === true) {
      await pool.query('UPDATE payment_instructions SET activo = false');
    }

    const query = `
      UPDATE payment_instructions
      SET activo = $2
      WHERE id = $1
      RETURNING *
    `;

    const result = await pool.query(query, [id, activo]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Configuración no encontrada'
      });
    }

    res.json({
      success: true,
      message: `Configuración ${activo ? 'activada' : 'desactivada'} correctamente`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al cambiar estado:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cambiar estado de configuración'
    });
  }
};

/**
 * Eliminar configuración (admin)
 */
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;

    const query = 'DELETE FROM payment_instructions WHERE id = $1 RETURNING *';
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: 'Configuración no encontrada'
      });
    }

    res.json({
      success: true,
      message: 'Configuración eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error al eliminar configuración de pago'
    });
  }
};

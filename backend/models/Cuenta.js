
const pool = require('../config/database');
const { encrypt, decrypt } = require('../utils/encryption');

class Cuenta {
  /**
   * Crear una nueva cuenta en el inventario
   */
  static async crear(id_producto, correo, contrasena, perfil, pin) {
    const correoEncriptado = encrypt(correo);
    const contrasenaEncriptada = encrypt(contrasena);

    const query = `
      INSERT INTO inventario_cuentas 
      (id_producto, correo_encriptado, contrasena_encriptada, perfil, pin, estado)
      VALUES ($1, $2, $3, $4, $5, 'disponible')
      RETURNING *
    `;
    const result = await pool.query(query, [
      id_producto,
      correoEncriptado,
      contrasenaEncriptada,
      perfil,
      pin
    ]);
    return result.rows[0];
  }

  /**
   * Obtener cuenta por ID (con datos desencriptados)
   */
  static async obtenerPorId(id_cuenta) {
    const query = `
      SELECT ic.*, p.nombre_servicio, p.descripcion as plan
      FROM inventario_cuentas ic
      JOIN productos p ON ic.id_producto = p.id_producto
      WHERE ic.id_cuenta = $1
    `;
    const result = await pool.query(query, [id_cuenta]);
    
    if (result.rows.length === 0) return null;

    const cuenta = result.rows[0];
    return {
      ...cuenta,
      correo: decrypt(cuenta.correo_encriptado),
      contrasena: decrypt(cuenta.contrasena_encriptada)
    };
  }

  /**
   * Obtener cuenta disponible para un producto
   */
  static async obtenerDisponible(id_producto) {
    const query = `
      SELECT * FROM inventario_cuentas
      WHERE id_producto = $1 AND estado = 'disponible'
      LIMIT 1
    `;
    const result = await pool.query(query, [id_producto]);
    
    if (result.rows.length === 0) return null;

    const cuenta = result.rows[0];
    return {
      ...cuenta,
      correo: decrypt(cuenta.correo_encriptado),
      contrasena: decrypt(cuenta.contrasena_encriptada)
    };
  }

  /**
   * Listar cuentas del inventario (admin)
   */
  static async listarTodas(filtros = {}) {
    let query = `
      SELECT 
        ic.id_cuenta,
        ic.id_producto,
        ic.perfil,
        ic.pin,
        ic.estado,
        ic.fecha_agregado,
        p.nombre_servicio
      FROM inventario_cuentas ic
      JOIN productos p ON ic.id_producto = p.id_producto
      WHERE 1=1
    `;
    const params = [];

    if (filtros.id_producto) {
      params.push(filtros.id_producto);
      query += ` AND ic.id_producto = $${params.length}`;
    }

    if (filtros.estado) {
      params.push(filtros.estado);
      query += ` AND ic.estado = $${params.length}`;
    }

    query += ' ORDER BY ic.fecha_agregado DESC';

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Actualizar estado de cuenta
   */
  static async actualizarEstado(id_cuenta, estado) {
    const query = 'UPDATE inventario_cuentas SET estado = $1 WHERE id_cuenta = $2 RETURNING *';
    const result = await pool.query(query, [estado, id_cuenta]);
    return result.rows[0];
  }

  /**
   * Actualizar credenciales de cuenta
   */
  static async actualizarCredenciales(id_cuenta, correo, contrasena, perfil, pin) {
    const correoEncriptado = correo ? encrypt(correo) : undefined;
    const contrasenaEncriptada = contrasena ? encrypt(contrasena) : undefined;

    const query = `
      UPDATE inventario_cuentas
      SET correo_encriptado = COALESCE($2, correo_encriptado),
          contrasena_encriptada = COALESCE($3, contrasena_encriptada),
          perfil = COALESCE($4, perfil),
          pin = COALESCE($5, pin)
      WHERE id_cuenta = $1
      RETURNING *
    `;
    const result = await pool.query(query, [
      id_cuenta,
      correoEncriptado,
      contrasenaEncriptada,
      perfil,
      pin
    ]);
    return result.rows[0];
  }

  /**
   * Eliminar cuenta del inventario
   */
  static async eliminar(id_cuenta) {
    const query = 'DELETE FROM inventario_cuentas WHERE id_cuenta = $1 RETURNING *';
    const result = await pool.query(query, [id_cuenta]);
    return result.rows[0];
  }
}

module.exports = Cuenta;

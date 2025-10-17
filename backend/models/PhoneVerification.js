
const pool = require('../config/database');
const crypto = require('crypto');

class PhoneVerification {
  /**
   * Generar código de verificación de 6 dígitos
   */
  static generarCodigo() {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Crear un nuevo código de verificación
   * @param {string} celular - Número de celular
   * @returns {object} - Código generado y expiración
   */
  static async crear(celular) {
    const codigo = this.generarCodigo();
    const expiracion = new Date(Date.now() + 10 * 60 * 1000); // 10 minutos

    const query = `
      INSERT INTO phone_verifications (celular, codigo, expiracion)
      VALUES ($1, $2, $3)
      RETURNING id, celular, codigo, expiracion
    `;
    
    const result = await pool.query(query, [celular, codigo, expiracion]);
    return result.rows[0];
  }

  /**
   * Validar código de verificación
   * @param {string} celular - Número de celular
   * @param {string} codigo - Código a validar
   * @returns {boolean} - true si es válido, false si no
   */
  static async validar(celular, codigo) {
    const query = `
      SELECT * FROM phone_verifications
      WHERE celular = $1 
        AND codigo = $2 
        AND usado = false 
        AND expiracion > NOW()
        AND intentos < 5
      ORDER BY fecha_creacion DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query, [celular, codigo]);
    
    if (result.rows.length === 0) {
      // Incrementar intentos fallidos
      await pool.query(
        'UPDATE phone_verifications SET intentos = intentos + 1 WHERE celular = $1 AND codigo = $2',
        [celular, codigo]
      );
      return false;
    }

    // Marcar como usado
    await pool.query(
      'UPDATE phone_verifications SET usado = true WHERE id = $1',
      [result.rows[0].id]
    );

    return true;
  }

  /**
   * Invalidar códigos anteriores de un celular
   */
  static async invalidarAnteriores(celular) {
    const query = `
      UPDATE phone_verifications
      SET usado = true
      WHERE celular = $1 AND usado = false
    `;
    await pool.query(query, [celular]);
  }

  /**
   * Limpiar códigos expirados (para ejecutar periódicamente)
   */
  static async limpiarExpirados() {
    const query = `
      DELETE FROM phone_verifications
      WHERE expiracion < NOW() - INTERVAL '24 hours'
    `;
    const result = await pool.query(query);
    return result.rowCount;
  }
}

module.exports = PhoneVerification;

const pool = require('../config/database');

class OrdenEnhanced {
  /**
   * Crear una nueva orden desde el carrito
   */
  static async crearDesdeCarrito(celular_usuario, metodo_entrega = 'whatsapp') {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Obtener items del carrito
      const cartQuery = `
        SELECT 
          sc.*,
          sp.precio_venta,
          sp.duracion_dias
        FROM shopping_cart sc
        JOIN service_plans sp ON sc.id_plan = sp.id_plan
        WHERE sc.celular_usuario = $1
      `;
      const cartResult = await client.query(cartQuery, [celular_usuario]);
      
      if (cartResult.rows.length === 0) {
        throw new Error('Carrito vacío');
      }

      const cartItems = cartResult.rows;
      const montoTotal = cartItems.reduce(
        (sum, item) => sum + (parseFloat(item.precio_venta) * item.cantidad), 
        0
      );

      // Obtener instrucciones de pago
      const paymentQuery = 'SELECT * FROM payment_instructions WHERE activo = true LIMIT 1';
      const paymentResult = await client.query(paymentQuery);
      const paymentInfo = paymentResult.rows[0];

      // Crear orden
      const ordenQuery = `
        INSERT INTO ordenes 
        (celular_usuario, monto_total, metodo_entrega, estado)
        VALUES ($1, $2, $3, 'pendiente_pago')
        RETURNING *
      `;
      const ordenResult = await client.query(ordenQuery, [
        celular_usuario,
        montoTotal,
        metodo_entrega
      ]);
      const orden = ordenResult.rows[0];

      // Crear items de la orden
      for (const item of cartItems) {
        const itemQuery = `
          INSERT INTO order_items 
          (id_orden, id_plan, cantidad, precio_unitario, subtotal)
          VALUES ($1, $2, $3, $4, $5)
        `;
        const subtotal = parseFloat(item.precio_venta) * item.cantidad;
        await client.query(itemQuery, [
          orden.id_orden,
          item.id_plan,
          item.cantidad,
          item.precio_venta,
          subtotal
        ]);
      }

      // Generar instrucciones de pago
      let instrucciones = '';
      if (paymentInfo) {
        instrucciones = `
📋 INSTRUCCIONES DE PAGO - Orden #${orden.id_orden}

💳 Datos Bancarios:
• Banco: ${paymentInfo.banco}
• Titular: ${paymentInfo.titular}
${paymentInfo.clabe ? `• CLABE: ${paymentInfo.clabe}` : ''}
${paymentInfo.numero_cuenta ? `• Cuenta: ${paymentInfo.numero_cuenta}` : ''}

💰 Monto a pagar: $${montoTotal.toFixed(2)} MXN
📝 Concepto: Orden #${orden.id_orden}

${paymentInfo.instrucciones_adicionales || ''}
        `.trim();
      }

      // Actualizar orden con instrucciones
      await client.query(
        'UPDATE ordenes SET instrucciones_pago = $1 WHERE id_orden = $2',
        [instrucciones, orden.id_orden]
      );

      // Vaciar carrito
      await client.query(
        'DELETE FROM shopping_cart WHERE celular_usuario = $1',
        [celular_usuario]
      );

      await client.query('COMMIT');

      // Obtener orden completa con items
      return await this.obtenerPorId(orden.id_orden);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Obtener orden por ID con todos sus detalles
   */
  static async obtenerPorId(id_orden) {
    const query = `
      SELECT 
        o.*,
        json_agg(
          json_build_object(
            'id_order_item', oi.id_order_item,
            'id_plan', oi.id_plan,
            'cantidad', oi.cantidad,
            'precio_unitario', oi.precio_unitario,
            'subtotal', oi.subtotal,
            'estado', oi.estado,
            'nombre_servicio', s.nombre,
            'nombre_plan', sp.nombre_plan,
            'duracion_meses', sp.duracion_meses,
            'credenciales_entregadas', oi.credenciales_entregadas
          )
        ) as items
      FROM ordenes o
      LEFT JOIN order_items oi ON o.id_orden = oi.id_orden
      LEFT JOIN service_plans sp ON oi.id_plan = sp.id_plan
      LEFT JOIN servicios s ON sp.id_servicio = s.id_servicio
      WHERE o.id_orden = $1
      GROUP BY o.id_orden
    `;
    const result = await pool.query(query, [id_orden]);
    return result.rows[0];
  }

  /**
   * Listar órdenes de un usuario
   */
  static async listarPorUsuario(celular_usuario, limite = 20) {
    const query = `
      SELECT 
        o.*,
        COUNT(oi.id_order_item) as total_items
      FROM ordenes o
      LEFT JOIN order_items oi ON o.id_orden = oi.id_orden
      WHERE o.celular_usuario = $1
      GROUP BY o.id_orden
      ORDER BY o.fecha_creacion DESC
      LIMIT $2
    `;
    const result = await pool.query(query, [celular_usuario, limite]);
    return result.rows;
  }

  /**
   * Listar todas las órdenes (admin)
   */
  static async listarTodas(filtros = {}, limite = 100, offset = 0) {
    let query = `
      SELECT 
        o.*,
        u.nombre as nombre_usuario,
        u.email as email_usuario,
        COUNT(oi.id_order_item) as total_items
      FROM ordenes o
      JOIN usuarios u ON o.celular_usuario = u.celular
      LEFT JOIN order_items oi ON o.id_orden = oi.id_orden
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

    query += `
      GROUP BY o.id_orden, u.nombre, u.email
      ORDER BY o.fecha_creacion DESC
      LIMIT $${params.length + 1} OFFSET $${params.length + 2}
    `;
    params.push(limite, offset);

    const result = await pool.query(query, params);
    return result.rows;
  }

  /**
   * Actualizar estado de orden
   */
  static async actualizarEstado(id_orden, estado, notas_admin = null) {
    const query = `
      UPDATE ordenes
      SET estado = $1,
          notas_admin = COALESCE($2, notas_admin),
          fecha_pago = CASE WHEN $1 = 'pagada' THEN NOW() ELSE fecha_pago END,
          fecha_entrega = CASE WHEN $1 = 'entregada' THEN NOW() ELSE fecha_entrega END
      WHERE id_orden = $3
      RETURNING *
    `;
    const result = await pool.query(query, [estado, notas_admin, id_orden]);
    return result.rows[0];
  }

  /**
   * Asignar credenciales a un item de orden
   */
  static async asignarCredenciales(id_order_item) {
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Obtener el item
      const itemQuery = `
        SELECT oi.*, sp.duracion_dias
        FROM order_items oi
        JOIN service_plans sp ON oi.id_plan = sp.id_plan
        WHERE oi.id_order_item = $1
      `;
      const itemResult = await client.query(itemQuery, [id_order_item]);
      const item = itemResult.rows[0];

      if (!item) {
        throw new Error('Item no encontrado');
      }

      // Buscar cuenta disponible
      const cuentaQuery = `
        SELECT * FROM inventario_cuentas
        WHERE id_plan = $1 AND estado = 'disponible'
        LIMIT 1
      `;
      const cuentaResult = await client.query(cuentaQuery, [item.id_plan]);
      
      if (cuentaResult.rows.length === 0) {
        throw new Error('No hay cuentas disponibles para este plan');
      }

      const cuenta = cuentaResult.rows[0];

      // Calcular fecha de vencimiento
      const fechaVencimiento = new Date();
      fechaVencimiento.setDate(fechaVencimiento.getDate() + item.duracion_dias);

      // Asignar cuenta al item
      await client.query(`
        UPDATE order_items
        SET id_cuenta_asignada = $1,
            estado = 'asignada',
            fecha_vencimiento_servicio = $2
        WHERE id_order_item = $3
      `, [cuenta.id_cuenta, fechaVencimiento, id_order_item]);

      // Marcar cuenta como asignada
      await client.query(`
        UPDATE inventario_cuentas
        SET estado = 'asignada',
            fecha_ultima_asignacion = NOW()
        WHERE id_cuenta = $1
      `, [cuenta.id_cuenta]);

      await client.query('COMMIT');

      return { success: true, cuenta };
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  /**
   * Marcar credenciales como entregadas
   */
  static async marcarCredencialesEntregadas(id_order_item) {
    const query = `
      UPDATE order_items
      SET credenciales_entregadas = true
      WHERE id_order_item = $1
      RETURNING *
    `;
    const result = await pool.query(query, [id_order_item]);
    return result.rows[0];
  }

  /**
   * Obtener estadísticas de órdenes
   */
  static async obtenerEstadisticas() {
    const query = `
      SELECT 
        COUNT(*) as total_ordenes,
        COUNT(*) FILTER (WHERE estado = 'pendiente_pago') as pendientes,
        COUNT(*) FILTER (WHERE estado = 'pagada') as pagadas,
        COUNT(*) FILTER (WHERE estado = 'entregada') as entregadas,
        COALESCE(SUM(monto_total) FILTER (WHERE estado = 'pagada' OR estado = 'entregada'), 0) as total_ingresos,
        COALESCE(AVG(monto_total), 0) as ticket_promedio
      FROM ordenes
    `;
    const result = await pool.query(query);
    return result.rows[0];
  }
}

module.exports = OrdenEnhanced;

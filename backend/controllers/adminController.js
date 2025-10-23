
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const Servicio = require('../models/Servicio');
const ServicePlan = require('../models/ServicePlan');
const Cuenta = require('../models/Cuenta');
const {
  validateServicioData,
  validatePlanData,
  validateCuentaData,
  validateOrdenEstado,
  validateOrdenUpdate
} = require('../utils/validators');

// ============================================================================
// SERVICIOS DE STREAMING - CRUD
// ============================================================================

/**
 * Listar todos los servicios (incluye inactivos)
 */
exports.listarServicios = async (req, res) => {
  try {
    const servicios = await Servicio.listarTodos(false);
    
    // Mapear los campos del backend al formato esperado por el frontend
    const serviciosFormateados = servicios.map(s => ({
      id: s.id_servicio,
      nombre: s.nombre,
      descripcion: s.descripcion,
      logo_url: s.logo_url,
      categoria: s.categoria,
      activo: s.activo,
      created_at: s.created_at
    }));
    
    res.json({
      success: true,
      data: serviciosFormateados
    });
  } catch (error) {
    console.error('Error al listar servicios:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al obtener servicios',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Crear nuevo servicio de streaming
 */
exports.crearServicio = async (req, res) => {
  try {
    // Validar datos de entrada
    const validation = validateServicioData(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false,
        message: 'Errores de validación',
        errors: validation.errors
      });
    }

    // Verificar que no exista un servicio con el mismo nombre
    const existingService = await pool.query(
      'SELECT id_servicio FROM servicios WHERE LOWER(nombre) = LOWER($1)',
      [validation.sanitized.nombre]
    );

    if (existingService.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un servicio con ese nombre'
      });
    }

    // Crear servicio con datos validados
    const servicio = await Servicio.crear(
      validation.sanitized.nombre,
      validation.sanitized.descripcion,
      validation.sanitized.logo_url,
      validation.sanitized.categoria
    );

    // Formatear respuesta para el frontend
    const servicioFormateado = {
      id: servicio.id_servicio,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      logo_url: servicio.logo_url,
      categoria: servicio.categoria,
      activo: servicio.activo,
      created_at: servicio.created_at
    };

    res.status(201).json({
      success: true,
      message: 'Servicio creado correctamente',
      data: servicioFormateado
    });
  } catch (error) {
    console.error('Error al crear servicio:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al crear servicio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualizar servicio existente
 */
exports.actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de servicio inválido'
      });
    }

    // Validar datos de entrada
    const validation = validateServicioData(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false,
        message: 'Errores de validación',
        errors: validation.errors
      });
    }

    // Verificar que el servicio exista
    const existingService = await pool.query(
      'SELECT id_servicio FROM servicios WHERE id_servicio = $1',
      [id]
    );

    if (existingService.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Servicio no encontrado'
      });
    }

    // Verificar que no haya otro servicio con el mismo nombre
    if (validation.sanitized.nombre) {
      const duplicateCheck = await pool.query(
        'SELECT id_servicio FROM servicios WHERE LOWER(nombre) = LOWER($1) AND id_servicio != $2',
        [validation.sanitized.nombre, id]
      );

      if (duplicateCheck.rows.length > 0) {
        return res.status(409).json({
          success: false,
          message: 'Ya existe otro servicio con ese nombre'
        });
      }
    }

    // Actualizar con datos validados
    const servicio = await Servicio.actualizar(id, validation.sanitized);

    if (!servicio) {
      return res.status(404).json({ 
        success: false,
        message: 'Servicio no encontrado' 
      });
    }

    // Formatear respuesta para el frontend
    const servicioFormateado = {
      id: servicio.id_servicio,
      nombre: servicio.nombre,
      descripcion: servicio.descripcion,
      logo_url: servicio.logo_url,
      categoria: servicio.categoria,
      activo: servicio.activo,
      created_at: servicio.created_at
    };

    res.json({
      success: true,
      message: 'Servicio actualizado correctamente',
      data: servicioFormateado
    });
  } catch (error) {
    console.error('Error al actualizar servicio:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al actualizar servicio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Eliminar (desactivar) servicio
 */
exports.eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de servicio inválido'
      });
    }

    // Verificar que el servicio no tenga planes activos
    const planesActivos = await pool.query(
      'SELECT id_plan FROM service_plans WHERE id_servicio = $1 AND activo = true LIMIT 1',
      [id]
    );

    if (planesActivos.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un servicio con planes activos. Desactiva los planes primero.'
      });
    }

    const servicio = await Servicio.eliminar(id);

    if (!servicio) {
      return res.status(404).json({ 
        success: false,
        message: 'Servicio no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Servicio desactivado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar servicio:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al eliminar servicio',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================================================
// PLANES - CRUD
// ============================================================================

/**
 * Listar todos los planes (incluye inactivos)
 */
exports.listarPlanes = async (req, res) => {
  try {
    const { id_servicio } = req.query;
    
    // Validar id_servicio si se proporciona
    if (id_servicio && isNaN(id_servicio)) {
      return res.status(400).json({
        success: false,
        message: 'ID de servicio inválido'
      });
    }
    
    let planes;
    if (id_servicio) {
      planes = await ServicePlan.obtenerPorServicio(id_servicio, false);
    } else {
      planes = await ServicePlan.listarTodos();
    }
    
    // Mapear los campos del backend al formato esperado por el frontend
    const planesFormateados = planes.map(p => ({
      id: p.id_plan,
      servicio_id: p.id_servicio,
      servicio_nombre: p.nombre_servicio,
      nombre: p.nombre_plan,
      duracion_meses: p.duracion_meses,
      precio: p.precio_venta || (p.costo + (p.costo * (p.margen_ganancia / 100))),
      slots_disponibles: p.cuentas_disponibles || 0,
      activo: p.activo,
      created_at: p.created_at
    }));
    
    res.json({
      success: true,
      data: planesFormateados
    });
  } catch (error) {
    console.error('Error al listar planes:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al obtener planes',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Crear nuevo plan
 */
exports.crearPlan = async (req, res) => {
  try {
    // Preparar datos para validación
    const planData = {
      servicio_id: req.body.servicio_id,
      id_servicio: req.body.id_servicio || req.body.servicio_id,
      nombre: req.body.nombre,
      nombre_plan: req.body.nombre_plan || req.body.nombre,
      duracion_meses: req.body.duracion_meses,
      precio: req.body.precio,
      descripcion: req.body.descripcion
    };

    // Validar datos de entrada
    const validation = validatePlanData(planData);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false,
        message: 'Errores de validación',
        errors: validation.errors
      });
    }

    // Verificar que el servicio existe
    const servicioExiste = await pool.query(
      'SELECT id_servicio FROM servicios WHERE id_servicio = $1',
      [validation.sanitized.id_servicio]
    );

    if (servicioExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'El servicio especificado no existe'
      });
    }

    // Verificar que no exista un plan con la misma duración para este servicio
    const planDuplicado = await pool.query(
      'SELECT id_plan FROM service_plans WHERE id_servicio = $1 AND duracion_meses = $2',
      [validation.sanitized.id_servicio, validation.sanitized.duracion_meses]
    );

    if (planDuplicado.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe un plan con esta duración para este servicio'
      });
    }

    // Calcular costo y margen
    const margen_ganancia = validation.sanitized.margen_ganancia || 30;
    const costo = validation.sanitized.costo || Math.round(validation.sanitized.precio / (1 + margen_ganancia / 100));

    const plan = await ServicePlan.crear({
      id_servicio: validation.sanitized.id_servicio,
      nombre_plan: validation.sanitized.nombre_plan,
      duracion_meses: validation.sanitized.duracion_meses,
      costo,
      margen_ganancia,
      descripcion: validation.sanitized.descripcion || ''
    });

    // Formatear respuesta para el frontend
    const planFormateado = {
      id: plan.id_plan,
      servicio_id: plan.id_servicio,
      nombre: plan.nombre_plan,
      duracion_meses: plan.duracion_meses,
      precio: validation.sanitized.precio,
      slots_disponibles: 0,
      activo: plan.activo,
      created_at: plan.created_at
    };

    res.status(201).json({
      success: true,
      message: 'Plan creado correctamente',
      data: planFormateado
    });
  } catch (error) {
    console.error('Error al crear plan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al crear plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualizar plan existente
 */
exports.actualizarPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de plan inválido'
      });
    }

    // Preparar datos para validación
    const planData = {
      servicio_id: req.body.servicio_id,
      id_servicio: req.body.id_servicio || req.body.servicio_id,
      nombre: req.body.nombre,
      nombre_plan: req.body.nombre_plan || req.body.nombre,
      duracion_meses: req.body.duracion_meses,
      precio: req.body.precio,
      descripcion: req.body.descripcion,
      activo: req.body.activo
    };

    // Solo validar campos que se están actualizando
    if (!planData.nombre && !planData.nombre_plan) {
      planData.nombre = 'Temporal'; // Para pasar validación
    }
    if (planData.precio === undefined) {
      planData.precio = 1; // Para pasar validación
    }
    if (planData.duracion_meses === undefined) {
      planData.duracion_meses = 1; // Para pasar validación
    }

    // Validar datos de entrada
    const validation = validatePlanData(planData);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false,
        message: 'Errores de validación',
        errors: validation.errors
      });
    }

    // Verificar que el plan existe
    const planExiste = await pool.query(
      'SELECT id_plan, id_servicio FROM service_plans WHERE id_plan = $1',
      [id]
    );

    if (planExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Plan no encontrado'
      });
    }

    // Si se cambia el servicio, verificar que existe
    if (req.body.servicio_id || req.body.id_servicio) {
      const servicioId = req.body.servicio_id || req.body.id_servicio;
      const servicioExiste = await pool.query(
        'SELECT id_servicio FROM servicios WHERE id_servicio = $1',
        [servicioId]
      );

      if (servicioExiste.rows.length === 0) {
        return res.status(404).json({
          success: false,
          message: 'El servicio especificado no existe'
        });
      }
    }

    // Preparar datos para actualización
    const datosActualizacion = {};
    
    if (req.body.servicio_id || req.body.id_servicio) {
      datosActualizacion.id_servicio = req.body.servicio_id || req.body.id_servicio;
    }
    if (req.body.nombre || req.body.nombre_plan) {
      datosActualizacion.nombre_plan = (req.body.nombre || req.body.nombre_plan).trim();
    }
    if (req.body.duracion_meses !== undefined) {
      datosActualizacion.duracion_meses = validation.sanitized.duracion_meses;
    }
    if (req.body.activo !== undefined) {
      datosActualizacion.activo = req.body.activo;
    }
    if (req.body.descripcion !== undefined) {
      datosActualizacion.descripcion = validation.sanitized.descripcion;
    }
    
    // Si se proporciona precio, calcular costo y margen
    if (req.body.precio !== undefined) {
      const margen_ganancia = 30;
      datosActualizacion.costo = Math.round(req.body.precio / (1 + margen_ganancia / 100));
      datosActualizacion.margen_ganancia = margen_ganancia;
    }

    const plan = await ServicePlan.actualizar(id, datosActualizacion);

    if (!plan) {
      return res.status(404).json({ 
        success: false,
        message: 'Plan no encontrado' 
      });
    }

    // Formatear respuesta para el frontend
    const planFormateado = {
      id: plan.id_plan,
      servicio_id: plan.id_servicio,
      nombre: plan.nombre_plan,
      duracion_meses: plan.duracion_meses,
      precio: req.body.precio || (plan.costo + (plan.costo * (plan.margen_ganancia / 100))),
      slots_disponibles: 0,
      activo: plan.activo,
      created_at: plan.created_at
    };

    res.json({
      success: true,
      message: 'Plan actualizado correctamente',
      data: planFormateado
    });
  } catch (error) {
    console.error('Error al actualizar plan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al actualizar plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Eliminar (desactivar) plan
 */
exports.eliminarPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de plan inválido'
      });
    }

    // Verificar que el plan no tenga pedidos activos
    const pedidosActivos = await pool.query(
      `SELECT oi.id_order_item 
       FROM order_items oi
       JOIN ordenes o ON oi.id_orden = o.id_orden
       WHERE oi.id_plan = $1 
       AND o.estado IN ('pendiente_pago', 'pagada', 'en_proceso')
       LIMIT 1`,
      [id]
    );

    if (pedidosActivos.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar un plan con pedidos activos'
      });
    }

    const plan = await ServicePlan.eliminar(id);

    if (!plan) {
      return res.status(404).json({ 
        success: false,
        message: 'Plan no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Plan desactivado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar plan:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al eliminar plan',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================================================
// GESTIÓN DE ÓRDENES
// ============================================================================

/**
 * Listar todas las órdenes con filtros opcionales
 */
exports.listarOrdenes = async (req, res) => {
  try {
    const { estado, celular, fecha_desde, fecha_hasta, payment_status, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        o.id_orden,
        o.celular_usuario,
        u.nombre as nombre_usuario,
        o.monto_total,
        o.estado,
        o.metodo_pago,
        o.metodo_entrega,
        o.payment_status,
        o.payment_confirmed_at,
        o.fecha_creacion,
        o.fecha_pago,
        o.fecha_entrega,
        COUNT(oi.id_order_item) as cantidad_items
      FROM ordenes o
      LEFT JOIN usuarios u ON o.celular_usuario = u.celular
      LEFT JOIN order_items oi ON o.id_orden = oi.id_orden
    `;
    
    const conditions = [];
    const values = [];
    let paramCount = 1;
    
    if (estado) {
      conditions.push(`o.estado = $${paramCount}`);
      values.push(estado);
      paramCount++;
    }
    
    if (celular) {
      conditions.push(`o.celular_usuario = $${paramCount}`);
      values.push(celular);
      paramCount++;
    }
    
    if (fecha_desde) {
      conditions.push(`o.fecha_creacion >= $${paramCount}`);
      values.push(fecha_desde);
      paramCount++;
    }
    
    if (fecha_hasta) {
      conditions.push(`o.fecha_creacion <= $${paramCount}`);
      values.push(fecha_hasta);
      paramCount++;
    }
    
    if (payment_status) {
      conditions.push(`o.payment_status = $${paramCount}`);
      values.push(payment_status);
      paramCount++;
    }
    
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    query += `
      GROUP BY o.id_orden, u.nombre
      ORDER BY o.fecha_creacion DESC
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `;
    
    values.push(parseInt(limit), parseInt(offset));
    
    const result = await pool.query(query, values);
    
    // Obtener total de órdenes
    let countQuery = 'SELECT COUNT(*) as total FROM ordenes o';
    if (conditions.length > 0) {
      countQuery += ' WHERE ' + conditions.join(' AND ');
    }
    const countResult = await pool.query(countQuery, values.slice(0, -2));
    
    res.json({
      success: true,
      data: {
        ordenes: result.rows,
        total: parseInt(countResult.rows[0].total),
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error al listar órdenes:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener órdenes' 
    });
  }
};

/**
 * Obtener detalles de una orden específica
 */
exports.obtenerOrden = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ordenQuery = `
      SELECT 
        o.*,
        u.nombre as nombre_usuario,
        u.email as email_usuario,
        a.username as admin_confirmador
      FROM ordenes o
      LEFT JOIN usuarios u ON o.celular_usuario = u.celular
      LEFT JOIN admins a ON o.payment_confirmed_by = a.id
      WHERE o.id_orden = $1
    `;
    
    const ordenResult = await pool.query(ordenQuery, [id]);
    
    if (ordenResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'Orden no encontrada' 
      });
    }
    
    const itemsQuery = `
      SELECT 
        oi.*,
        sp.nombre_plan,
        s.nombre as nombre_servicio,
        ic.correo_encriptado,
        ic.contrasena_encriptada,
        ic.perfil,
        ic.pin
      FROM order_items oi
      LEFT JOIN service_plans sp ON oi.id_plan = sp.id_plan
      LEFT JOIN servicios s ON sp.id_servicio = s.id_servicio
      LEFT JOIN inventario_cuentas ic ON oi.id_cuenta_asignada = ic.id_cuenta
      WHERE oi.id_orden = $1
    `;
    
    const itemsResult = await pool.query(itemsQuery, [id]);
    
    const orden = ordenResult.rows[0];
    orden.items = itemsResult.rows;
    
    res.json({
      success: true,
      data: orden
    });
  } catch (error) {
    console.error('Error al obtener orden:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener orden' 
    });
  }
};

/**
 * Actualizar estado de una orden
 */
exports.actualizarEstadoOrden = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notas_admin } = req.body;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de orden inválido'
      });
    }

    // Validar datos de entrada
    const validation = validateOrdenUpdate({ estado, notas_admin });
    
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false,
        message: 'Errores de validación',
        errors: validation.errors
      });
    }

    // Obtener el estado actual de la orden
    const ordenActual = await pool.query(
      'SELECT estado FROM ordenes WHERE id_orden = $1',
      [id]
    );

    if (ordenActual.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Orden no encontrada' 
      });
    }

    const estadoActual = ordenActual.rows[0].estado;

    // Validar transición de estado
    const transicionValidation = validateOrdenEstado(estadoActual, estado);
    
    if (!transicionValidation.valid) {
      return res.status(400).json({ 
        success: false,
        message: transicionValidation.message
      });
    }
    
    let updateFields = ['estado = $1'];
    let values = [estado];
    let paramCount = 2;
    
    if (notas_admin !== undefined) {
      updateFields.push(`notas_admin = $${paramCount}`);
      values.push(validation.sanitized.notas_admin);
      paramCount++;
    }
    
    // Actualizar timestamps según el estado
    if (estado === 'pagada' && estadoActual !== 'pagada') {
      updateFields.push(`fecha_pago = NOW()`);
    }
    
    if (estado === 'entregada' && estadoActual !== 'entregada') {
      updateFields.push(`fecha_entrega = NOW()`);
    }
    
    values.push(id);
    
    const query = `
      UPDATE ordenes 
      SET ${updateFields.join(', ')}
      WHERE id_orden = $${paramCount}
      RETURNING *
    `;
    
    const result = await pool.query(query, values);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Orden no encontrada' 
      });
    }
    
    res.json({
      success: true,
      message: `Orden actualizada a estado "${estado}" correctamente`,
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al actualizar orden',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Confirmar pago de una orden
 * FASE 4.1 - Sistema de pagos con confirmación manual
 */
exports.confirmarPago = async (req, res) => {
  try {
    const { id } = req.params;
    const adminId = req.user.adminId || req.user.id;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de orden inválido'
      });
    }

    // Obtener la orden actual
    const ordenQuery = `
      SELECT 
        o.*,
        COUNT(oi.id_order_item) as total_items
      FROM ordenes o
      LEFT JOIN order_items oi ON o.id_orden = oi.id_orden
      WHERE o.id_orden = $1
      GROUP BY o.id_orden
    `;
    
    const ordenResult = await pool.query(ordenQuery, [id]);

    if (ordenResult.rows.length === 0) {
      return res.status(404).json({ 
        success: false,
        message: 'Orden no encontrada' 
      });
    }

    const orden = ordenResult.rows[0];

    // Validar que el pago esté pendiente
    if (orden.payment_status === 'confirmed') {
      return res.status(400).json({
        success: false,
        message: 'El pago de esta orden ya fue confirmado anteriormente'
      });
    }

    // Iniciar transacción
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');

      // Actualizar estado de pago
      const updateQuery = `
        UPDATE ordenes 
        SET 
          payment_status = 'confirmed',
          payment_confirmed_at = NOW(),
          payment_confirmed_by = $1,
          estado = CASE 
            WHEN estado = 'pendiente_pago' THEN 'en_proceso'::estado_orden
            ELSE estado 
          END,
          fecha_pago = CASE 
            WHEN fecha_pago IS NULL THEN NOW()
            ELSE fecha_pago
          END
        WHERE id_orden = $2
        RETURNING *
      `;
      
      const updateResult = await client.query(updateQuery, [adminId, id]);
      const ordenActualizada = updateResult.rows[0];

      // Intentar asignar cuentas automáticamente si hay disponibles
      const itemsQuery = `
        SELECT oi.*, sp.duracion_dias
        FROM order_items oi
        JOIN service_plans sp ON oi.id_plan = sp.id_plan
        WHERE oi.id_orden = $1 
        AND oi.id_cuenta_asignada IS NULL
        ORDER BY oi.id_order_item
      `;
      
      const itemsResult = await client.query(itemsQuery, [id]);
      const itemsPendientes = itemsResult.rows;

      let cuentasAsignadas = 0;
      
      for (const item of itemsPendientes) {
        // Buscar cuenta disponible para cada item
        for (let i = 0; i < item.cantidad; i++) {
          const cuentaQuery = `
            SELECT ic.id_cuenta
            FROM inventario_cuentas ic
            WHERE ic.id_plan = $1 
            AND ic.estado = 'disponible'
            LIMIT 1
            FOR UPDATE
          `;
          
          const cuentaResult = await client.query(cuentaQuery, [item.id_plan]);
          
          if (cuentaResult.rows.length > 0) {
            const cuentaId = cuentaResult.rows[0].id_cuenta;
            
            // Asignar cuenta
            await client.query(`
              UPDATE order_items
              SET 
                id_cuenta_asignada = $1,
                estado = 'asignada',
                fecha_vencimiento_servicio = NOW() + INTERVAL '1 day' * $2
              WHERE id_order_item = $3
            `, [cuentaId, item.duracion_dias || 30, item.id_order_item]);
            
            // Actualizar estado de cuenta
            await client.query(`
              UPDATE inventario_cuentas
              SET 
                estado = 'asignada',
                fecha_ultima_asignacion = NOW()
              WHERE id_cuenta = $1
            `, [cuentaId]);
            
            cuentasAsignadas++;
          }
        }
      }

      await client.query('COMMIT');

      // Obtener orden actualizada con detalles
      const ordenDetalleQuery = `
        SELECT 
          o.*,
          u.nombre as nombre_usuario,
          u.email as email_usuario,
          a.username as admin_confirmador
        FROM ordenes o
        LEFT JOIN usuarios u ON o.celular_usuario = u.celular
        LEFT JOIN admins a ON o.payment_confirmed_by = a.id
        WHERE o.id_orden = $1
      `;
      
      const detalleResult = await client.query(ordenDetalleQuery, [id]);
      const ordenCompleta = detalleResult.rows[0];

      res.json({
        success: true,
        message: `Pago confirmado correctamente. ${cuentasAsignadas > 0 ? `Se asignaron ${cuentasAsignadas} cuenta(s) automáticamente.` : 'No se pudieron asignar cuentas automáticamente por falta de stock.'}`,
        data: {
          orden: ordenCompleta,
          cuentas_asignadas: cuentasAsignadas,
          items_totales: orden.total_items
        }
      });
      
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }

  } catch (error) {
    console.error('Error al confirmar pago:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al confirmar pago',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================================================
// CUENTAS DE STREAMING - CRUD
// ============================================================================

/**
 * Listar cuentas de streaming con filtros
 */
exports.listarCuentas = async (req, res) => {
  try {
    const { id_plan, estado, limit = 50, offset = 0 } = req.query;
    
    // Validar parámetros
    if (id_plan && isNaN(id_plan)) {
      return res.status(400).json({
        success: false,
        message: 'ID de plan inválido'
      });
    }
    
    if (estado) {
      const estadosValidos = ['disponible', 'asignada', 'mantenimiento', 'bloqueada'];
      if (!estadosValidos.includes(estado)) {
        return res.status(400).json({
          success: false,
          message: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}`
        });
      }
    }
    
    const limitNum = Math.min(parseInt(limit) || 50, 100); // Máximo 100
    const offsetNum = Math.max(parseInt(offset) || 0, 0);
    
    const cuentas = await Cuenta.listarTodas({ 
      id_plan: id_plan ? parseInt(id_plan) : null, 
      estado, 
      limit: limitNum, 
      offset: offsetNum 
    });
    
    res.json({
      success: true,
      data: cuentas,
      pagination: {
        limit: limitNum,
        offset: offsetNum
      }
    });
  } catch (error) {
    console.error('Error al listar cuentas:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al obtener cuentas',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Crear nueva cuenta de streaming
 */
exports.crearCuenta = async (req, res) => {
  try {
    // Validar datos de entrada
    const validation = validateCuentaData(req.body);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false,
        message: 'Errores de validación',
        errors: validation.errors
      });
    }

    // Verificar que el plan existe
    const planExiste = await pool.query(
      'SELECT id_plan FROM service_plans WHERE id_plan = $1',
      [validation.sanitized.id_plan]
    );

    if (planExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'El plan especificado no existe'
      });
    }

    // Verificar que no exista una cuenta duplicada (mismo correo y plan)
    const cuentaDuplicada = await pool.query(
      'SELECT id_cuenta FROM inventario_cuentas WHERE id_plan = $1 AND correo_encriptado = $2',
      [validation.sanitized.id_plan, validation.sanitized.correo]
    );

    if (cuentaDuplicada.rows.length > 0) {
      return res.status(409).json({
        success: false,
        message: 'Ya existe una cuenta con ese correo para este plan'
      });
    }

    const cuenta = await Cuenta.crear(validation.sanitized);

    res.status(201).json({
      success: true,
      message: 'Cuenta creada correctamente',
      data: cuenta
    });
  } catch (error) {
    console.error('Error al crear cuenta:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al crear cuenta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Actualizar cuenta existente
 */
exports.actualizarCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cuenta inválido'
      });
    }

    // Verificar que la cuenta existe
    const cuentaExiste = await pool.query(
      'SELECT id_cuenta, estado FROM inventario_cuentas WHERE id_cuenta = $1',
      [id]
    );

    if (cuentaExiste.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Cuenta no encontrada'
      });
    }

    // Si se intenta actualizar una cuenta asignada, validar
    const estadoActual = cuentaExiste.rows[0].estado;
    if (estadoActual === 'asignada' && req.body.estado && req.body.estado !== 'asignada') {
      // Verificar que no esté en uso en un pedido activo
      const enUso = await pool.query(
        `SELECT oi.id_order_item 
         FROM order_items oi
         JOIN ordenes o ON oi.id_orden = o.id_orden
         WHERE oi.id_cuenta_asignada = $1 
         AND o.estado IN ('pendiente_pago', 'pagada', 'en_proceso')
         LIMIT 1`,
        [id]
      );

      if (enUso.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'No se puede cambiar el estado de una cuenta asignada a un pedido activo'
        });
      }
    }

    // Validar solo los campos que se están actualizando
    const updateData = { ...req.body };
    
    // Si no incluye campos obligatorios, agregar valores temporales para validación
    if (!updateData.correo) updateData.correo = 'temp@temp.com';
    if (!updateData.contrasena) updateData.contrasena = 'temporal123';
    if (!updateData.id_plan) updateData.id_plan = cuentaExiste.rows[0].id_plan || 1;

    const validation = validateCuentaData(updateData);
    
    if (!validation.valid) {
      return res.status(400).json({ 
        success: false,
        message: 'Errores de validación',
        errors: validation.errors
      });
    }

    // Preparar solo los campos que realmente se están actualizando
    const datosActualizacion = {};
    if (req.body.correo !== undefined) datosActualizacion.correo = req.body.correo;
    if (req.body.contrasena !== undefined) datosActualizacion.contrasena = req.body.contrasena;
    if (req.body.perfil !== undefined) datosActualizacion.perfil = validation.sanitized.perfil;
    if (req.body.pin !== undefined) datosActualizacion.pin = validation.sanitized.pin;
    if (req.body.notas !== undefined) datosActualizacion.notas = validation.sanitized.notas;
    if (req.body.estado !== undefined) datosActualizacion.estado = validation.sanitized.estado;

    const cuenta = await Cuenta.actualizar(id, datosActualizacion);

    if (!cuenta) {
      return res.status(404).json({ 
        success: false,
        message: 'Cuenta no encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Cuenta actualizada correctamente',
      data: cuenta
    });
  } catch (error) {
    console.error('Error al actualizar cuenta:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al actualizar cuenta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Eliminar cuenta
 */
exports.eliminarCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validar que el ID sea un número
    if (isNaN(id)) {
      return res.status(400).json({
        success: false,
        message: 'ID de cuenta inválido'
      });
    }

    // Verificar que la cuenta no esté asignada a un pedido activo
    const enUso = await pool.query(
      `SELECT oi.id_order_item 
       FROM order_items oi
       JOIN ordenes o ON oi.id_orden = o.id_orden
       WHERE oi.id_cuenta_asignada = $1 
       AND o.estado IN ('pendiente_pago', 'pagada', 'en_proceso')
       LIMIT 1`,
      [id]
    );

    if (enUso.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'No se puede eliminar una cuenta asignada a un pedido activo'
      });
    }

    const cuenta = await Cuenta.eliminar(id);

    if (!cuenta) {
      return res.status(404).json({ 
        success: false,
        message: 'Cuenta no encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Cuenta eliminada correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar cuenta:', error);
    res.status(500).json({ 
      success: false,
      message: 'Error interno del servidor al eliminar cuenta',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// ============================================================================
// DASHBOARD - ESTADÍSTICAS
// ============================================================================

/**
 * Obtener estadísticas del dashboard
 */
exports.obtenerDashboard = async (req, res) => {
  try {
    // Total de órdenes
    const ordenesQuery = `
      SELECT 
        COUNT(*) as total_ordenes,
        COUNT(CASE WHEN estado = 'pendiente_pago' THEN 1 END) as ordenes_pendientes,
        COUNT(CASE WHEN estado = 'pagada' THEN 1 END) as ordenes_pagadas,
        COUNT(CASE WHEN estado = 'entregada' THEN 1 END) as ordenes_entregadas
      FROM ordenes
    `;
    const ordenesResult = await pool.query(ordenesQuery);
    
    // Ventas totales
    const ventasQuery = `
      SELECT 
        COALESCE(SUM(monto_total), 0) as ventas_totales,
        COALESCE(SUM(CASE WHEN estado = 'pagada' OR estado = 'entregada' THEN monto_total ELSE 0 END), 0) as ventas_confirmadas
      FROM ordenes
    `;
    const ventasResult = await pool.query(ventasQuery);
    
    // Total de usuarios
    const usuariosQuery = 'SELECT COUNT(*) as total_usuarios FROM usuarios';
    const usuariosResult = await pool.query(usuariosQuery);
    
    // Servicios activos
    const serviciosQuery = 'SELECT COUNT(*) as servicios_activos FROM servicios WHERE activo = true';
    const serviciosResult = await pool.query(serviciosQuery);
    
    // Planes activos
    const planesQuery = 'SELECT COUNT(*) as planes_activos FROM service_plans WHERE activo = true';
    const planesResult = await pool.query(planesQuery);
    
    // Cuentas disponibles
    const cuentasQuery = `
      SELECT 
        COUNT(*) as total_cuentas,
        COUNT(CASE WHEN estado = 'disponible' THEN 1 END) as cuentas_disponibles,
        COUNT(CASE WHEN estado = 'asignada' THEN 1 END) as cuentas_asignadas
      FROM inventario_cuentas
    `;
    const cuentasResult = await pool.query(cuentasQuery);
    
    // Ventas por día (últimos 30 días)
    const ventasPorDiaQuery = `
      SELECT 
        DATE(fecha_creacion) as fecha,
        COUNT(*) as ordenes,
        SUM(monto_total) as total
      FROM ordenes
      WHERE fecha_creacion >= NOW() - INTERVAL '30 days'
      AND (estado = 'pagada' OR estado = 'entregada')
      GROUP BY DATE(fecha_creacion)
      ORDER BY fecha DESC
    `;
    const ventasPorDiaResult = await pool.query(ventasPorDiaQuery);
    
    // Top servicios más vendidos
    const topServiciosQuery = `
      SELECT 
        s.nombre as servicio,
        COUNT(oi.id_order_item) as cantidad_vendida,
        SUM(oi.subtotal) as total_ventas
      FROM order_items oi
      JOIN service_plans sp ON oi.id_plan = sp.id_plan
      JOIN servicios s ON sp.id_servicio = s.id_servicio
      JOIN ordenes o ON oi.id_orden = o.id_orden
      WHERE o.estado IN ('pagada', 'entregada')
      GROUP BY s.id_servicio, s.nombre
      ORDER BY cantidad_vendida DESC
      LIMIT 5
    `;
    const topServiciosResult = await pool.query(topServiciosQuery);
    
    res.json({
      success: true,
      data: {
        ordenes: ordenesResult.rows[0],
        ventas: ventasResult.rows[0],
        usuarios: usuariosResult.rows[0],
        servicios: serviciosResult.rows[0],
        planes: planesResult.rows[0],
        cuentas: cuentasResult.rows[0],
        ventas_por_dia: ventasPorDiaResult.rows,
        top_servicios: topServiciosResult.rows
      }
    });
  } catch (error) {
    console.error('Error al obtener dashboard:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener estadísticas' 
    });
  }
};

// ============================================================================
// CONFIGURACIÓN DE EVOLUTION API
// ============================================================================

/**
 * Obtener configuración de Evolution API
 */
exports.obtenerConfigEvolution = async (req, res) => {
  try {
    const query = `
      SELECT * FROM evolution_config 
      WHERE id = 1
    `;
    
    const result = await pool.query(query);
    
    if (result.rows.length === 0) {
      // Si no existe, crear una configuración por defecto
      const defaultConfig = {
        api_url: '',
        api_key: '',
        instance_name: '',
        activo: false
      };
      
      return res.json({
        success: true,
        data: defaultConfig
      });
    }
    
    res.json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    // Si la tabla no existe, crearla
    if (error.code === '42P01') {
      try {
        await pool.query(`
          CREATE TABLE IF NOT EXISTS evolution_config (
            id INTEGER PRIMARY KEY DEFAULT 1,
            api_url TEXT,
            api_key TEXT,
            instance_name VARCHAR(100),
            activo BOOLEAN DEFAULT false,
            fecha_actualizacion TIMESTAMP DEFAULT NOW(),
            CONSTRAINT single_row CHECK (id = 1)
          )
        `);
        
        return res.json({
          success: true,
          data: {
            api_url: '',
            api_key: '',
            instance_name: '',
            activo: false
          }
        });
      } catch (createError) {
        console.error('Error al crear tabla evolution_config:', createError);
        return res.status(500).json({ 
          success: false,
          error: 'Error al obtener configuración' 
        });
      }
    }
    
    console.error('Error al obtener configuración Evolution:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener configuración' 
    });
  }
};

/**
 * Guardar/actualizar configuración de Evolution API
 */
exports.guardarConfigEvolution = async (req, res) => {
  try {
    const { api_url, api_key, instance_name, activo } = req.body;
    
    // Crear tabla si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS evolution_config (
        id INTEGER PRIMARY KEY DEFAULT 1,
        api_url TEXT,
        api_key TEXT,
        instance_name VARCHAR(100),
        activo BOOLEAN DEFAULT false,
        fecha_actualizacion TIMESTAMP DEFAULT NOW(),
        CONSTRAINT single_row CHECK (id = 1)
      )
    `);
    
    const query = `
      INSERT INTO evolution_config (id, api_url, api_key, instance_name, activo, fecha_actualizacion)
      VALUES (1, $1, $2, $3, $4, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        api_url = $1,
        api_key = $2,
        instance_name = $3,
        activo = $4,
        fecha_actualizacion = NOW()
      RETURNING *
    `;
    
    const result = await pool.query(query, [api_url, api_key, instance_name, activo]);
    
    res.json({
      success: true,
      message: 'Configuración guardada correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al guardar configuración Evolution:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al guardar configuración' 
    });
  }
};

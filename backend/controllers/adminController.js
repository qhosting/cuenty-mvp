
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const Servicio = require('../models/Servicio');
const ServicePlan = require('../models/ServicePlan');
const Cuenta = require('../models/Cuenta');

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
      error: 'Error al obtener servicios' 
    });
  }
};

/**
 * Crear nuevo servicio de streaming
 */
exports.crearServicio = async (req, res) => {
  try {
    const { nombre, descripcion, logo_url, categoria, activo } = req.body;

    if (!nombre) {
      return res.status(400).json({ 
        success: false,
        error: 'Nombre del servicio es requerido' 
      });
    }

    const servicio = await Servicio.crear(nombre, descripcion, logo_url, categoria);

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
      error: 'Error al crear servicio' 
    });
  }
};

/**
 * Actualizar servicio existente
 */
exports.actualizarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.actualizar(id, req.body);

    if (!servicio) {
      return res.status(404).json({ 
        success: false,
        error: 'Servicio no encontrado' 
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
      error: 'Error al actualizar servicio' 
    });
  }
};

/**
 * Eliminar (desactivar) servicio
 */
exports.eliminarServicio = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.eliminar(id);

    if (!servicio) {
      return res.status(404).json({ 
        success: false,
        error: 'Servicio no encontrado' 
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
      error: 'Error al eliminar servicio' 
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
      error: 'Error al obtener planes' 
    });
  }
};

/**
 * Crear nuevo plan
 */
exports.crearPlan = async (req, res) => {
  try {
    // El frontend envía: servicio_id, nombre, precio, duracion_meses, slots_disponibles, activo
    // El backend espera: id_servicio, nombre_plan, costo, margen_ganancia, duracion_meses, descripcion
    const { 
      servicio_id, 
      nombre, 
      precio, 
      duracion_meses, 
      slots_disponibles, 
      activo,
      descripcion 
    } = req.body;

    // Validación
    if (!servicio_id || !nombre || !duracion_meses || precio === undefined) {
      return res.status(400).json({ 
        success: false,
        error: 'Todos los campos obligatorios son requeridos' 
      });
    }

    // Calcular costo y margen (por defecto, asumir un margen del 30%)
    const margen_ganancia = 30;
    const costo = Math.round(precio / (1 + margen_ganancia / 100));

    const plan = await ServicePlan.crear({
      id_servicio: servicio_id,
      nombre_plan: nombre,
      duracion_meses,
      costo,
      margen_ganancia,
      descripcion: descripcion || ''
    });

    // Formatear respuesta para el frontend
    const planFormateado = {
      id: plan.id_plan,
      servicio_id: plan.id_servicio,
      nombre: plan.nombre_plan,
      duracion_meses: plan.duracion_meses,
      precio: precio,
      slots_disponibles: slots_disponibles || 0,
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
      error: 'Error al crear plan' 
    });
  }
};

/**
 * Actualizar plan existente
 */
exports.actualizarPlan = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Mapear campos del frontend al backend
    const { 
      servicio_id, 
      nombre, 
      precio, 
      duracion_meses, 
      slots_disponibles,
      activo,
      descripcion 
    } = req.body;

    // Preparar datos para actualización
    const datosActualizacion = {};
    
    if (servicio_id !== undefined) datosActualizacion.id_servicio = servicio_id;
    if (nombre !== undefined) datosActualizacion.nombre_plan = nombre;
    if (duracion_meses !== undefined) datosActualizacion.duracion_meses = duracion_meses;
    if (activo !== undefined) datosActualizacion.activo = activo;
    if (descripcion !== undefined) datosActualizacion.descripcion = descripcion;
    
    // Si se proporciona precio, calcular costo y margen
    if (precio !== undefined) {
      const margen_ganancia = 30;
      datosActualizacion.costo = Math.round(precio / (1 + margen_ganancia / 100));
      datosActualizacion.margen_ganancia = margen_ganancia;
    }

    const plan = await ServicePlan.actualizar(id, datosActualizacion);

    if (!plan) {
      return res.status(404).json({ 
        success: false,
        error: 'Plan no encontrado' 
      });
    }

    // Formatear respuesta para el frontend
    const planFormateado = {
      id: plan.id_plan,
      servicio_id: plan.id_servicio,
      nombre: plan.nombre_plan,
      duracion_meses: plan.duracion_meses,
      precio: precio || (plan.costo + (plan.costo * (plan.margen_ganancia / 100))),
      slots_disponibles: slots_disponibles || 0,
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
      error: 'Error al actualizar plan' 
    });
  }
};

/**
 * Eliminar (desactivar) plan
 */
exports.eliminarPlan = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await ServicePlan.eliminar(id);

    if (!plan) {
      return res.status(404).json({ 
        success: false,
        error: 'Plan no encontrado' 
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
      error: 'Error al eliminar plan' 
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
    const { estado, celular, fecha_desde, fecha_hasta, limit = 50, offset = 0 } = req.query;
    
    let query = `
      SELECT 
        o.id_orden,
        o.celular_usuario,
        u.nombre as nombre_usuario,
        o.monto_total,
        o.estado,
        o.metodo_pago,
        o.metodo_entrega,
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
        u.email as email_usuario
      FROM ordenes o
      LEFT JOIN usuarios u ON o.celular_usuario = u.celular
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
    
    const estadosValidos = ['pendiente', 'pendiente_pago', 'pagada', 'en_proceso', 'entregada', 'cancelada'];
    
    if (!estado || !estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        success: false,
        error: 'Estado inválido' 
      });
    }
    
    let updateFields = ['estado = $1'];
    let values = [estado];
    let paramCount = 2;
    
    if (notas_admin !== undefined) {
      updateFields.push(`notas_admin = $${paramCount}`);
      values.push(notas_admin);
      paramCount++;
    }
    
    if (estado === 'pagada') {
      updateFields.push(`fecha_pago = NOW()`);
    }
    
    if (estado === 'entregada') {
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
        error: 'Orden no encontrada' 
      });
    }
    
    res.json({
      success: true,
      message: 'Estado de orden actualizado correctamente',
      data: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar orden:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al actualizar orden' 
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
    
    const cuentas = await Cuenta.listarTodas({ 
      id_plan: id_plan ? parseInt(id_plan) : null, 
      estado, 
      limit: parseInt(limit), 
      offset: parseInt(offset) 
    });
    
    res.json({
      success: true,
      data: cuentas
    });
  } catch (error) {
    console.error('Error al listar cuentas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener cuentas' 
    });
  }
};

/**
 * Crear nueva cuenta de streaming
 */
exports.crearCuenta = async (req, res) => {
  try {
    const { id_plan, correo, contrasena, perfil, pin, notas } = req.body;

    if (!id_plan || !correo || !contrasena) {
      return res.status(400).json({ 
        success: false,
        error: 'id_plan, correo y contraseña son requeridos' 
      });
    }

    const cuenta = await Cuenta.crear({
      id_plan,
      correo,
      contrasena,
      perfil,
      pin,
      notas
    });

    res.status(201).json({
      success: true,
      message: 'Cuenta creada correctamente',
      data: cuenta
    });
  } catch (error) {
    console.error('Error al crear cuenta:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al crear cuenta' 
    });
  }
};

/**
 * Actualizar cuenta existente
 */
exports.actualizarCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const cuenta = await Cuenta.actualizar(id, req.body);

    if (!cuenta) {
      return res.status(404).json({ 
        success: false,
        error: 'Cuenta no encontrada' 
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
      error: 'Error al actualizar cuenta' 
    });
  }
};

/**
 * Eliminar cuenta
 */
exports.eliminarCuenta = async (req, res) => {
  try {
    const { id } = req.params;
    const cuenta = await Cuenta.eliminar(id);

    if (!cuenta) {
      return res.status(404).json({ 
        success: false,
        error: 'Cuenta no encontrada' 
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
      error: 'Error al eliminar cuenta' 
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

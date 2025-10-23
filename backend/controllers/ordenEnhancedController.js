
const OrdenEnhanced = require('../models/OrdenEnhanced');
const ShoppingCart = require('../models/ShoppingCart');

/**
 * Crear orden desde el carrito
 */
exports.crearDesdeCarrito = async (req, res) => {
  try {
    const celular = req.user.celular;
    const { metodo_entrega } = req.body;
    
    // Obtener clienteId si el usuario está autenticado como cliente
    const clienteId = req.user.clienteId || null;

    // Verificar que el carrito no esté vacío
    const carrito = await ShoppingCart.obtenerCarrito(celular);
    
    if (carrito.items.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'El carrito está vacío' 
      });
    }

    // Verificar disponibilidad
    const itemsNoDisponibles = await ShoppingCart.verificarDisponibilidad(celular);
    if (itemsNoDisponibles.length > 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Algunos items no tienen stock suficiente',
        items_no_disponibles: itemsNoDisponibles
      });
    }

    // Crear orden (asociar con cliente si está autenticado)
    const orden = await OrdenEnhanced.crearDesdeCarrito(celular, metodo_entrega, clienteId);

    res.status(201).json({
      success: true,
      message: 'Orden creada correctamente',
      data: orden
    });
  } catch (error) {
    console.error('Error al crear orden:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error al crear orden' 
    });
  }
};

/**
 * Obtener orden por ID
 */
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const orden = await OrdenEnhanced.obtenerPorId(id);

    if (!orden) {
      return res.status(404).json({ 
        success: false,
        error: 'Orden no encontrada' 
      });
    }

    // Verificar que el usuario tenga acceso a esta orden
    if (req.user.celular && orden.celular_usuario !== req.user.celular && !req.user.isAdmin) {
      return res.status(403).json({ 
        success: false,
        error: 'No tienes permiso para ver esta orden' 
      });
    }

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
 * Listar órdenes del usuario
 */
exports.listarMisOrdenes = async (req, res) => {
  try {
    const celular = req.user.celular;
    const limite = parseInt(req.query.limite) || 20;
    
    const ordenes = await OrdenEnhanced.listarPorUsuario(celular, limite);

    res.json({
      success: true,
      data: ordenes
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
 * Listar todas las órdenes (admin)
 */
exports.listarTodas = async (req, res) => {
  try {
    const { estado, celular_usuario, limite, offset } = req.query;
    
    const filtros = {};
    if (estado) filtros.estado = estado;
    if (celular_usuario) filtros.celular_usuario = celular_usuario;

    const ordenes = await OrdenEnhanced.listarTodas(
      filtros,
      parseInt(limite) || 100,
      parseInt(offset) || 0
    );

    res.json({
      success: true,
      data: ordenes
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
 * Actualizar estado de orden (admin)
 */
exports.actualizarEstado = async (req, res) => {
  try {
    const { id } = req.params;
    const { estado, notas_admin } = req.body;

    if (!estado) {
      return res.status(400).json({ 
        success: false,
        error: 'Estado es requerido' 
      });
    }

    const estadosValidos = ['pendiente', 'pendiente_pago', 'pagada', 'en_proceso', 'entregada', 'cancelada'];
    if (!estadosValidos.includes(estado)) {
      return res.status(400).json({ 
        success: false,
        error: `Estado inválido. Debe ser uno de: ${estadosValidos.join(', ')}` 
      });
    }

    const orden = await OrdenEnhanced.actualizarEstado(id, estado, notas_admin);

    if (!orden) {
      return res.status(404).json({ 
        success: false,
        error: 'Orden no encontrada' 
      });
    }

    res.json({
      success: true,
      message: 'Estado actualizado correctamente',
      data: orden
    });
  } catch (error) {
    console.error('Error al actualizar estado:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al actualizar estado' 
    });
  }
};

/**
 * Asignar credenciales a un item (admin)
 */
exports.asignarCredenciales = async (req, res) => {
  try {
    const { id_order_item } = req.params;

    const resultado = await OrdenEnhanced.asignarCredenciales(id_order_item);

    res.json({
      success: true,
      message: 'Credenciales asignadas correctamente',
      data: resultado
    });
  } catch (error) {
    console.error('Error al asignar credenciales:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Error al asignar credenciales' 
    });
  }
};

/**
 * Marcar credenciales como entregadas (admin)
 */
exports.marcarEntregada = async (req, res) => {
  try {
    const { id_order_item } = req.params;

    const item = await OrdenEnhanced.marcarCredencialesEntregadas(id_order_item);

    if (!item) {
      return res.status(404).json({ 
        success: false,
        error: 'Item no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Credenciales marcadas como entregadas',
      data: item
    });
  } catch (error) {
    console.error('Error al marcar como entregada:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al actualizar estado de entrega' 
    });
  }
};

/**
 * Obtener estadísticas de órdenes (admin)
 */
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await OrdenEnhanced.obtenerEstadisticas();

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener estadísticas' 
    });
  }
};

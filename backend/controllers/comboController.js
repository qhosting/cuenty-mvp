const Combo = require('../models/Combo');

/**
 * Listar combos activos (público)
 */
exports.listarActivos = async (req, res) => {
  try {
    const combos = await Combo.listarTodos(true);
    
    res.json({
      success: true,
      data: combos
    });
  } catch (error) {
    console.error('Error al listar combos:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener combos' 
    });
  }
};

/**
 * Listar todos los combos (admin)
 */
exports.listarTodos = async (req, res) => {
  try {
    const combos = await Combo.listarTodos(false);
    
    res.json({
      success: true,
      data: combos
    });
  } catch (error) {
    console.error('Error al listar combos:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener combos' 
    });
  }
};

/**
 * Obtener combo por ID
 */
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const combo = await Combo.obtenerPorId(id);

    if (!combo) {
      return res.status(404).json({ 
        success: false,
        error: 'Combo no encontrado' 
      });
    }

    res.json({
      success: true,
      data: combo
    });
  } catch (error) {
    console.error('Error al obtener combo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener combo' 
    });
  }
};

/**
 * Crear nuevo combo (admin)
 */
exports.crear = async (req, res) => {
  try {
    const { nombre, descripcion, precio_total, costo_total, imagen_url, planes } = req.body;

    if (!nombre) {
      return res.status(400).json({ 
        success: false,
        error: 'Nombre del combo requerido' 
      });
    }

    if (!planes || planes.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'El combo debe incluir al menos un plan' 
      });
    }

    // Si no se proporciona precio/costo, calcular automáticamente
    let finalPrecioTotal = precio_total;
    let finalCostoTotal = costo_total;

    if (!precio_total || !costo_total) {
      const totales = await Combo.calcularTotales(planes);
      finalPrecioTotal = finalPrecioTotal || totales.precio_total;
      finalCostoTotal = finalCostoTotal || totales.costo_total;
    }

    const combo = await Combo.crear({
      nombre,
      descripcion,
      precio_total: finalPrecioTotal,
      costo_total: finalCostoTotal,
      imagen_url,
      planes
    });

    res.status(201).json({
      success: true,
      message: 'Combo creado correctamente',
      data: combo
    });
  } catch (error) {
    console.error('Error al crear combo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al crear combo',
      details: error.message
    });
  }
};

/**
 * Actualizar combo (admin)
 */
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const combo = await Combo.actualizar(id, req.body);

    if (!combo) {
      return res.status(404).json({ 
        success: false,
        error: 'Combo no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Combo actualizado correctamente',
      data: combo
    });
  } catch (error) {
    console.error('Error al actualizar combo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al actualizar combo',
      details: error.message
    });
  }
};

/**
 * Eliminar combo (admin) - soft delete
 */
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const combo = await Combo.eliminar(id);

    if (!combo) {
      return res.status(404).json({ 
        success: false,
        error: 'Combo no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Combo desactivado correctamente'
    });
  } catch (error) {
    console.error('Error al eliminar combo:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al eliminar combo' 
    });
  }
};

/**
 * Calcular totales de un combo basado en sus planes
 */
exports.calcularTotales = async (req, res) => {
  try {
    const { planes } = req.body;

    if (!planes || planes.length === 0) {
      return res.status(400).json({ 
        success: false,
        error: 'Debe proporcionar una lista de planes' 
      });
    }

    const totales = await Combo.calcularTotales(planes);

    res.json({
      success: true,
      data: totales
    });
  } catch (error) {
    console.error('Error al calcular totales:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al calcular totales del combo' 
    });
  }
};


const ServicePlan = require('../models/ServicePlan');

/**
 * Listar planes activos (público)
 */
exports.listarActivos = async (req, res) => {
  try {
    const planes = await ServicePlan.listarActivos();
    
    res.json({
      success: true,
      data: planes
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
 * Listar todos los planes (admin)
 */
exports.listarTodos = async (req, res) => {
  try {
    const planes = await ServicePlan.listarTodos();
    
    res.json({
      success: true,
      data: planes
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
 * Obtener plan por ID
 */
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await ServicePlan.obtenerPorId(id);

    if (!plan) {
      return res.status(404).json({ 
        success: false,
        error: 'Plan no encontrado' 
      });
    }

    res.json({
      success: true,
      data: plan
    });
  } catch (error) {
    console.error('Error al obtener plan:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener plan' 
    });
  }
};

/**
 * Crear nuevo plan (admin)
 */
exports.crear = async (req, res) => {
  try {
    const { id_servicio, nombre_plan, duracion_meses, costo, margen_ganancia, descripcion } = req.body;

    if (!id_servicio || !nombre_plan || !duracion_meses || costo === undefined || margen_ganancia === undefined) {
      return res.status(400).json({ 
        success: false,
        error: 'Faltan campos requeridos (id_servicio, nombre_plan, duracion_meses, costo, margen_ganancia)' 
      });
    }

    const plan = await ServicePlan.crear(
      id_servicio,
      nombre_plan,
      duracion_meses,
      costo,
      margen_ganancia,
      descripcion
    );

    res.status(201).json({
      success: true,
      message: 'Plan creado correctamente',
      data: plan
    });
  } catch (error) {
    console.error('Error al crear plan:', error);
    
    if (error.code === '23505') { // Unique violation
      return res.status(400).json({ 
        success: false,
        error: 'Ya existe un plan con esta duración para este servicio' 
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: 'Error al crear plan' 
    });
  }
};

/**
 * Actualizar plan (admin)
 */
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const plan = await ServicePlan.actualizar(id, req.body);

    if (!plan) {
      return res.status(404).json({ 
        success: false,
        error: 'Plan no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Plan actualizado correctamente',
      data: plan
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
 * Eliminar plan (admin)
 */
exports.eliminar = async (req, res) => {
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

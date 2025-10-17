
const Servicio = require('../models/Servicio');
const ServicePlan = require('../models/ServicePlan');

/**
 * Listar servicios activos con planes (público)
 */
exports.listarActivos = async (req, res) => {
  try {
    const servicios = await Servicio.listarTodos(true);
    
    res.json({
      success: true,
      data: servicios
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
 * Listar todos los servicios (admin)
 */
exports.listarTodos = async (req, res) => {
  try {
    const servicios = await Servicio.listarTodos(false);
    
    res.json({
      success: true,
      data: servicios
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
 * Obtener servicio por ID
 */
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.obtenerPorId(id);

    if (!servicio) {
      return res.status(404).json({ 
        success: false,
        error: 'Servicio no encontrado' 
      });
    }

    res.json({
      success: true,
      data: servicio
    });
  } catch (error) {
    console.error('Error al obtener servicio:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener servicio' 
    });
  }
};

/**
 * Crear nuevo servicio (admin)
 */
exports.crear = async (req, res) => {
  try {
    const { nombre, descripcion, logo_url, categoria } = req.body;

    if (!nombre) {
      return res.status(400).json({ 
        success: false,
        error: 'Nombre del servicio requerido' 
      });
    }

    const servicio = await Servicio.crear(nombre, descripcion, logo_url, categoria);

    res.status(201).json({
      success: true,
      message: 'Servicio creado correctamente',
      data: servicio
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
 * Actualizar servicio (admin)
 */
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const servicio = await Servicio.actualizar(id, req.body);

    if (!servicio) {
      return res.status(404).json({ 
        success: false,
        error: 'Servicio no encontrado' 
      });
    }

    res.json({
      success: true,
      message: 'Servicio actualizado correctamente',
      data: servicio
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
 * Eliminar servicio (admin)
 */
exports.eliminar = async (req, res) => {
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

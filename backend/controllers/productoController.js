
const Producto = require('../models/Producto');

/**
 * Listar productos activos (para clientes)
 */
exports.listarActivos = async (req, res) => {
  try {
    const productos = await Producto.listarActivos();
    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error al listar productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

/**
 * Listar todos los productos (admin)
 */
exports.listarTodos = async (req, res) => {
  try {
    const productos = await Producto.listarTodos();
    res.json({
      success: true,
      data: productos
    });
  } catch (error) {
    console.error('Error al listar productos:', error);
    res.status(500).json({ error: 'Error al obtener productos' });
  }
};

/**
 * Obtener producto por ID
 */
exports.obtenerPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.obtenerPorId(id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({
      success: true,
      data: producto
    });
  } catch (error) {
    console.error('Error al obtener producto:', error);
    res.status(500).json({ error: 'Error al obtener producto' });
  }
};

/**
 * Crear producto (admin)
 */
exports.crear = async (req, res) => {
  try {
    const { nombre_servicio, descripcion, precio, duracion_dias } = req.body;

    if (!nombre_servicio || !precio || !duracion_dias) {
      return res.status(400).json({ 
        error: 'nombre_servicio, precio y duracion_dias son requeridos' 
      });
    }

    const producto = await Producto.crear(nombre_servicio, descripcion, precio, duracion_dias);

    res.status(201).json({
      success: true,
      message: 'Producto creado exitosamente',
      data: producto
    });
  } catch (error) {
    console.error('Error al crear producto:', error);
    res.status(500).json({ error: 'Error al crear producto' });
  }
};

/**
 * Actualizar producto (admin)
 */
exports.actualizar = async (req, res) => {
  try {
    const { id } = req.params;
    const datos = req.body;

    const producto = await Producto.actualizar(id, datos);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({
      success: true,
      message: 'Producto actualizado exitosamente',
      data: producto
    });
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    res.status(500).json({ error: 'Error al actualizar producto' });
  }
};

/**
 * Eliminar producto (admin)
 */
exports.eliminar = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.eliminar(id);

    if (!producto) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    res.json({
      success: true,
      message: 'Producto desactivado exitosamente',
      data: producto
    });
  } catch (error) {
    console.error('Error al eliminar producto:', error);
    res.status(500).json({ error: 'Error al eliminar producto' });
  }
};


const ShoppingCart = require('../models/ShoppingCart');

/**
 * Obtener carrito del usuario
 */
exports.obtenerCarrito = async (req, res) => {
  try {
    const celular = req.user.celular;
    const carrito = await ShoppingCart.obtenerCarrito(celular);

    res.json({
      success: true,
      data: carrito
    });
  } catch (error) {
    console.error('Error al obtener carrito:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al obtener carrito' 
    });
  }
};

/**
 * Agregar item al carrito
 */
exports.agregarItem = async (req, res) => {
  try {
    const celular = req.user.celular;
    const { id_plan, cantidad } = req.body;

    if (!id_plan) {
      return res.status(400).json({ 
        success: false,
        error: 'id_plan es requerido' 
      });
    }

    const item = await ShoppingCart.agregarItem(celular, id_plan, cantidad || 1);

    // Obtener carrito actualizado
    const carrito = await ShoppingCart.obtenerCarrito(celular);

    res.json({
      success: true,
      message: 'Item agregado al carrito',
      data: carrito
    });
  } catch (error) {
    console.error('Error al agregar item:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al agregar item al carrito' 
    });
  }
};

/**
 * Actualizar cantidad de item
 */
exports.actualizarCantidad = async (req, res) => {
  try {
    const celular = req.user.celular;
    const { id_plan, cantidad } = req.body;

    if (!id_plan || cantidad === undefined) {
      return res.status(400).json({ 
        success: false,
        error: 'id_plan y cantidad son requeridos' 
      });
    }

    await ShoppingCart.actualizarCantidad(celular, id_plan, cantidad);

    // Obtener carrito actualizado
    const carrito = await ShoppingCart.obtenerCarrito(celular);

    res.json({
      success: true,
      message: 'Cantidad actualizada',
      data: carrito
    });
  } catch (error) {
    console.error('Error al actualizar cantidad:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al actualizar cantidad' 
    });
  }
};

/**
 * Eliminar item del carrito
 */
exports.eliminarItem = async (req, res) => {
  try {
    const celular = req.user.celular;
    const { id_plan } = req.params;

    if (!id_plan) {
      return res.status(400).json({ 
        success: false,
        error: 'id_plan es requerido' 
      });
    }

    await ShoppingCart.eliminarItem(celular, id_plan);

    // Obtener carrito actualizado
    const carrito = await ShoppingCart.obtenerCarrito(celular);

    res.json({
      success: true,
      message: 'Item eliminado del carrito',
      data: carrito
    });
  } catch (error) {
    console.error('Error al eliminar item:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al eliminar item' 
    });
  }
};

/**
 * Vaciar carrito
 */
exports.vaciarCarrito = async (req, res) => {
  try {
    const celular = req.user.celular;
    await ShoppingCart.vaciarCarrito(celular);

    res.json({
      success: true,
      message: 'Carrito vaciado',
      data: {
        items: [],
        total: 0,
        cantidad_items: 0
      }
    });
  } catch (error) {
    console.error('Error al vaciar carrito:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al vaciar carrito' 
    });
  }
};

/**
 * Verificar disponibilidad de items
 */
exports.verificarDisponibilidad = async (req, res) => {
  try {
    const celular = req.user.celular;
    const itemsNoDisponibles = await ShoppingCart.verificarDisponibilidad(celular);

    if (itemsNoDisponibles.length > 0) {
      return res.json({
        success: false,
        disponible: false,
        message: 'Algunos items no tienen stock suficiente',
        items_no_disponibles: itemsNoDisponibles
      });
    }

    res.json({
      success: true,
      disponible: true,
      message: 'Todos los items están disponibles'
    });
  } catch (error) {
    console.error('Error al verificar disponibilidad:', error);
    res.status(500).json({ 
      success: false,
      error: 'Error al verificar disponibilidad' 
    });
  }
};

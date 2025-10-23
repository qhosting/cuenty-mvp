const { PrismaClient } = require('@prisma/client');
const notificationService = require('../services/notificationService');
const renovacionService = require('../services/renovacionService');

const prisma = new PrismaClient();

/**
 * Controlador de Suscripciones
 * Maneja todas las operaciones CRUD y lógica de negocio para suscripciones
 */

/**
 * Obtener todas las suscripciones (con filtros opcionales)
 */
exports.obtenerSuscripciones = async (req, res) => {
  try {
    const { 
      estado, 
      celularUsuario, 
      idPlan,
      page = 1, 
      limit = 10 
    } = req.query;

    // Construir filtros
    const where = {};
    if (estado) where.estado = estado;
    if (celularUsuario) where.celularUsuario = celularUsuario;
    if (idPlan) where.idPlan = parseInt(idPlan);

    // Calcular paginación
    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Obtener suscripciones con paginación
    const [suscripciones, total] = await Promise.all([
      prisma.suscripcion.findMany({
        where,
        skip,
        take,
        orderBy: {
          fechaCreacion: 'desc'
        },
        include: {
          notificaciones: {
            orderBy: {
              fechaCreacion: 'desc'
            },
            take: 5
          }
        }
      }),
      prisma.suscripcion.count({ where })
    ]);

    res.json({
      success: true,
      data: suscripciones,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Error obteniendo suscripciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener suscripciones',
      error: error.message
    });
  }
};

/**
 * Obtener una suscripción por ID
 */
exports.obtenerSuscripcionPorId = async (req, res) => {
  try {
    const { id } = req.params;

    const suscripcion = await prisma.suscripcion.findUnique({
      where: { idSuscripcion: parseInt(id) },
      include: {
        notificaciones: {
          orderBy: {
            fechaCreacion: 'desc'
          }
        }
      }
    });

    if (!suscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Suscripción no encontrada'
      });
    }

    res.json({
      success: true,
      data: suscripcion
    });
  } catch (error) {
    console.error('Error obteniendo suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener suscripción',
      error: error.message
    });
  }
};

/**
 * Crear una nueva suscripción
 */
exports.crearSuscripcion = async (req, res) => {
  try {
    const {
      celularUsuario,
      idPlan,
      idOrden,
      fechaInicio,
      duracionMeses,
      duracionDias,
      renovacionAutomatica,
      notasAdmin
    } = req.body;

    // Validaciones
    if (!celularUsuario || !idPlan) {
      return res.status(400).json({
        success: false,
        message: 'celularUsuario y idPlan son requeridos'
      });
    }

    // Verificar que el plan existe
    const plan = await prisma.servicePlan.findUnique({
      where: { idPlan: parseInt(idPlan) }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        message: 'Plan no encontrado'
      });
    }

    // Calcular fecha de vencimiento
    const inicio = fechaInicio ? new Date(fechaInicio) : new Date();
    const fechaVencimiento = new Date(inicio);
    
    if (duracionDias) {
      fechaVencimiento.setDate(fechaVencimiento.getDate() + parseInt(duracionDias));
    } else if (duracionMeses) {
      fechaVencimiento.setMonth(fechaVencimiento.getMonth() + parseInt(duracionMeses));
    } else {
      // Usar la duración del plan
      if (plan.duracionDias) {
        fechaVencimiento.setDate(fechaVencimiento.getDate() + plan.duracionDias);
      } else {
        fechaVencimiento.setMonth(fechaVencimiento.getMonth() + plan.duracionMeses);
      }
    }

    // Crear la suscripción
    const nuevaSuscripcion = await prisma.suscripcion.create({
      data: {
        celularUsuario,
        idPlan: parseInt(idPlan),
        idOrden: idOrden ? parseInt(idOrden) : null,
        fechaInicio: inicio,
        fechaVencimiento,
        renovacionAutomatica: renovacionAutomatica || false,
        notasAdmin: notasAdmin || null,
        estado: 'activa'
      },
      include: {
        notificaciones: true
      }
    });

    // Crear notificaciones programadas
    await notificationService.crearNotificacionesProgramadas(
      nuevaSuscripcion.idSuscripcion,
      fechaVencimiento,
      celularUsuario
    );

    res.status(201).json({
      success: true,
      message: 'Suscripción creada exitosamente',
      data: nuevaSuscripcion
    });
  } catch (error) {
    console.error('Error creando suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al crear suscripción',
      error: error.message
    });
  }
};

/**
 * Actualizar una suscripción
 */
exports.actualizarSuscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      estado,
      fechaVencimiento,
      renovacionAutomatica,
      notasAdmin
    } = req.body;

    // Verificar que la suscripción existe
    const suscripcionExistente = await prisma.suscripcion.findUnique({
      where: { idSuscripcion: parseInt(id) }
    });

    if (!suscripcionExistente) {
      return res.status(404).json({
        success: false,
        message: 'Suscripción no encontrada'
      });
    }

    // Preparar datos de actualización
    const dataActualizacion = {};
    if (estado) dataActualizacion.estado = estado;
    if (fechaVencimiento) dataActualizacion.fechaVencimiento = new Date(fechaVencimiento);
    if (renovacionAutomatica !== undefined) dataActualizacion.renovacionAutomatica = renovacionAutomatica;
    if (notasAdmin !== undefined) dataActualizacion.notasAdmin = notasAdmin;

    // Si se cancela la suscripción, registrar la fecha
    if (estado === 'cancelada') {
      dataActualizacion.fechaCancelacion = new Date();
    }

    // Actualizar la suscripción
    const suscripcionActualizada = await prisma.suscripcion.update({
      where: { idSuscripcion: parseInt(id) },
      data: dataActualizacion,
      include: {
        notificaciones: true
      }
    });

    // Si se cambió la fecha de vencimiento, actualizar notificaciones
    if (fechaVencimiento) {
      await notificationService.eliminarNotificacionesSuscripcion(parseInt(id));
      await notificationService.crearNotificacionesProgramadas(
        parseInt(id),
        new Date(fechaVencimiento),
        suscripcionExistente.celularUsuario
      );
    }

    res.json({
      success: true,
      message: 'Suscripción actualizada exitosamente',
      data: suscripcionActualizada
    });
  } catch (error) {
    console.error('Error actualizando suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al actualizar suscripción',
      error: error.message
    });
  }
};

/**
 * Eliminar una suscripción
 */
exports.eliminarSuscripcion = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar que la suscripción existe
    const suscripcion = await prisma.suscripcion.findUnique({
      where: { idSuscripcion: parseInt(id) }
    });

    if (!suscripcion) {
      return res.status(404).json({
        success: false,
        message: 'Suscripción no encontrada'
      });
    }

    // Eliminar la suscripción (las notificaciones se eliminan en cascada)
    await prisma.suscripcion.delete({
      where: { idSuscripcion: parseInt(id) }
    });

    res.json({
      success: true,
      message: 'Suscripción eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error eliminando suscripción:', error);
    res.status(500).json({
      success: false,
      message: 'Error al eliminar suscripción',
      error: error.message
    });
  }
};

/**
 * Renovar una suscripción manualmente
 */
exports.renovarSuscripcion = async (req, res) => {
  try {
    const { id } = req.params;

    const resultado = await renovacionService.renovarSuscripcionManual(parseInt(id));

    res.json({
      success: true,
      message: 'Suscripción renovada exitosamente',
      data: resultado.suscripcion
    });
  } catch (error) {
    console.error('Error renovando suscripción:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error al renovar suscripción',
      error: error.message
    });
  }
};

/**
 * Obtener suscripciones de un usuario
 */
exports.obtenerSuscripcionesUsuario = async (req, res) => {
  try {
    const { celular } = req.params;

    const suscripciones = await prisma.suscripcion.findMany({
      where: { celularUsuario: celular },
      orderBy: {
        fechaCreacion: 'desc'
      },
      include: {
        notificaciones: {
          orderBy: {
            fechaCreacion: 'desc'
          },
          take: 3
        }
      }
    });

    res.json({
      success: true,
      data: suscripciones
    });
  } catch (error) {
    console.error('Error obteniendo suscripciones del usuario:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener suscripciones del usuario',
      error: error.message
    });
  }
};

/**
 * Obtener estadísticas de suscripciones
 */
exports.obtenerEstadisticas = async (req, res) => {
  try {
    const estadisticas = await renovacionService.obtenerEstadisticasRenovacion();

    res.json({
      success: true,
      data: estadisticas
    });
  } catch (error) {
    console.error('Error obteniendo estadísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Error al obtener estadísticas',
      error: error.message
    });
  }
};

/**
 * Verificar suscripciones vencidas (endpoint manual para admin)
 */
exports.verificarVencimientos = async (req, res) => {
  try {
    const resultado = await renovacionService.verificarSuscripcionesVencidas();

    res.json({
      success: true,
      message: 'Verificación de vencimientos completada',
      data: resultado
    });
  } catch (error) {
    console.error('Error verificando vencimientos:', error);
    res.status(500).json({
      success: false,
      message: 'Error al verificar vencimientos',
      error: error.message
    });
  }
};

/**
 * Procesar renovaciones automáticas (endpoint manual para admin)
 */
exports.procesarRenovacionesAutomaticas = async (req, res) => {
  try {
    const resultado = await renovacionService.procesarRenovacionesAutomaticas();

    res.json({
      success: true,
      message: 'Procesamiento de renovaciones completado',
      data: resultado
    });
  } catch (error) {
    console.error('Error procesando renovaciones:', error);
    res.status(500).json({
      success: false,
      message: 'Error al procesar renovaciones',
      error: error.message
    });
  }
};

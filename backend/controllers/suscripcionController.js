/**
 * Controlador de Suscripciones
 * Maneja todas las operaciones CRUD de suscripciones
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const renovacionService = require('../services/renovacionService');
const notificationService = require('../services/notificationService');

/**
 * Crear nueva suscripción (generalmente desde una orden completada)
 */
exports.crearSuscripcion = async (req, res) => {
  try {
    const { clienteId, servicioId, planId, ordenId, cuentaId, renovacionAutomatica, metodoPago } = req.body;

    // Validar campos requeridos
    if (!clienteId || !servicioId || !planId) {
      return res.status(400).json({
        success: false,
        error: 'clienteId, servicioId y planId son requeridos'
      });
    }

    // Obtener plan para calcular fecha de renovación
    const plan = await prisma.servicePlan.findUnique({
      where: { idPlan: planId }
    });

    if (!plan) {
      return res.status(404).json({
        success: false,
        error: 'Plan no encontrado'
      });
    }

    // Calcular fecha de próxima renovación
    const fechaProximaRenovacion = renovacionService.calcularProximaRenovacion(plan);

    // Crear suscripción
    const suscripcion = await prisma.suscripcion.create({
      data: {
        clienteId,
        servicioId,
        planId,
        ordenId,
        cuentaId,
        renovacionAutomatica: renovacionAutomatica || false,
        metodoPago,
        fechaProximaRenovacion,
        estado: 'activa'
      },
      include: {
        cliente: true,
        servicio: true,
        plan: true,
        cuenta: true
      }
    });

    console.log(`✅ Suscripción ${suscripcion.id} creada para cliente ${clienteId}`);

    res.status(201).json({
      success: true,
      message: 'Suscripción creada correctamente',
      data: suscripcion
    });

  } catch (error) {
    console.error('❌ Error al crear suscripción:', error);
    res.status(500).json({
      success: false,
      error: 'Error al crear suscripción'
    });
  }
};

/**
 * Listar todas las suscripciones (Admin)
 */
exports.listarSuscripciones = async (req, res) => {
  try {
    const { estado, clienteId, servicioId, limit = 100, offset = 0 } = req.query;

    // Construir filtros
    const where = {};
    if (estado) where.estado = estado;
    if (clienteId) where.clienteId = parseInt(clienteId);
    if (servicioId) where.servicioId = parseInt(servicioId);

    // Obtener suscripciones
    const suscripciones = await prisma.suscripcion.findMany({
      where,
      include: {
        cliente: {
          select: {
            id: true,
            nombre: true,
            apellido: true,
            email: true,
            whatsapp: true
          }
        },
        servicio: {
          select: {
            idServicio: true,
            nombre: true,
            logoUrl: true
          }
        },
        plan: {
          select: {
            idPlan: true,
            nombrePlan: true,
            duracionMeses: true,
            duracionDias: true,
            precioVenta: true
          }
        }
      },
      orderBy: {
        fechaProximaRenovacion: 'asc'
      },
      take: parseInt(limit),
      skip: parseInt(offset)
    });

    // Calcular días restantes para cada suscripción
    const suscripcionesConDias = suscripciones.map(sub => ({
      ...sub,
      diasRestantes: renovacionService.calcularDiasRestantes(sub.fechaProximaRenovacion)
    }));

    res.json({
      success: true,
      data: suscripcionesConDias,
      total: suscripcionesConDias.length
    });

  } catch (error) {
    console.error('❌ Error al listar suscripciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener suscripciones'
    });
  }
};

/**
 * Obtener detalle de una suscripción
 */
exports.obtenerSuscripcion = async (req, res) => {
  try {
    const { id } = req.params;

    const suscripcion = await prisma.suscripcion.findUnique({
      where: { id: parseInt(id) },
      include: {
        cliente: true,
        servicio: true,
        plan: true,
        cuenta: true,
        orden: true,
        notificaciones: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });

    if (!suscripcion) {
      return res.status(404).json({
        success: false,
        error: 'Suscripción no encontrada'
      });
    }

    // Calcular días restantes
    const diasRestantes = renovacionService.calcularDiasRestantes(suscripcion.fechaProximaRenovacion);

    res.json({
      success: true,
      data: {
        ...suscripcion,
        diasRestantes
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener suscripción:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener suscripción'
    });
  }
};

/**
 * Pausar suscripción (Admin)
 */
exports.pausarSuscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const { notasAdmin } = req.body;

    const suscripcion = await prisma.suscripcion.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'pausada',
        notasAdmin: notasAdmin || 'Pausada por administrador'
      },
      include: {
        cliente: true,
        servicio: true,
        plan: true
      }
    });

    console.log(`⏸️ Suscripción ${id} pausada`);

    res.json({
      success: true,
      message: 'Suscripción pausada correctamente',
      data: suscripcion
    });

  } catch (error) {
    console.error('❌ Error al pausar suscripción:', error);
    res.status(500).json({
      success: false,
      error: 'Error al pausar suscripción'
    });
  }
};

/**
 * Reanudar suscripción (Admin)
 */
exports.reanudarSuscripcion = async (req, res) => {
  try {
    const { id } = req.params;

    const suscripcion = await prisma.suscripcion.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'activa'
      },
      include: {
        cliente: true,
        servicio: true,
        plan: true
      }
    });

    console.log(`▶️ Suscripción ${id} reanudada`);

    res.json({
      success: true,
      message: 'Suscripción reanudada correctamente',
      data: suscripcion
    });

  } catch (error) {
    console.error('❌ Error al reanudar suscripción:', error);
    res.status(500).json({
      success: false,
      error: 'Error al reanudar suscripción'
    });
  }
};

/**
 * Cancelar suscripción
 */
exports.cancelarSuscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivoCancelacion } = req.body;

    const suscripcion = await prisma.suscripcion.update({
      where: { id: parseInt(id) },
      data: {
        estado: 'cancelada',
        fechaCancelacion: new Date(),
        motivoCancelacion
      },
      include: {
        cliente: true,
        servicio: true,
        plan: true
      }
    });

    console.log(`❌ Suscripción ${id} cancelada`);

    res.json({
      success: true,
      message: 'Suscripción cancelada correctamente',
      data: suscripcion
    });

  } catch (error) {
    console.error('❌ Error al cancelar suscripción:', error);
    res.status(500).json({
      success: false,
      error: 'Error al cancelar suscripción'
    });
  }
};

/**
 * Renovar suscripción manualmente
 */
exports.renovarSuscripcion = async (req, res) => {
  try {
    const { id } = req.params;
    const { ordenId } = req.body;

    const suscripcion = await renovacionService.renovarSuscripcionManual(
      parseInt(id),
      ordenId ? parseInt(ordenId) : null
    );

    res.json({
      success: true,
      message: 'Suscripción renovada correctamente',
      data: suscripcion
    });

  } catch (error) {
    console.error('❌ Error al renovar suscripción:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Error al renovar suscripción'
    });
  }
};

/**
 * Verificar vencimientos y enviar notificaciones
 */
exports.verificarVencimientos = async (req, res) => {
  try {
    console.log('🔍 Iniciando verificación de vencimientos...');

    const resultados = {
      verificadas: 0,
      notificaciones7dias: 0,
      notificaciones3dias: 0,
      notificaciones1dia: 0,
      notificacionesVencidas: 0,
      errores: []
    };

    // Verificar suscripciones vencidas
    const resultadoVencidas = await renovacionService.verificarSuscripcionesVencidas();
    console.log(`✅ Verificadas ${resultadoVencidas.total} suscripciones vencidas`);

    // Obtener suscripciones que vencen en 7 días
    const suscripciones7dias = await renovacionService.obtenerSuscripcionesProximasVencer(7);
    for (const sub of suscripciones7dias) {
      const diasRestantes = renovacionService.calcularDiasRestantes(sub.fechaProximaRenovacion);
      if (diasRestantes === 7) {
        try {
          const yaEnviada = await notificationService.verificarNotificacionEnviada(sub.id, 'siete_dias');
          if (!yaEnviada) {
            await notificationService.enviarNotificacionVencimiento(sub.id, 'siete_dias');
            resultados.notificaciones7dias++;
          }
        } catch (error) {
          console.error(`Error al enviar notificación 7 días para suscripción ${sub.id}:`, error.message);
          resultados.errores.push({ suscripcionId: sub.id, tipo: '7_dias', error: error.message });
        }
      }
    }

    // Obtener suscripciones que vencen en 3 días
    const suscripciones3dias = await renovacionService.obtenerSuscripcionesProximasVencer(3);
    for (const sub of suscripciones3dias) {
      const diasRestantes = renovacionService.calcularDiasRestantes(sub.fechaProximaRenovacion);
      if (diasRestantes === 3) {
        try {
          const yaEnviada = await notificationService.verificarNotificacionEnviada(sub.id, 'tres_dias');
          if (!yaEnviada) {
            await notificationService.enviarNotificacionVencimiento(sub.id, 'tres_dias');
            resultados.notificaciones3dias++;
          }
        } catch (error) {
          console.error(`Error al enviar notificación 3 días para suscripción ${sub.id}:`, error.message);
          resultados.errores.push({ suscripcionId: sub.id, tipo: '3_dias', error: error.message });
        }
      }
    }

    // Obtener suscripciones que vencen en 1 día
    const suscripciones1dia = await renovacionService.obtenerSuscripcionesProximasVencer(1);
    for (const sub of suscripciones1dia) {
      const diasRestantes = renovacionService.calcularDiasRestantes(sub.fechaProximaRenovacion);
      if (diasRestantes === 1) {
        try {
          const yaEnviada = await notificationService.verificarNotificacionEnviada(sub.id, 'un_dia');
          if (!yaEnviada) {
            await notificationService.enviarNotificacionVencimiento(sub.id, 'un_dia');
            resultados.notificaciones1dia++;
          }
        } catch (error) {
          console.error(`Error al enviar notificación 1 día para suscripción ${sub.id}:`, error.message);
          resultados.errores.push({ suscripcionId: sub.id, tipo: '1_dia', error: error.message });
        }
      }
    }

    // Enviar notificaciones de vencimiento para las que ya vencieron
    const suscripcionesVencidas = await prisma.suscripcion.findMany({
      where: {
        estado: 'vencida'
      },
      include: {
        cliente: true,
        servicio: true,
        plan: true
      }
    });

    for (const sub of suscripcionesVencidas) {
      try {
        const yaEnviada = await notificationService.verificarNotificacionEnviada(sub.id, 'vencido');
        if (!yaEnviada) {
          await notificationService.enviarNotificacionVencimiento(sub.id, 'vencido');
          resultados.notificacionesVencidas++;
        }
      } catch (error) {
        console.error(`Error al enviar notificación vencida para suscripción ${sub.id}:`, error.message);
        resultados.errores.push({ suscripcionId: sub.id, tipo: 'vencido', error: error.message });
      }
    }

    resultados.verificadas = resultadoVencidas.total;

    console.log('✅ Verificación de vencimientos completada:', resultados);

    res.json({
      success: true,
      message: 'Verificación de vencimientos completada',
      data: resultados
    });

  } catch (error) {
    console.error('❌ Error al verificar vencimientos:', error);
    res.status(500).json({
      success: false,
      error: 'Error al verificar vencimientos'
    });
  }
};

/**
 * Listar suscripciones de un cliente específico
 */
exports.listarMisSuscripciones = async (req, res) => {
  try {
    const clienteId = req.user.clienteId;

    if (!clienteId) {
      return res.status(401).json({
        success: false,
        error: 'Cliente no autenticado'
      });
    }

    const suscripciones = await prisma.suscripcion.findMany({
      where: {
        clienteId
      },
      include: {
        servicio: {
          select: {
            idServicio: true,
            nombre: true,
            logoUrl: true
          }
        },
        plan: {
          select: {
            idPlan: true,
            nombrePlan: true,
            duracionMeses: true,
            duracionDias: true,
            precioVenta: true
          }
        },
        cuenta: {
          select: {
            idCuenta: true,
            perfil: true
          }
        }
      },
      orderBy: {
        fechaProximaRenovacion: 'asc'
      }
    });

    // Calcular días restantes para cada suscripción
    const suscripcionesConDias = suscripciones.map(sub => ({
      ...sub,
      diasRestantes: renovacionService.calcularDiasRestantes(sub.fechaProximaRenovacion)
    }));

    res.json({
      success: true,
      data: suscripcionesConDias
    });

  } catch (error) {
    console.error('❌ Error al listar mis suscripciones:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener suscripciones'
    });
  }
};

/**
 * Actualizar configuración de una suscripción (cliente)
 */
exports.actualizarConfiguracion = async (req, res) => {
  try {
    const { id } = req.params;
    const clienteId = req.user.clienteId;
    const { renovacionAutomatica } = req.body;

    // Verificar que la suscripción pertenezca al cliente
    const suscripcionExistente = await prisma.suscripcion.findUnique({
      where: { id: parseInt(id) }
    });

    if (!suscripcionExistente || suscripcionExistente.clienteId !== clienteId) {
      return res.status(403).json({
        success: false,
        error: 'No tienes permiso para modificar esta suscripción'
      });
    }

    // Actualizar configuración
    const suscripcion = await prisma.suscripcion.update({
      where: { id: parseInt(id) },
      data: {
        renovacionAutomatica: renovacionAutomatica !== undefined ? renovacionAutomatica : undefined
      }
    });

    res.json({
      success: true,
      message: 'Configuración actualizada correctamente',
      data: suscripcion
    });

  } catch (error) {
    console.error('❌ Error al actualizar configuración:', error);
    res.status(500).json({
      success: false,
      error: 'Error al actualizar configuración'
    });
  }
};

/**
 * Obtener estadísticas de suscripciones (Admin)
 */
exports.obtenerEstadisticas = async (req, res) => {
  try {
    // Total de suscripciones por estado
    const activas = await prisma.suscripcion.count({ where: { estado: 'activa' } });
    const pausadas = await prisma.suscripcion.count({ where: { estado: 'pausada' } });
    const canceladas = await prisma.suscripcion.count({ where: { estado: 'cancelada' } });
    const vencidas = await prisma.suscripcion.count({ where: { estado: 'vencida' } });

    // Estadísticas de renovaciones
    const estadisticasRenovaciones = await renovacionService.obtenerEstadisticasRenovaciones();

    res.json({
      success: true,
      data: {
        total: activas + pausadas + canceladas + vencidas,
        activas,
        pausadas,
        canceladas,
        vencidas,
        renovaciones: estadisticasRenovaciones
      }
    });

  } catch (error) {
    console.error('❌ Error al obtener estadísticas:', error);
    res.status(500).json({
      success: false,
      error: 'Error al obtener estadísticas'
    });
  }
};

module.exports = exports;

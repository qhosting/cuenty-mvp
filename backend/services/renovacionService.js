/**
 * Servicio de Renovaciones
 * Maneja la lógica de renovación de suscripciones, verificación de vencimientos
 * y cálculo de próximas fechas de renovación
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Calcular próxima fecha de renovación según el plan
 */
function calcularProximaRenovacion(plan) {
  const ahora = new Date();
  
  // Si el plan tiene duración en días, usar eso
  if (plan.duracionDias) {
    const proximaFecha = new Date(ahora);
    proximaFecha.setDate(proximaFecha.getDate() + plan.duracionDias);
    return proximaFecha;
  }
  
  // Si no, usar duración en meses
  const proximaFecha = new Date(ahora);
  proximaFecha.setMonth(proximaFecha.getMonth() + (plan.duracionMeses || 1));
  return proximaFecha;
}

/**
 * Verificar suscripciones vencidas y actualizar su estado
 */
async function verificarSuscripcionesVencidas() {
  try {
    const ahora = new Date();

    // Buscar suscripciones activas que ya vencieron
    const suscripcionesVencidas = await prisma.suscripcion.findMany({
      where: {
        estado: 'activa',
        fechaProximaRenovacion: {
          lte: ahora
        }
      },
      include: {
        cliente: true,
        servicio: true,
        plan: true
      }
    });

    console.log(`🔍 Verificando ${suscripcionesVencidas.length} suscripciones vencidas...`);

    let actualizadas = 0;
    for (const suscripcion of suscripcionesVencidas) {
      try {
        // Si tiene renovación automática, intentar renovar
        if (suscripcion.renovacionAutomatica) {
          await procesarRenovacionAutomatica(suscripcion.id);
          console.log(`✅ Suscripción ${suscripcion.id} renovada automáticamente`);
        } else {
          // Si no tiene renovación automática, marcar como vencida
          await prisma.suscripcion.update({
            where: { id: suscripcion.id },
            data: { estado: 'vencida' }
          });
          console.log(`⏰ Suscripción ${suscripcion.id} marcada como vencida`);
          actualizadas++;
        }
      } catch (error) {
        console.error(`❌ Error al procesar suscripción ${suscripcion.id}:`, error.message);
      }
    }

    return {
      total: suscripcionesVencidas.length,
      actualizadas
    };

  } catch (error) {
    console.error('❌ Error al verificar suscripciones vencidas:', error);
    throw error;
  }
}

/**
 * Procesar renovación automática de una suscripción
 */
async function procesarRenovacionAutomatica(suscripcionId) {
  try {
    // Obtener suscripción con relaciones
    const suscripcion = await prisma.suscripcion.findUnique({
      where: { id: suscripcionId },
      include: {
        cliente: true,
        servicio: true,
        plan: true,
        cuenta: true
      }
    });

    if (!suscripcion) {
      throw new Error('Suscripción no encontrada');
    }

    // Validar que tenga renovación automática
    if (!suscripcion.renovacionAutomatica) {
      throw new Error('La suscripción no tiene renovación automática activada');
    }

    // Calcular nueva fecha de renovación
    const nuevaFechaRenovacion = calcularProximaRenovacion(suscripcion.plan);

    // Actualizar suscripción
    const suscripcionActualizada = await prisma.suscripcion.update({
      where: { id: suscripcionId },
      data: {
        fechaProximaRenovacion: nuevaFechaRenovacion,
        fechaUltimaRenovacion: new Date(),
        estado: 'activa'
      }
    });

    console.log(`✅ Renovación automática procesada para suscripción ${suscripcionId}`);
    
    // TODO: Si se requiere, aquí se podría:
    // - Generar un cargo automático
    // - Crear una nueva orden
    // - Enviar notificación de renovación exitosa
    
    return suscripcionActualizada;

  } catch (error) {
    console.error('❌ Error al procesar renovación automática:', error);
    throw error;
  }
}

/**
 * Renovar suscripción manualmente (desde una orden pagada)
 */
async function renovarSuscripcionManual(suscripcionId, ordenId = null) {
  try {
    // Obtener suscripción con relaciones
    const suscripcion = await prisma.suscripcion.findUnique({
      where: { id: suscripcionId },
      include: {
        cliente: true,
        servicio: true,
        plan: true
      }
    });

    if (!suscripcion) {
      throw new Error('Suscripción no encontrada');
    }

    // Calcular nueva fecha de renovación
    // Si la suscripción aún está activa, sumar a la fecha actual de renovación
    // Si ya venció, sumar desde ahora
    let baseFecha = new Date();
    if (suscripcion.estado === 'activa' && suscripcion.fechaProximaRenovacion > baseFecha) {
      baseFecha = new Date(suscripcion.fechaProximaRenovacion);
    }

    const duracionDias = suscripcion.plan.duracionDias || (suscripcion.plan.duracionMeses * 30);
    const nuevaFechaRenovacion = new Date(baseFecha);
    nuevaFechaRenovacion.setDate(nuevaFechaRenovacion.getDate() + duracionDias);

    // Actualizar suscripción
    const dataActualizacion = {
      fechaProximaRenovacion: nuevaFechaRenovacion,
      fechaUltimaRenovacion: new Date(),
      estado: 'activa'
    };

    if (ordenId) {
      dataActualizacion.ordenId = ordenId;
    }

    const suscripcionActualizada = await prisma.suscripcion.update({
      where: { id: suscripcionId },
      data: dataActualizacion
    });

    console.log(`✅ Suscripción ${suscripcionId} renovada manualmente`);
    
    return suscripcionActualizada;

  } catch (error) {
    console.error('❌ Error al renovar suscripción manual:', error);
    throw error;
  }
}

/**
 * Obtener suscripciones próximas a vencer en los próximos N días
 */
async function obtenerSuscripcionesProximasVencer(dias) {
  try {
    const ahora = new Date();
    const fechaLimite = new Date(ahora);
    fechaLimite.setDate(fechaLimite.getDate() + dias);

    const suscripciones = await prisma.suscripcion.findMany({
      where: {
        estado: 'activa',
        fechaProximaRenovacion: {
          gte: ahora,
          lte: fechaLimite
        }
      },
      include: {
        cliente: true,
        servicio: true,
        plan: true
      },
      orderBy: {
        fechaProximaRenovacion: 'asc'
      }
    });

    return suscripciones;

  } catch (error) {
    console.error('❌ Error al obtener suscripciones próximas a vencer:', error);
    throw error;
  }
}

/**
 * Calcular días restantes hasta el vencimiento
 */
function calcularDiasRestantes(fechaVencimiento) {
  const ahora = new Date();
  const vencimiento = new Date(fechaVencimiento);
  const diferencia = vencimiento - ahora;
  const dias = Math.ceil(diferencia / (1000 * 60 * 60 * 24));
  return dias;
}

/**
 * Obtener estadísticas de renovaciones
 */
async function obtenerEstadisticasRenovaciones() {
  try {
    const ahora = new Date();
    const inicioMes = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
    const finMes = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);

    // Suscripciones renovadas este mes
    const renovacionesMes = await prisma.suscripcion.count({
      where: {
        fechaUltimaRenovacion: {
          gte: inicioMes,
          lte: finMes
        }
      }
    });

    // Suscripciones que vencen este mes
    const vencenMes = await prisma.suscripcion.count({
      where: {
        estado: 'activa',
        fechaProximaRenovacion: {
          gte: inicioMes,
          lte: finMes
        }
      }
    });

    // Próximas a vencer (7 días)
    const proximasVencer7dias = await obtenerSuscripcionesProximasVencer(7);
    
    // Próximas a vencer (3 días)
    const proximasVencer3dias = await obtenerSuscripcionesProximasVencer(3);

    // Próximas a vencer (1 día)
    const proximasVencer1dia = await obtenerSuscripcionesProximasVencer(1);

    return {
      renovacionesMes,
      vencenMes,
      proximasVencer7dias: proximasVencer7dias.length,
      proximasVencer3dias: proximasVencer3dias.length,
      proximasVencer1dia: proximasVencer1dia.length
    };

  } catch (error) {
    console.error('❌ Error al obtener estadísticas de renovaciones:', error);
    throw error;
  }
}

module.exports = {
  calcularProximaRenovacion,
  verificarSuscripcionesVencidas,
  procesarRenovacionAutomatica,
  renovarSuscripcionManual,
  obtenerSuscripcionesProximasVencer,
  calcularDiasRestantes,
  obtenerEstadisticasRenovaciones
};

const { PrismaClient } = require('@prisma/client');
const notificationService = require('./notificationService');

const prisma = new PrismaClient();

/**
 * Servicio de Renovación para gestionar la renovación automática de suscripciones
 */
class RenovacionService {
  /**
   * Procesar renovaciones automáticas
   * Busca suscripciones que están próximas a vencer y tienen renovación automática activada
   */
  async procesarRenovacionesAutomaticas() {
    try {
      const now = new Date();
      const proximaFecha = new Date();
      proximaFecha.setDate(proximaFecha.getDate() + 1); // Renovar 1 día antes

      // Buscar suscripciones que necesitan renovación
      const suscripcionesPorRenovar = await prisma.suscripcion.findMany({
        where: {
          estado: 'activa',
          renovacionAutomatica: true,
          fechaVencimiento: {
            gte: now,
            lte: proximaFecha
          }
        }
      });

      const resultados = [];

      for (const suscripcion of suscripcionesPorRenovar) {
        try {
          // Obtener información del plan
          const plan = await prisma.servicePlan.findUnique({
            where: { idPlan: suscripcion.idPlan }
          });

          if (!plan) {
            resultados.push({
              idSuscripcion: suscripcion.idSuscripcion,
              success: false,
              error: 'Plan no encontrado'
            });
            continue;
          }

          // Calcular nueva fecha de vencimiento
          const nuevaFechaVencimiento = new Date(suscripcion.fechaVencimiento);
          
          if (plan.duracionDias) {
            nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + plan.duracionDias);
          } else {
            nuevaFechaVencimiento.setMonth(nuevaFechaVencimiento.getMonth() + plan.duracionMeses);
          }

          // Actualizar la suscripción
          const suscripcionActualizada = await prisma.suscripcion.update({
            where: { idSuscripcion: suscripcion.idSuscripcion },
            data: {
              fechaVencimiento: nuevaFechaVencimiento,
              fechaActualizacion: new Date()
            }
          });

          // Eliminar notificaciones antiguas
          await notificationService.eliminarNotificacionesSuscripcion(suscripcion.idSuscripcion);

          // Crear nuevas notificaciones
          await notificationService.crearNotificacionesProgramadas(
            suscripcion.idSuscripcion,
            nuevaFechaVencimiento,
            suscripcion.celularUsuario
          );

          resultados.push({
            idSuscripcion: suscripcion.idSuscripcion,
            success: true,
            nuevaFechaVencimiento
          });
        } catch (error) {
          console.error(`Error renovando suscripción ${suscripcion.idSuscripcion}:`, error);
          resultados.push({
            idSuscripcion: suscripcion.idSuscripcion,
            success: false,
            error: error.message
          });
        }
      }

      return {
        success: true,
        totalProcesadas: suscripcionesPorRenovar.length,
        renovacionesExitosas: resultados.filter(r => r.success).length,
        renovacionesFallidas: resultados.filter(r => !r.success).length,
        detalles: resultados
      };
    } catch (error) {
      console.error('Error procesando renovaciones automáticas:', error);
      throw error;
    }
  }

  /**
   * Renovar una suscripción manualmente
   * @param {number} idSuscripcion - ID de la suscripción a renovar
   */
  async renovarSuscripcionManual(idSuscripcion) {
    try {
      // Obtener la suscripción
      const suscripcion = await prisma.suscripcion.findUnique({
        where: { idSuscripcion }
      });

      if (!suscripcion) {
        throw new Error('Suscripción no encontrada');
      }

      if (suscripcion.estado === 'cancelada') {
        throw new Error('No se puede renovar una suscripción cancelada');
      }

      // Obtener información del plan
      const plan = await prisma.servicePlan.findUnique({
        where: { idPlan: suscripcion.idPlan }
      });

      if (!plan) {
        throw new Error('Plan no encontrado');
      }

      // Calcular nueva fecha de vencimiento desde la fecha actual o la de vencimiento, lo que sea mayor
      const fechaBase = suscripcion.fechaVencimiento > new Date() 
        ? suscripcion.fechaVencimiento 
        : new Date();
      
      const nuevaFechaVencimiento = new Date(fechaBase);
      
      if (plan.duracionDias) {
        nuevaFechaVencimiento.setDate(nuevaFechaVencimiento.getDate() + plan.duracionDias);
      } else {
        nuevaFechaVencimiento.setMonth(nuevaFechaVencimiento.getMonth() + plan.duracionMeses);
      }

      // Actualizar la suscripción
      const suscripcionActualizada = await prisma.suscripcion.update({
        where: { idSuscripcion },
        data: {
          estado: 'activa',
          fechaVencimiento: nuevaFechaVencimiento,
          fechaActualizacion: new Date()
        }
      });

      // Eliminar notificaciones antiguas
      await notificationService.eliminarNotificacionesSuscripcion(idSuscripcion);

      // Crear nuevas notificaciones
      await notificationService.crearNotificacionesProgramadas(
        idSuscripcion,
        nuevaFechaVencimiento,
        suscripcion.celularUsuario
      );

      return {
        success: true,
        suscripcion: suscripcionActualizada
      };
    } catch (error) {
      console.error('Error renovando suscripción manual:', error);
      throw error;
    }
  }

  /**
   * Verificar y actualizar suscripciones vencidas
   */
  async verificarSuscripcionesVencidas() {
    try {
      const now = new Date();

      // Buscar suscripciones activas que ya vencieron
      const suscripcionesVencidas = await prisma.suscripcion.updateMany({
        where: {
          estado: 'activa',
          fechaVencimiento: {
            lt: now
          }
        },
        data: {
          estado: 'vencida'
        }
      });

      return {
        success: true,
        suscripcionesActualizadas: suscripcionesVencidas.count
      };
    } catch (error) {
      console.error('Error verificando suscripciones vencidas:', error);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de renovación
   */
  async obtenerEstadisticasRenovacion() {
    try {
      const now = new Date();
      const treintaDiasAtras = new Date();
      treintaDiasAtras.setDate(treintaDiasAtras.getDate() - 30);

      const [
        totalActivas,
        totalVencidas,
        totalCanceladas,
        conRenovacionAutomatica,
        proximasVencer
      ] = await Promise.all([
        prisma.suscripcion.count({ where: { estado: 'activa' } }),
        prisma.suscripcion.count({ where: { estado: 'vencida' } }),
        prisma.suscripcion.count({ where: { estado: 'cancelada' } }),
        prisma.suscripcion.count({ 
          where: { 
            estado: 'activa', 
            renovacionAutomatica: true 
          } 
        }),
        prisma.suscripcion.count({
          where: {
            estado: 'activa',
            fechaVencimiento: {
              gte: now,
              lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
            }
          }
        })
      ]);

      return {
        totalActivas,
        totalVencidas,
        totalCanceladas,
        conRenovacionAutomatica,
        proximasVencer,
        tasaRenovacionAutomatica: totalActivas > 0 
          ? ((conRenovacionAutomatica / totalActivas) * 100).toFixed(2) 
          : 0
      };
    } catch (error) {
      console.error('Error obteniendo estadísticas de renovación:', error);
      throw error;
    }
  }
}

module.exports = new RenovacionService();

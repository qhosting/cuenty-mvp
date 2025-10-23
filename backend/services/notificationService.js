const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Servicio de Notificaciones para gestionar alertas de vencimiento de suscripciones
 */
class NotificationService {
  /**
   * Crear notificaciones programadas para una suscripción
   * @param {number} idSuscripcion - ID de la suscripción
   * @param {Date} fechaVencimiento - Fecha de vencimiento de la suscripción
   * @param {string} celularUsuario - Celular del usuario
   */
  async crearNotificacionesProgramadas(idSuscripcion, fechaVencimiento, celularUsuario) {
    try {
      const notificaciones = [];
      const now = new Date();

      // Calcular fechas de notificación
      const fecha7Dias = new Date(fechaVencimiento);
      fecha7Dias.setDate(fecha7Dias.getDate() - 7);

      const fecha3Dias = new Date(fechaVencimiento);
      fecha3Dias.setDate(fecha3Dias.getDate() - 3);

      const fecha1Dia = new Date(fechaVencimiento);
      fecha1Dia.setDate(fecha1Dia.getDate() - 1);

      // Solo crear notificaciones para fechas futuras
      if (fecha7Dias > now) {
        notificaciones.push({
          idSuscripcion,
          tipoNotificacion: 'previo_7_dias',
          metodoComunicacion: 'whatsapp',
          mensaje: `Tu suscripción vence en 7 días. Renueva antes del ${fechaVencimiento.toLocaleDateString()}`
        });
      }

      if (fecha3Dias > now) {
        notificaciones.push({
          idSuscripcion,
          tipoNotificacion: 'previo_3_dias',
          metodoComunicacion: 'whatsapp',
          mensaje: `Tu suscripción vence en 3 días. Renueva antes del ${fechaVencimiento.toLocaleDateString()}`
        });
      }

      if (fecha1Dia > now) {
        notificaciones.push({
          idSuscripcion,
          tipoNotificacion: 'previo_1_dia',
          metodoComunicacion: 'whatsapp',
          mensaje: `¡Atención! Tu suscripción vence mañana. Renueva para continuar disfrutando del servicio`
        });
      }

      // Notificación de vencimiento
      notificaciones.push({
        idSuscripcion,
        tipoNotificacion: 'vencimiento',
        metodoComunicacion: 'whatsapp',
        mensaje: 'Tu suscripción ha vencido. Renueva ahora para recuperar el acceso'
      });

      // Crear las notificaciones en la base de datos
      if (notificaciones.length > 0) {
        await prisma.notificacionVencimiento.createMany({
          data: notificaciones
        });
      }

      return { success: true, count: notificaciones.length };
    } catch (error) {
      console.error('Error creando notificaciones programadas:', error);
      throw error;
    }
  }

  /**
   * Verificar y enviar notificaciones pendientes
   */
  async verificarYEnviarNotificaciones() {
    try {
      const now = new Date();
      
      // Obtener suscripciones activas próximas a vencer
      const suscripcionesProximasVencer = await prisma.suscripcion.findMany({
        where: {
          estado: 'activa',
          fechaVencimiento: {
            gte: now,
            lte: new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000) // Próximos 7 días
          }
        },
        include: {
          notificaciones: {
            where: {
              enviada: false
            }
          }
        }
      });

      let notificacionesEnviadas = 0;

      for (const suscripcion of suscripcionesProximasVencer) {
        const diasRestantes = Math.ceil(
          (suscripcion.fechaVencimiento - now) / (1000 * 60 * 60 * 24)
        );

        // Determinar qué tipo de notificación enviar
        let tipoNotificacion = null;
        if (diasRestantes === 7) tipoNotificacion = 'previo_7_dias';
        else if (diasRestantes === 3) tipoNotificacion = 'previo_3_dias';
        else if (diasRestantes === 1) tipoNotificacion = 'previo_1_dia';

        if (tipoNotificacion) {
          const notificacionPendiente = suscripcion.notificaciones.find(
            n => n.tipoNotificacion === tipoNotificacion && !n.enviada
          );

          if (notificacionPendiente) {
            // Aquí se implementaría el envío real (WhatsApp, Email, etc.)
            // Por ahora solo marcamos como enviada
            await this.marcarNotificacionComoEnviada(notificacionPendiente.idNotificacion);
            notificacionesEnviadas++;
          }
        }
      }

      // Verificar suscripciones vencidas
      const suscripcionesVencidas = await prisma.suscripcion.findMany({
        where: {
          estado: 'activa',
          fechaVencimiento: {
            lt: now
          }
        },
        include: {
          notificaciones: {
            where: {
              tipoNotificacion: 'vencimiento',
              enviada: false
            }
          }
        }
      });

      for (const suscripcion of suscripcionesVencidas) {
        // Actualizar estado de la suscripción
        await prisma.suscripcion.update({
          where: { idSuscripcion: suscripcion.idSuscripcion },
          data: { estado: 'vencida' }
        });

        // Enviar notificación de vencimiento si existe
        if (suscripcion.notificaciones.length > 0) {
          await this.marcarNotificacionComoEnviada(suscripcion.notificaciones[0].idNotificacion);
          notificacionesEnviadas++;
        }
      }

      return {
        success: true,
        notificacionesEnviadas,
        suscripcionesActualizadas: suscripcionesVencidas.length
      };
    } catch (error) {
      console.error('Error verificando notificaciones:', error);
      throw error;
    }
  }

  /**
   * Marcar una notificación como enviada
   * @param {number} idNotificacion - ID de la notificación
   */
  async marcarNotificacionComoEnviada(idNotificacion) {
    try {
      await prisma.notificacionVencimiento.update({
        where: { idNotificacion },
        data: {
          enviada: true,
          fechaEnvio: new Date()
        }
      });
      return { success: true };
    } catch (error) {
      console.error('Error marcando notificación como enviada:', error);
      throw error;
    }
  }

  /**
   * Obtener notificaciones de una suscripción
   * @param {number} idSuscripcion - ID de la suscripción
   */
  async obtenerNotificacionesSuscripcion(idSuscripcion) {
    try {
      const notificaciones = await prisma.notificacionVencimiento.findMany({
        where: { idSuscripcion },
        orderBy: { fechaCreacion: 'desc' }
      });
      return notificaciones;
    } catch (error) {
      console.error('Error obteniendo notificaciones:', error);
      throw error;
    }
  }

  /**
   * Eliminar notificaciones de una suscripción
   * @param {number} idSuscripcion - ID de la suscripción
   */
  async eliminarNotificacionesSuscripcion(idSuscripcion) {
    try {
      await prisma.notificacionVencimiento.deleteMany({
        where: { idSuscripcion }
      });
      return { success: true };
    } catch (error) {
      console.error('Error eliminando notificaciones:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();

/**
 * ============================================
 * RENEWAL SERVICE - CUENTY MVP
 * ============================================
 * Servicio de renovaciones automáticas usando Chatwoot
 * 
 * Funcionalidades:
 * - Verificación automática de vencimientos
 * - Renovaciones automáticas con cron jobs
 * - Recordatorios de vencimiento
 * - Notificaciones vía Chatwoot
 */

const cron = require('node-cron');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const chatwootAutomationService = require('./chatwootAutomationService');
const emailService = require('./emailService');

class RenewalService {
  constructor() {
    this.setupCronJobs();
    console.log('🔄 Servicio de renovaciones automáticas inicializado');
  }

  /**
   * Configurar trabajos programados (cron jobs)
   */
  setupCronJobs() {
    // Verificar renovaciones diariamente a las 9:00 AM
    cron.schedule('0 9 * * *', async () => {
      console.log('🔄 Iniciando verificación de renovaciones automáticas...');
      try {
        const result = await this.verificarRenovaciones();
        console.log(`✅ Renovaciones verificadas: ${result.renovacionesExitosas} exitosas`);
      } catch (error) {
        console.error('❌ Error en verificación de renovaciones:', error);
      }
    });

    // Verificar suscripciones próximas a vencer cada 6 horas
    cron.schedule('0 */6 * * *', async () => {
      console.log('⏰ Verificando suscripciones próximas a vencer...');
      try {
        const result = await this.verificarVencimientosProximos();
        console.log(`⏰ Vencimientos verificados: ${result.notificadas} notificaciones enviadas`);
      } catch (error) {
        console.error('❌ Error en verificación de vencimientos:', error);
      }
    });

    // Limpiar logs antiguos diariamente a las 2:00 AM
    cron.schedule('0 2 * * *', async () => {
      console.log('🧹 Limpiando logs antiguos...');
      try {
        await this.limpiarLogsAntiguos();
      } catch (error) {
        console.error('❌ Error limpiando logs:', error);
      }
    });

    console.log('✅ Cron jobs de renovación configurados');
  }

  /**
   * Verificar y procesar renovaciones automáticas
   * @returns {Promise<Object>}
   */
  async verificarRenovaciones() {
    try {
      const ahora = new Date();
      
      // Buscar suscripciones que vencen en los próximos 3 días
      const fechaLimite = new Date(ahora.getTime() + 3 * 24 * 60 * 60 * 1000);
      
      const suscripcionesParaRenovar = await prisma.suscripciones.findMany({
        where: {
          estado: 'activa',
          renovacion_automatica: true,
          fecha_proxima_renovacion: {
            lte: fechaLimite,
            gte: ahora
          }
        },
        include: {
          clientes: true,
          service_plans: {
            include: {
              servicios: true
            }
          }
        }
      });

      console.log(`🔍 Encontradas ${suscripcionesParaRenovar.length} suscripciones para renovar`);

      let renovacionesExitosas = 0;
      let errores = [];

      for (const suscripcion of suscripcionesParaRenovar) {
        try {
          // Verificar si ya se procesó hoy
          const yaProcesadaHoy = await this.yaProcesadaHoy(suscripcion.id, 'renovacion');
          if (yaProcesadaHoy) {
            console.log(`⏭️ Suscripción ${suscripcion.id} ya procesada hoy, saltando...`);
            continue;
          }

          const resultado = await this.procesarRenovacion(suscripcion.id);
          if (resultado.success) {
            renovacionesExitosas++;
            
            // Registrar procesamiento exitoso
            await this.registrarProcesamiento(suscripcion.id, 'renovacion', 'exitoso', resultado);
          } else {
            errores.push({
              suscripcionId: suscripcion.id,
              error: resultado.error
            });
            
            // Registrar procesamiento fallido
            await this.registrarProcesamiento(suscripcion.id, 'renovacion', 'fallido', { error: resultado.error });
          }
        } catch (error) {
          errores.push({
            suscripcionId: suscripcion.id,
            error: error.message
          });
          
          await this.registrarProcesamiento(suscripcion.id, 'renovacion', 'error', { error: error.message });
        }
      }

      console.log(`✅ Renovaciones procesadas: ${renovacionesExitosas} exitosas, ${errores.length} con errores`);
      
      // Limpiar cache para refrescar datos
      chatwootAutomationService.clearCache();
      
      return {
        success: true,
        totalProcesadas: suscripcionesParaRenovar.length,
        renovacionesExitosas,
        errores
      };

    } catch (error) {
      console.error('❌ Error verificando renovaciones:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Procesar renovación de una suscripción específica
   * @param {number} suscripcionId 
   * @returns {Promise<Object>}
   */
  async procesarRenovacion(suscripcionId) {
    try {
      const suscripcion = await prisma.suscripciones.findUnique({
        where: { id: suscripcionId },
        include: {
          clientes: true,
          service_plans: {
            include: {
              servicios: true
            }
          }
        }
      });

      if (!suscripcion) {
        throw new Error(`Suscripción ${suscripcionId} no encontrada`);
      }

      // Verificar que aún esté activa
      if (suscripcion.estado !== 'activa') {
        throw new Error(`La suscripción ${suscripcionId} no está activa`);
      }

      // Procesar pago automático (placeholder - implementar según pasarela de pago)
      const pagoExitoso = await this.procesarPagoAutomatico(suscripcion);

      if (!pagoExitoso) {
        throw new Error('Pago automático falló');
      }

      // Calcular nueva fecha de vencimiento
      const nuevaFechaVencimiento = this.calcularNuevaFechaVencimiento(
        suscripcion.fecha_proxima_renovacion,
        suscripcion.service_plans.duracion_meses,
        suscripcion.service_plans.duracion_dias
      );

      // Actualizar suscripción en transacción
      const suscripcionRenovada = await prisma.$transaction(async (tx) => {
        // Actualizar suscripción
        const updated = await tx.suscripciones.update({
          where: { id: suscripcionId },
          data: {
            fecha_ultima_renovacion: new Date(),
            fecha_proxima_renovacion: nuevaFechaVencimiento,
            estado: 'activa',
            renovaciones_realizadas: {
              increment: 1
            }
          }
        });

        // Crear orden de renovación
        const ordenRenovacion = await tx.ordenes.create({
          data: {
            cliente_id: suscripcion.cliente_id,
            celular_usuario: suscripcion.clientes.telefono || '',
            monto_total: suscripcion.service_plans.precio_venta || suscripcion.service_plans.costo,
            estado: 'pagada',
            metodo_pago: 'renovacion_automatica',
            fecha_pago: new Date(),
            datos_pago: {
              tipo: 'renovacion_automatica',
              suscripcion_id: suscripcionId,
              plan_id: suscripcion.plan_id,
              renovacion_numero: suscripcion.renovaciones_realizadas + 1
            }
          }
        });

        return { suscripcion: updated, orden: ordenRenovacion };
      });

      // Notificar renovación exitosa
      await this.notificarRenovacionExitosa(suscripcion, suscripcionRenovada.suscripcion);

      // Programar próximas notificaciones de vencimiento
      await this.programarNotificacionesVencimiento(suscripcionRenovada.suscripcion.id);

      return {
        success: true,
        suscripcionId,
        nuevaFechaVencimiento,
        ordenRenovacionId: suscripcionRenovacion.orden.id_orden,
        renovacionNumero: suscripcionRenovada.suscripcion.renovaciones_realizadas
      };

    } catch (error) {
      console.error(`❌ Error renovando suscripción ${suscripcionId}:`, error);
      
      // Notificar error de renovación
      await this.notificarErrorRenovacion(suscripcionId, error.message);
      
      return { success: false, error: error.message };
    }
  }

  /**
   * Verificar vencimientos próximos para notificaciones
   * @returns {Promise<Object>}
   */
  async verificarVencimientosProximos() {
    try {
      const ahora = new Date();
      
      // Notificaciones para los próximos 7 días
      const fechaLimite = new Date(ahora.getTime() + 7 * 24 * 60 * 60 * 1000);
      
      const suscripcionesProximas = await prisma.suscripciones.findMany({
        where: {
          estado: 'activa',
          fecha_proxima_renovacion: {
            gte: ahora,
            lte: fechaLimite
          }
        },
        include: {
          clientes: true,
          service_plans: {
            include: {
              servicios: true
            }
          }
        }
      });

      let notificadas = 0;

      for (const suscripcion of suscripcionesProximas) {
        try {
          // Verificar si ya se envió recordatorio recientemente
          const diasHastaVencimiento = Math.ceil(
            (suscripcion.fecha_proxima_renovacion - ahora) / (1000 * 60 * 60 * 24)
          );

          // Solo notificar si faltan 7, 3, 1 día(s)
          if ([7, 3, 1].includes(diasHastaVencimiento)) {
            const yaNotificadaHoy = await this.yaNotificadaHoy(suscripcion.id, diasHastaVencimiento);
            if (!yaNotificadaHoy) {
              await this.enviarRecordatorioVencimiento(suscripcion, diasHastaVencimiento);
              notificadas++;
            }
          }
        } catch (error) {
          console.error(`❌ Error procesando recordatorio para suscripción ${suscripcion.id}:`, error.message);
        }
      }

      return { success: true, notificadas };

    } catch (error) {
      console.error('❌ Error verificando vencimientos:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Enviar recordatorio de vencimiento vía Chatwoot
   * @param {Object} suscripcion 
   * @param {number} diasHastaVencimiento 
   */
  async enviarRecordatorioVencimiento(suscripcion, diasHastaVencimiento) {
    try {
      const celular = suscripcion.clientes.telefono;
      const servicioNombre = suscripcion.service_plans.servicios.nombre;
      
      const renewalData = {
        service: servicioNombre,
        expirationDate: suscripcion.fecha_proxima_renovacion,
        daysUntilExpiration: diasHastaVencimiento
      };

      // Enviar recordatorio por WhatsApp vía Chatwoot
      const result = await chatwootAutomationService.sendRenewalReminder(
        celular, 
        renewalData
      );

      // Registrar notificación enviada
      await this.registrarNotificacionEnviada({
        suscripcionId: suscripcion.id,
        tipo: `recordatorio_${diasHastaVencimiento}_dias`,
        destino: celular,
        exito: result.success,
        mensajeId: result.messageId
      });

      // También enviar por email
      if (suscripcion.clientes.email) {
        try {
          await emailService.sendRenewalReminder({
            to: suscripcion.clientes.email,
            suscripcion: renewalData
          });
        } catch (emailError) {
          console.error(`⚠️ Error enviando email de recordatorio:`, emailError.message);
        }
      }

      console.log(`⏰ Recordatorio enviado a ${celular} (${diasHastaVencimiento} días restantes)`);
      return result;

    } catch (error) {
      console.error('❌ Error enviando recordatorio:', error);
      throw error;
    }
  }

  /**
   * Notificar renovación exitosa vía Chatwoot
   * @param {Object} suscripcion 
   * @param {Object} suscripcionRenovada 
   */
  async notificarRenovacionExitosa(suscripcion, suscripcionRenovada) {
    try {
      const celular = suscripcion.clientes.telefono;
      const servicioNombre = suscripcion.service_plans.servicios.nombre;
      const nuevaFecha = new Date(suscripcionRenovada.fecha_proxima_renovacion);
      
      const mensaje = `🎉 ¡Renovación exitosa!

Tu suscripción a ${servicioNombre} ha sido renovada automáticamente.

📅 Nueva fecha de vencimiento: ${nuevaFecha.toLocaleDateString('es-MX')}

✅ El servicio continuará sin interrupciones.
🔢 Número de renovación: ${suscripcionRenovada.renovaciones_realizadas}

¿Necesitas ayuda? Responde a este mensaje.`;

      const result = await chatwootAutomationService.sendWhatsAppMessage(celular, mensaje, {
        type: 'renewal_success',
        service: servicioNombre,
        renewalNumber: suscripcionRenovada.renovaciones_realizadas,
        urgency: 'normal'
      });

      // Agregar etiquetas
      if (result.success) {
        await chatwootAutomationService.chatwootService.addLabelsToConversation(
          result.conversationId, 
          [
            'renovacion-exitosa',
            `servicio-${servicioNombre.toLowerCase().replace(' ', '-')}`,
            'automatizado'
          ]
        );
      }

      // También por email
      if (suscripcion.clientes.email) {
        try {
          await emailService.sendRenewalConfirmation({
            to: suscripcion.clientes.email,
            suscripcion: suscripcionRenovada,
            service: servicioNombre
          });
        } catch (emailError) {
          console.error(`⚠️ Error enviando email de confirmación:`, emailError.message);
        }
      }

      // Registrar notificación
      await this.registrarNotificacionEnviada({
        suscripcionId: suscripcion.id,
        tipo: 'renovacion_exitosa',
        destino: celular,
        exito: result.success,
        mensajeId: result.messageId
      });

      console.log(`✅ Renovación notificada exitosamente a ${celular}`);
      return result;

    } catch (error) {
      console.error('❌ Error notificando renovación exitosa:', error);
    }
  }

  /**
   * Notificar error de renovación
   * @param {number} suscripcionId 
   * @param {string} error 
   */
  async notificarErrorRenovacion(suscripcionId, error) {
    try {
      const suscripcion = await prisma.suscripciones.findUnique({
        where: { id: suscripcionId },
        include: {
          clientes: true,
          service_plans: {
            include: { servicios: true }
          }
        }
      });

      if (!suscripcion || !suscripcion.clientes.telefono) {
        return;
      }

      const celular = suscripcion.clientes.telefono;
      const servicioNombre = suscripcion.service_plans.servicios.nombre;
      
      const mensaje = `⚠️ Error en renovación automática

No pudimos renovar automáticamente tu suscripción a ${servicioNombre}.

🔧 Motivo: ${error}

📞 Por favor, contacta con soporte para renovar manualmente.
O visita nuestro sitio web para renovar.

¿Necesitas ayuda? Responde a este mensaje.`;

      await chatwootAutomationService.sendWhatsAppMessage(celular, mensaje, {
        type: 'renewal_error',
        service: servicioNombre,
        urgency: 'high'
      });

      console.log(`⚠️ Error de renovación notificado a ${celular}`);

    } catch (notificationError) {
      console.error('❌ Error notificando error de renovación:', notificationError);
    }
  }

  /**
   * Calcular nueva fecha de vencimiento
   * @param {Date} fechaActual 
   * @param {number} meses 
   * @param {number} dias 
   * @returns {Date}
   */
  calcularNuevaFechaVencimiento(fechaActual, meses = 1, dias = 30) {
    const nuevaFecha = new Date(fechaActual);
    
    if (meses && meses > 0) {
      nuevaFecha.setMonth(nuevaFecha.getMonth() + meses);
    } else if (dias && dias > 0) {
      nuevaFecha.setDate(nuevaFecha.getDate() + dias);
    }
    
    return nuevaFecha;
  }

  /**
   * Procesar pago automático (placeholder)
   * @param {Object} suscripcion 
   * @returns {Promise<boolean>}
   */
  async procesarPagoAutomatico(suscripcion) {
    try {
      // TODO: Implementar integración con Stripe, PayPal, etc.
      // Por ahora simulamos pago exitoso
      console.log(`💳 Procesando pago automático para suscripción ${suscripcion.id}`);
      
      // Simular tiempo de procesamiento
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Por ahora siempre exitoso, implementar lógica real después
      return true;
      
    } catch (error) {
      console.error(`❌ Error procesando pago automático:`, error);
      return false;
    }
  }

  /**
   * Programar notificaciones de vencimiento para una suscripción
   * @param {number} suscripcionId 
   */
  async programarNotificacionesVencimiento(suscripcionId) {
    try {
      // TODO: Implementar programación de notificaciones
      // Por ahora las notificaciones se manejan via cron jobs
      
      console.log(`📅 Notificaciones programadas para suscripción ${suscripcionId}`);
      
    } catch (error) {
      console.error('❌ Error programando notificaciones:', error);
    }
  }

  /**
   * Verificar si una suscripción ya fue procesada hoy
   * @param {number} suscripcionId 
   * @param {string} tipo 
   * @returns {Promise<boolean>}
   */
  async yaProcesadaHoy(suscripcionId, tipo) {
    try {
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);
      
      const manana = new Date(hoy);
      manana.setDate(manana.getDate() + 1);
      
      // TODO: Implementar tabla de logs de procesamiento
      // Por ahora siempre retornar false
      return false;
      
    } catch (error) {
      console.error('❌ Error verificando procesamiento:', error);
      return false;
    }
  }

  /**
   * Verificar si ya se envió notificación hoy
   * @param {number} suscripcionId 
   * @param {number} diasRestantes 
   * @returns {Promise<boolean>}
   */
  async yaNotificadaHoy(suscripcionId, diasRestantes) {
    try {
      // TODO: Implementar verificación en tabla de notificaciones
      // Por ahora siempre retornar false para permitir notificaciones
      
      return false;
      
    } catch (error) {
      console.error('❌ Error verificando notificación:', error);
      return false;
    }
  }

  /**
   * Registrar procesamiento de suscripción
   * @param {number} suscripcionId 
   * @param {string} tipo 
   * @param {string} resultado 
   * @param {Object} data 
   */
  async registrarProcesamiento(suscripcionId, tipo, resultado, data) {
    try {
      console.log(`📊 PROCESAMIENTO - ${tipo} para suscripción ${suscripcionId}: ${resultado}`);
      
      // TODO: Implementar tabla de logs de procesamiento
      // await prisma.logsProcesamiento.create({...});
      
    } catch (error) {
      console.error('❌ Error registrando procesamiento:', error);
    }
  }

  /**
   * Registrar notificación enviada
   * @param {Object} data 
   */
  async registrarNotificacionEnviada(data) {
    try {
      console.log(`📱 NOTIFICACIÓN - ${data.tipo} para suscripción ${data.suscripcionId}: ${data.exito ? 'Exitosa' : 'Fallida'}`);
      
      // TODO: Implementar tabla de notificaciones
      // await prisma.notificacionesRenovacion.create({...});
      
    } catch (error) {
      console.error('❌ Error registrando notificación:', error);
    }
  }

  /**
   * Limpiar logs antiguos
   */
  async limpiarLogsAntiguos() {
    try {
      const fechaLimite = new Date();
      fechaLimite.setDate(fechaLimite.getDate() - 30); // 30 días atrás
      
      console.log(`🧹 Limpiando logs anteriores al ${fechaLimite.toDateString()}`);
      
      // TODO: Implementar limpieza de logs antiguos
      // await prisma.logsProcesamiento.deleteMany({ where: { createdAt: { lt: fechaLimite } } });
      
      console.log('✅ Logs antiguos limpiados');
      
    } catch (error) {
      console.error('❌ Error limpiando logs:', error);
    }
  }

  /**
   * Obtener estadísticas de renovaciones
   * @param {Object} filtros 
   * @returns {Promise<Object>}
   */
  async getRenewalStats(filtros = {}) {
    try {
      const { desde, hasta } = filtros;
      
      // Construir filtros de fecha
      const whereFiltros = {};
      if (desde || hasta) {
        whereFiltros.fecha_ultima_renovacion = {};
        if (desde) whereFiltros.fecha_ultima_renovacion.gte = new Date(desde);
        if (hasta) whereFiltros.fecha_ultima_renovacion.lte = new Date(hasta);
      }

      // Obtener suscripciones renovadas
      const suscripcionesRenovadas = await prisma.suscripciones.findMany({
        where: {
          ...whereFiltros,
          renovacion_automatica: true,
          fecha_ultima_renovacion: { not: null }
        },
        include: {
          clientes: true,
          service_plans: {
            include: { servicios: true }
          }
        }
      });

      const stats = {
        totalRenovaciones: suscripcionesRenovadas.length,
        servicios: {},
        promedioRenovaciones: 0,
        renovacionesPorMes: {}
      };

      let totalRenovaciones = 0;

      for (const suscripcion of suscripcionesRenovadas) {
        const servicioNombre = suscripcion.service_plans.servicios.nombre;
        if (!stats.servicios[servicioNombre]) {
          stats.servicios[servicioNombre] = 0;
        }
        stats.servicios[servicioNombre]++;
        
        totalRenovaciones += suscripcion.renovaciones_realizadas || 0;

        // Agrupar por mes
        const fechaRenovacion = new Date(suscripcion.fecha_ultima_renovacion);
        const mesAno = `${fechaRenovacion.getFullYear()}-${String(fechaRenovacion.getMonth() + 1).padStart(2, '0')}`;
        if (!stats.renovacionesPorMes[mesAno]) {
          stats.renovacionesPorMes[mesAno] = 0;
        }
        stats.renovacionesPorMes[mesAno]++;
      }

      stats.promedioRenovaciones = suscripcionesRenovadas.length > 0 
        ? Math.round((totalRenovaciones / suscripcionesRenovadas.length) * 100) / 100
        : 0;

      return {
        success: true,
        stats,
        periodo: { desde, hasta }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Forzar verificación manual de renovaciones
   * @returns {Promise<Object>}
   */
  async forzarVerificacionRenovaciones() {
    try {
      console.log('🔄 Forzando verificación manual de renovaciones...');
      const result = await this.verificarRenovaciones();
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }

  /**
   * Forzar verificación manual de vencimientos
   * @returns {Promise<Object>}
   */
  async forzarVerificacionVencimientos() {
    try {
      console.log('⏰ Forzando verificación manual de vencimientos...');
      const result = await this.verificarVencimientosProximos();
      return result;
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}

module.exports = new RenewalService();
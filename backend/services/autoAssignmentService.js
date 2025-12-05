/**
 * ============================================
 * AUTO ASSIGNMENT SERVICE - CUENTY MVP
 * ============================================
 * Servicio de asignación automática de cuentas usando Chatwoot
 * 
 * Funcionalidades:
 * - Asignación automática de cuentas a órdenes pagadas
 * - Verificación de disponibilidad de inventario
 * - Notificación automática vía Chatwoot
 * - Seguimiento del proceso completo
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const chatwootAutomationService = require('./chatwootAutomationService');
const emailService = require('./emailService');

class AutoAssignmentService {
  
  /**
   * Asignar cuentas automáticamente a una orden pagada
   * @param {number} ordenId 
   * @returns {Promise<Object>}
   */
  async asignarCuentaAOrden(ordenId) {
    try {
      console.log(`🔄 Iniciando asignación automática para orden ${ordenId}`);
      
      // Obtener orden con todos los detalles
      const orden = await prisma.ordenes.findUnique({
        where: { id_orden: ordenId },
        include: {
          order_items: {
            include: {
              service_plans: {
                include: {
                  servicios: true
                }
              }
            }
          },
          usuarios: true,
          clientes: true
        }
      });

      if (!orden) {
        throw new Error(`Orden ${ordenId} no encontrada`);
      }

      if (orden.estado !== 'pagada') {
        throw new Error(`La orden debe estar pagada para asignar cuentas`);
      }

      // Verificar disponibilidad antes de asignar
      const disponibilidadResult = await this.verificarDisponibilidad(ordenId);
      if (!disponibilidadResult.puedeAsignarse) {
        throw new Error(`No hay suficiente inventario para completar la orden`);
      }

      let asignacionesExitosas = 0;
      let errores = [];

      // Asignar cuenta para cada item de la orden
      for (const item of orden.order_items) {
        try {
          const asignacion = await this.asignarCuentaItem(item.id_order_item);
          if (asignacion.success) {
            asignacionesExitosas++;
            
            // Enviar notificación de entrega
            await this.notificarEntregaCuenta(orden, item, asignacion.cuenta);
            
            console.log(`✅ Cuenta asignada para item ${item.id_order_item}`);
          } else {
            errores.push({
              itemId: item.id_order_item,
              error: asignacion.error
            });
            console.error(`❌ Error asignando item ${item.id_order_item}:`, asignacion.error);
          }
        } catch (error) {
          errores.push({
            itemId: item.id_order_item,
            error: error.message
          });
          console.error(`❌ Error procesando item ${item.id_order_item}:`, error.message);
        }
      }

      // Actualizar estado de la orden
      if (asignacionesExitosas > 0) {
        await prisma.ordenes.update({
          where: { id_orden: ordenId },
          data: {
            estado: 'entregada',
            fecha_entrega: new Date()
          }
        });

        // Agregar log de asignación automática
        await this.registrarLogAsignacion(ordenId, asignacionesExitosas, errores);
      }

      const resultado = {
        success: true,
        ordenId,
        totalItems: orden.order_items.length,
        asignacionesExitosas,
        errores,
        estadoFinal: asignacionesExitosas === orden.order_items.length ? 'completada' : 'parcial'
      };

      console.log(`✅ Asignación completada: ${asignacionesExitosas}/${orden.order_items.length} items`);
      return resultado;

    } catch (error) {
      console.error('❌ Error en asignación automática:', error);
      
      // Registrar error en logs
      await this.registrarErrorAsignacion(ordenId, error.message);
      
      return {
        success: false,
        error: error.message,
        ordenId
      };
    }
  }

  /**
   * Asignar cuenta a un item específico
   * @param {number} itemId 
   * @returns {Promise<Object>}
   */
  async asignarCuentaItem(itemId) {
    try {
      const item = await prisma.order_items.findUnique({
        where: { id_order_item: itemId },
        include: {
          service_plans: {
            include: {
              servicios: true
            }
          }
        }
      });

      if (!item) {
        throw new Error(`Item ${itemId} no encontrado`);
      }

      // Buscar cuenta disponible para el plan usando FIFO
      const cuentaDisponible = await prisma.inventario_cuentas.findFirst({
        where: {
          id_plan: item.id_plan,
          estado: 'disponible'
        },
        orderBy: {
          fecha_agregado: 'asc' // FIFO - primera en llegar, primera en servir
        }
      });

      if (!cuentaDisponible) {
        return {
          success: false,
          error: `No hay cuentas disponibles para el plan ${item.service_plans.nombre_plan}`
        };
      }

      // Iniciar transacción para garantizar consistencia
      const resultado = await prisma.$transaction(async (tx) => {
        // Asignar la cuenta al item
        await tx.order_items.update({
          where: { id_order_item: itemId },
          data: {
            id_cuenta_asignada: cuentaDisponible.id_cuenta,
            estado: 'asignada'
          }
        });

        // Actualizar estado de la cuenta
        await tx.inventario_cuentas.update({
          where: { id_cuenta: cuentaDisponible.id_cuenta },
          data: {
            estado: 'asignada',
            fecha_ultima_asignacion: new Date()
          }
        });

        return cuentaDisponible;
      });

      // Desencriptar credenciales para la notificación
      const credenciales = await this.desencriptarCredenciales(resultado);

      return {
        success: true,
        cuenta: {
          ...resultado,
          email: credenciales.email,
          password: credenciales.password
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        itemId
      };
    }
  }

  /**
   * Notificar entrega de cuenta al cliente usando Chatwoot
   * @param {Object} orden 
   * @param {Object} item 
   * @param {Object} cuenta 
   */
  async notificarEntregaCuenta(orden, item, cuenta) {
    try {
      const celular = orden.celular_usuario;
      const servicioNombre = item.service_plans.servicios.nombre;
      const planNombre = item.service_plans.nombre_plan;
      
      // Preparar datos de la cuenta para el mensaje
      const accountData = {
        service: servicioNombre,
        plan: planNombre,
        email: cuenta.email,
        password: cuenta.password,
        profile: cuenta.perfil,
        pin: cuenta.pin,
        expiration: item.fecha_vencimiento_servicio
      };

      // Enviar notificación por WhatsApp vía Chatwoot
      const whatsappResult = await chatwootAutomationService.sendAccountDelivery(
        celular, 
        accountData
      );

      // Enviar por email también si el cliente tiene email
      if (orden.clientes?.email) {
        try {
          await emailService.sendAccountDelivery({
            to: orden.clientes.email,
            account: accountData
          });
          console.log(`📧 Email de entrega enviado a ${orden.clientes.email}`);
        } catch (emailError) {
          console.error(`⚠️ Error enviando email de entrega:`, emailError.message);
          // No fallar el proceso por error de email
        }
      }

      // Registrar notificación enviada
      await this.registrarNotificacionEnviada({
        ordenId: orden.id_orden,
        tipo: 'entrega_cuenta',
        destino: celular,
        exito: whatsappResult.success,
        mensajeId: whatsappResult.messageId
      });

      console.log(`📱 Notificación de entrega enviada vía Chatwoot a ${celular}`);
      return whatsappResult;

    } catch (error) {
      console.error('❌ Error notificando entrega:', error);
      
      // Registrar fallo de notificación
      await this.registrarNotificacionEnviada({
        ordenId: orden.id_orden,
        tipo: 'entrega_cuenta',
        destino: orden.celular_usuario,
        exito: false,
        error: error.message
      });
      
      throw error;
    }
  }

  /**
   * Verificar disponibilidad de inventario para una orden
   * @param {number} ordenId 
   * @returns {Promise<Object>}
   */
  async verificarDisponibilidad(ordenId) {
    try {
      const orden = await prisma.ordenes.findUnique({
        where: { id_orden: ordenId },
        include: {
          order_items: {
            include: {
              service_plans: true
            }
          }
        }
      });

      if (!orden) {
        throw new Error(`Orden ${ordenId} no encontrada`);
      }

      const disponibilidad = [];

      for (const item of orden.order_items) {
        const cuentasDisponibles = await prisma.inventario_cuentas.count({
          where: {
            id_plan: item.id_plan,
            estado: 'disponible'
          }
        });

        disponibilidad.push({
          itemId: item.id_order_item,
          planId: item.id_plan,
          planNombre: item.service_plans.nombre_plan,
          solicitado: item.cantidad,
          disponible: cuentasDisponibles,
          suficiente: cuentasDisponibles >= item.cantidad
        });
      }

      const puedeAsignarse = disponibilidad.every(d => d.suficiente);
      const issues = disponibilidad.filter(d => !d.suficiente);

      return {
        success: true,
        ordenId,
        disponibilidad,
        puedeAsignarse,
        issues,
        resumen: {
          totalItems: disponibilidad.length,
          itemsSuficientes: disponibilidad.filter(d => d.suficiente).length,
          itemsInsuficientes: issues.length
        }
      };

    } catch (error) {
      return {
        success: false,
        error: error.message,
        ordenId
      };
    }
  }

  /**
   * Desencriptar credenciales de la cuenta
   * @param {Object} cuenta 
   * @returns {Promise<Object>}
   */
  async desencriptarCredenciales(cuenta) {
    try {
      const CryptoJS = require('crypto-js');
      
      const decryptedEmail = CryptoJS.AES.decrypt(
        cuenta.correo_encriptado, 
        process.env.ENCRYPTION_KEY
      ).toString(CryptoJS.enc.Utf8);

      const decryptedPassword = CryptoJS.AES.decrypt(
        cuenta.contrasena_encriptada, 
        process.env.ENCRYPTION_KEY
      ).toString(CryptoJS.enc.Utf8);

      return {
        email: decryptedEmail,
        password: decryptedPassword
      };
    } catch (error) {
      console.error('❌ Error desencriptando credenciales:', error.message);
      throw new Error('No se pudieron desencriptar las credenciales');
    }
  }

  /**
   * Registrar log de asignación en la base de datos
   * @param {number} ordenId 
   * @param {number} exitosas 
   * @param {Array} errores 
   */
  async registrarLogAsignacion(ordenId, exitosas, errores) {
    try {
      // Crear entrada en la tabla de logs si existe
      // Por ahora usar console.log, se puede implementar tabla específica
      console.log(`📊 LOG ASIGNACIÓN - Orden ${ordenId}: ${exitosas} exitosas, ${errores.length} errores`);
      
      // TODO: Implementar tabla de logs de asignación automática
      // await prisma.logsAsignacion.create({...});
      
    } catch (error) {
      console.error('❌ Error registrando log de asignación:', error.message);
    }
  }

  /**
   * Registrar error de asignación
   * @param {number} ordenId 
   * @param {string} error 
   */
  async registrarErrorAsignacion(ordenId, error) {
    try {
      console.error(`🚨 ERROR ASIGNACIÓN - Orden ${ordenId}:`, error);
      
      // TODO: Implementar alertas por errores críticos
      // await this.enviarAlertaError(ordenId, error);
      
    } catch (logError) {
      console.error('❌ Error registrando error de asignación:', logError.message);
    }
  }

  /**
   * Registrar notificación enviada
   * @param {Object} data 
   */
  async registrarNotificacionEnviada(data) {
    try {
      // TODO: Implementar tabla de logs de notificaciones
      console.log(`📱 NOTIFICACIÓN - ${data.tipo} a ${data.destino}: ${data.exito ? 'Exitosa' : 'Fallida'}`);
      
      // Crear entrada en notificaciones
      if (data.ordenId) {
        await prisma.notificaciones.create({
          data: {
            tipo: data.tipo,
            destino: data.destino,
            mensaje_id: data.mensajeId || null,
            enviada: data.exito,
            error: data.error || null,
            fecha_envio: new Date(),
            metadata: {
              ordenId: data.ordenId,
              chatwootMessageId: data.mensajeId
            }
          }
        }).catch(() => {
          // Si la tabla no existe, solo log
          console.log('ℹ️ Tabla notificaciones no existe, solo log registrado');
        });
      }
      
    } catch (error) {
      console.error('❌ Error registrando notificación:', error.message);
    }
  }

  /**
   * Obtener estadísticas de asignación automática
   * @param {Object} filtros 
   * @returns {Promise<Object>}
   */
  async getAsignacionStats(filtros = {}) {
    try {
      const { desde, hasta, servicio } = filtros;
      
      // Construir filtros de fecha
      const whereFiltros = {};
      if (desde || hasta) {
        whereFiltros.fecha_entrega = {};
        if (desde) whereFiltros.fecha_entrega.gte = new Date(desde);
        if (hasta) whereFiltros.fecha_entrega.lte = new Date(hasta);
      }

      // Obtener órdenes entregadas automáticamente
      const ordenesEntregadas = await prisma.ordenes.findMany({
        where: {
          ...whereFiltros,
          estado: 'entregada',
          fecha_entrega: { not: null }
        },
        include: {
          order_items: {
            include: {
              service_plans: {
                include: { servicios: true }
              }
            }
          }
        }
      });

      // Calcular estadísticas
      const stats = {
        totalOrdenes: ordenesEntregadas.length,
        totalItemsAsignados: 0,
        servicios: {},
        errores: 0,
        promedioItemsPorOrden: 0
      };

      for (const orden of ordenesEntregadas) {
        stats.totalItemsAsignados += orden.order_items.length;
        
        for (const item of orden.order_items) {
          const servicioNombre = item.service_plans.servicios.nombre;
          if (!stats.servicios[servicioNombre]) {
            stats.servicios[servicioNombre] = 0;
          }
          stats.servicios[servicioNombre]++;
        }
      }

      stats.promedioItemsPorOrden = stats.totalOrdenes > 0 
        ? Math.round((stats.totalItemsAsignados / stats.totalOrdenes) * 100) / 100
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
   * Procesar asignación masiva (para órdenes pendientes)
   * @param {Array} ordenIds 
   * @returns {Promise<Object>}
   */
  async procesarAsignacionMasiva(ordenIds) {
    const resultados = [];
    let exitosas = 0;
    let fallidas = 0;

    console.log(`🚀 Iniciando asignación masiva de ${ordenIds.length} órdenes`);

    for (const ordenId of ordenIds) {
      try {
        const resultado = await this.asignarCuentaAOrden(ordenId);
        resultados.push({
          ordenId,
          success: resultado.success,
          error: resultado.error || null
        });

        if (resultado.success) {
          exitosas++;
        } else {
          fallidas++;
        }

        // Pausa pequeña para evitar sobrecarga
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        resultados.push({
          ordenId,
          success: false,
          error: error.message
        });
        fallidas++;
      }
    }

    console.log(`✅ Asignación masiva completada: ${exitosas} exitosas, ${fallidas} fallidas`);

    return {
      success: true,
      total: ordenIds.length,
      exitosas,
      fallidas,
      resultados
    };
  }
}

module.exports = new AutoAssignmentService();
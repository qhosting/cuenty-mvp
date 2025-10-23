/**
 * Servicio de Notificaciones
 * Maneja el envío de notificaciones por WhatsApp (Evolution API) y Email
 */

const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Configuración de Evolution API desde variables de entorno
const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL || 'http://localhost:8080';
const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY || '';
const EVOLUTION_INSTANCE = process.env.EVOLUTION_INSTANCE || 'cuenty';

/**
 * Plantillas de mensajes para notificaciones
 */
const PLANTILLAS = {
  siete_dias: (suscripcion) => `
🔔 *Recordatorio CUENTY*

¡Hola! 👋

Tu suscripción a *${suscripcion.servicio.nombre}* - Plan *${suscripcion.plan.nombrePlan}* vencerá en *7 días*.

📅 Fecha de vencimiento: ${formatearFecha(suscripcion.fechaProximaRenovacion)}

${suscripcion.renovacionAutomatica ? 
  '✅ Tu suscripción se renovará automáticamente.' : 
  '⚠️ Recuerda renovar tu suscripción para seguir disfrutando del servicio.'
}

¿Necesitas ayuda? ¡Contáctanos! 💬
  `.trim(),

  tres_dias: (suscripcion) => `
⚠️ *URGENTE - Suscripción por vencer*

¡Hola! 👋

Tu suscripción a *${suscripcion.servicio.nombre}* - Plan *${suscripcion.plan.nombrePlan}* vencerá en *3 días*.

📅 Fecha de vencimiento: ${formatearFecha(suscripcion.fechaProximaRenovacion)}

${suscripcion.renovacionAutomatica ? 
  '✅ Tu suscripción se renovará automáticamente.' : 
  '🚨 *¡RENUEVA PRONTO!* Evita la interrupción del servicio.'
}

Renovar ahora: ${process.env.FRONTEND_URL || 'https://cuenty.com'}/client/suscripciones

¿Necesitas ayuda? ¡Contáctanos! 💬
  `.trim(),

  un_dia: (suscripcion) => `
🚨 *ÚLTIMO AVISO - Suscripción vence mañana*

¡Hola! 👋

Tu suscripción a *${suscripcion.servicio.nombre}* - Plan *${suscripcion.plan.nombrePlan}* vencerá *MAÑANA*.

📅 Fecha de vencimiento: ${formatearFecha(suscripcion.fechaProximaRenovacion)}

${suscripcion.renovacionAutomatica ? 
  '✅ Tu suscripción se renovará automáticamente mañana.' : 
  '🔴 *¡RENUEVA AHORA!* Tu servicio se interrumpirá mañana si no renuevas.'
}

Renovar ahora: ${process.env.FRONTEND_URL || 'https://cuenty.com'}/client/suscripciones

¿Necesitas ayuda? ¡Contáctanos! 💬
  `.trim(),

  vencido: (suscripcion) => `
❌ *Suscripción Vencida*

¡Hola! 👋

Tu suscripción a *${suscripcion.servicio.nombre}* - Plan *${suscripcion.plan.nombrePlan}* ha *VENCIDO*.

📅 Fecha de vencimiento: ${formatearFecha(suscripcion.fechaProximaRenovacion)}

🔄 *Renueva ahora* para recuperar el acceso a tu servicio:
${process.env.FRONTEND_URL || 'https://cuenty.com'}/client/suscripciones

¿Necesitas ayuda? ¡Contáctanos! 💬
  `.trim()
};

/**
 * Formatear fecha para mostrar en mensajes
 */
function formatearFecha(fecha) {
  const date = new Date(fecha);
  const opciones = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric',
    timeZone: 'America/Mexico_City'
  };
  return date.toLocaleDateString('es-MX', opciones);
}

/**
 * Obtener plantilla de mensaje según tipo de notificación
 */
function obtenerPlantillaNotificacion(tipo, suscripcion) {
  const plantilla = PLANTILLAS[tipo];
  if (!plantilla) {
    throw new Error(`Tipo de notificación no válido: ${tipo}`);
  }
  return plantilla(suscripcion);
}

/**
 * Enviar notificación por WhatsApp usando Evolution API
 */
async function enviarNotificacionWhatsApp(numero, mensaje) {
  try {
    // Validar configuración
    if (!EVOLUTION_API_KEY) {
      console.warn('⚠️ EVOLUTION_API_KEY no configurado - notificación simulada');
      return { success: true, simulated: true };
    }

    // Formatear número (asegurar que tenga formato internacional)
    const numeroFormateado = numero.startsWith('+') ? numero : `+${numero}`;

    // Enviar mensaje
    const response = await axios.post(
      `${EVOLUTION_API_URL}/message/sendText/${EVOLUTION_INSTANCE}`,
      {
        number: numeroFormateado,
        text: mensaje
      },
      {
        headers: {
          'apikey': EVOLUTION_API_KEY,
          'Content-Type': 'application/json'
        },
        timeout: 10000 // 10 segundos
      }
    );

    console.log(`✅ WhatsApp enviado a ${numeroFormateado}`);
    return { success: true, data: response.data };

  } catch (error) {
    console.error('❌ Error al enviar WhatsApp:', error.message);
    throw new Error(`Error al enviar WhatsApp: ${error.message}`);
  }
}

/**
 * Enviar notificación por Email
 * TODO: Implementar servicio de email (NodeMailer, SendGrid, etc.)
 */
async function enviarNotificacionEmail(email, asunto, mensaje) {
  try {
    console.log(`📧 Email a enviar a: ${email}`);
    console.log(`Asunto: ${asunto}`);
    console.log(`Mensaje: ${mensaje.substring(0, 100)}...`);
    
    // TODO: Implementar envío real de email
    console.warn('⚠️ Servicio de email no implementado - notificación simulada');
    
    return { success: true, simulated: true };

  } catch (error) {
    console.error('❌ Error al enviar email:', error.message);
    throw new Error(`Error al enviar email: ${error.message}`);
  }
}

/**
 * Crear registro de notificación en la base de datos
 */
async function crearNotificacionVencimiento(suscripcionId, tipo, enviada = false, canal = null, error = null) {
  try {
    const notificacion = await prisma.notificacionVencimiento.create({
      data: {
        suscripcionId,
        tipo,
        enviada,
        canal,
        fechaEnvio: enviada ? new Date() : null,
        error
      }
    });

    return notificacion;

  } catch (error) {
    console.error('❌ Error al crear notificación:', error.message);
    throw error;
  }
}

/**
 * Enviar notificación de vencimiento a un cliente
 */
async function enviarNotificacionVencimiento(suscripcionId, tipo) {
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

    // Verificar si ya se envió notificación de este tipo
    const notificacionExistente = await prisma.notificacionVencimiento.findFirst({
      where: {
        suscripcionId,
        tipo,
        enviada: true
      }
    });

    if (notificacionExistente) {
      console.log(`⚠️ Notificación ${tipo} ya enviada para suscripción ${suscripcionId}`);
      return { success: false, message: 'Notificación ya enviada' };
    }

    // Obtener mensaje de la plantilla
    const mensaje = obtenerPlantillaNotificacion(tipo, suscripcion);

    let resultadoEnvio = null;
    let canal = null;
    let error = null;

    // Intentar enviar por WhatsApp primero
    if (suscripcion.cliente.whatsapp) {
      try {
        await enviarNotificacionWhatsApp(suscripcion.cliente.whatsapp, mensaje);
        canal = 'whatsapp';
        resultadoEnvio = { success: true };
      } catch (err) {
        console.error(`❌ Error al enviar WhatsApp: ${err.message}`);
        error = err.message;
      }
    }

    // Si WhatsApp falla o no está disponible, intentar email
    if (!resultadoEnvio && suscripcion.cliente.email) {
      try {
        await enviarNotificacionEmail(
          suscripcion.cliente.email,
          `CUENTY - Recordatorio de vencimiento`,
          mensaje
        );
        canal = 'email';
        resultadoEnvio = { success: true };
      } catch (err) {
        console.error(`❌ Error al enviar email: ${err.message}`);
        error = error ? `${error}; ${err.message}` : err.message;
      }
    }

    // Registrar notificación en la base de datos
    await crearNotificacionVencimiento(
      suscripcionId,
      tipo,
      resultadoEnvio?.success || false,
      canal,
      error
    );

    if (resultadoEnvio?.success) {
      console.log(`✅ Notificación ${tipo} enviada exitosamente por ${canal} para suscripción ${suscripcionId}`);
      return { success: true, canal, tipo };
    } else {
      console.error(`❌ No se pudo enviar notificación ${tipo} para suscripción ${suscripcionId}`);
      return { success: false, error };
    }

  } catch (error) {
    console.error('❌ Error al enviar notificación de vencimiento:', error);
    throw error;
  }
}

/**
 * Verificar si una notificación ya fue enviada
 */
async function verificarNotificacionEnviada(suscripcionId, tipo) {
  try {
    const notificacion = await prisma.notificacionVencimiento.findFirst({
      where: {
        suscripcionId,
        tipo,
        enviada: true
      }
    });

    return !!notificacion;

  } catch (error) {
    console.error('❌ Error al verificar notificación:', error);
    return false;
  }
}

module.exports = {
  enviarNotificacionWhatsApp,
  enviarNotificacionEmail,
  crearNotificacionVencimiento,
  obtenerPlantillaNotificacion,
  enviarNotificacionVencimiento,
  verificarNotificacionEnviada
};

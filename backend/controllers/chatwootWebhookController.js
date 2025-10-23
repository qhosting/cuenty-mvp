
/**
 * ============================================
 * CHATWOOT WEBHOOK CONTROLLER
 * ============================================
 * Controlador para manejar webhooks de Chatwoot
 * 
 * Eventos soportados:
 * - message_created: Cuando se crea un mensaje nuevo
 * - conversation_created: Cuando se crea una conversación
 * - conversation_updated: Cuando se actualiza una conversación
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const chatwootService = require('../services/chatwootService');

/**
 * Extraer número de teléfono de diferentes formatos
 * @param {string} phone - Número en formato de Chatwoot
 * @returns {string} - Número limpio
 */
function extractPhoneNumber(phone) {
  if (!phone) return null;
  
  // Remover caracteres especiales y espacios
  let cleanNumber = phone.replace(/[^\d+]/g, '');
  
  // Si comienza con + (formato internacional)
  if (cleanNumber.startsWith('+')) {
    return cleanNumber;
  }
  
  // Si es un número de 10 dígitos (México), agregar +52
  if (cleanNumber.length === 10) {
    return `+52${cleanNumber}`;
  }
  
  // Si ya tiene código de país
  if (cleanNumber.length > 10) {
    return `+${cleanNumber}`;
  }
  
  return cleanNumber;
}

/**
 * Buscar usuario en CUENTY por número de teléfono
 * @param {string} phoneNumber - Número de teléfono
 * @returns {Promise<Object|null>} - Usuario encontrado o null
 */
async function buscarUsuarioPorTelefono(phoneNumber) {
  try {
    const cleanPhone = extractPhoneNumber(phoneNumber);
    
    // Buscar en tabla usuarios
    let usuario = await prisma.usuarios.findFirst({
      where: {
        celular: {
          in: [phoneNumber, cleanPhone]
        }
      }
    });
    
    if (usuario) {
      return { tipo: 'usuario', data: usuario };
    }
    
    // Buscar en tabla clientes
    let cliente = await prisma.clientes.findFirst({
      where: {
        OR: [
          { telefono: phoneNumber },
          { telefono: cleanPhone },
          { whatsapp: phoneNumber },
          { whatsapp: cleanPhone }
        ]
      }
    });
    
    if (cliente) {
      return { tipo: 'cliente', data: cliente };
    }
    
    return null;
  } catch (error) {
    console.error('Error al buscar usuario:', error);
    return null;
  }
}

/**
 * Obtener información relevante de la cuenta
 * @param {Object} usuario - Usuario o cliente encontrado
 * @returns {Promise<Object>} - Información completa
 */
async function obtenerInformacionCuenta(usuario) {
  try {
    const info = {
      registrado: true,
      tipo: usuario.tipo,
      datos_basicos: {},
      ordenes: [],
      suscripciones: [],
      tickets: []
    };
    
    if (usuario.tipo === 'usuario') {
      const { celular, nombre, email, verificado, fecha_creacion, ultimo_acceso } = usuario.data;
      info.datos_basicos = {
        celular,
        nombre,
        email,
        verificado,
        fecha_creacion,
        ultimo_acceso
      };
      
      // Obtener órdenes
      const ordenes = await prisma.ordenes.findMany({
        where: { celular_usuario: celular },
        orderBy: { fecha_creacion: 'desc' },
        take: 5,
        include: {
          order_items: {
            include: {
              service_plans: {
                include: {
                  servicios: true
                }
              }
            }
          }
        }
      });
      info.ordenes = ordenes;
      
      // Obtener tickets
      const tickets = await prisma.tickets.findMany({
        where: { celular_usuario: celular },
        orderBy: { fecha_creacion: 'desc' },
        take: 5
      });
      info.tickets = tickets;
      
    } else if (usuario.tipo === 'cliente') {
      const { id, email, nombre, apellido, telefono, whatsapp, activo, fecha_creacion } = usuario.data;
      info.datos_basicos = {
        id,
        email,
        nombre,
        apellido,
        telefono,
        whatsapp,
        activo,
        fecha_creacion
      };
      
      // Obtener órdenes
      const ordenes = await prisma.ordenes.findMany({
        where: { cliente_id: id },
        orderBy: { fecha_creacion: 'desc' },
        take: 5,
        include: {
          order_items: {
            include: {
              service_plans: {
                include: {
                  servicios: true
                }
              }
            }
          }
        }
      });
      info.ordenes = ordenes;
      
      // Obtener suscripciones
      const suscripciones = await prisma.suscripciones.findMany({
        where: { cliente_id: id },
        orderBy: { fecha_inicio: 'desc' },
        take: 5,
        include: {
          servicios: true,
          service_plans: true
        }
      });
      info.suscripciones = suscripciones;
    }
    
    return info;
  } catch (error) {
    console.error('Error al obtener información de cuenta:', error);
    throw error;
  }
}

/**
 * Formatear información para enviar a Chatwoot
 * @param {Object} info - Información de la cuenta
 * @returns {string} - Mensaje formateado
 */
function formatearInformacionParaChatwoot(info) {
  let mensaje = '📋 **INFORMACIÓN DE CUENTA CUENTY**\n\n';
  
  mensaje += `✅ **Cliente Registrado**: ${info.tipo === 'usuario' ? 'Usuario' : 'Cliente'}\n\n`;
  
  mensaje += '**Datos Básicos:**\n';
  if (info.tipo === 'usuario') {
    mensaje += `- Celular: ${info.datos_basicos.celular}\n`;
    mensaje += `- Nombre: ${info.datos_basicos.nombre || 'No especificado'}\n`;
    mensaje += `- Email: ${info.datos_basicos.email || 'No especificado'}\n`;
    mensaje += `- Verificado: ${info.datos_basicos.verificado ? '✅ Sí' : '❌ No'}\n`;
    mensaje += `- Fecha de registro: ${new Date(info.datos_basicos.fecha_creacion).toLocaleDateString('es-MX')}\n`;
  } else {
    mensaje += `- ID: ${info.datos_basicos.id}\n`;
    mensaje += `- Nombre: ${info.datos_basicos.nombre} ${info.datos_basicos.apellido}\n`;
    mensaje += `- Email: ${info.datos_basicos.email}\n`;
    mensaje += `- Teléfono: ${info.datos_basicos.telefono || 'No especificado'}\n`;
    mensaje += `- WhatsApp: ${info.datos_basicos.whatsapp || 'No especificado'}\n`;
    mensaje += `- Estado: ${info.datos_basicos.activo ? '✅ Activo' : '❌ Inactivo'}\n`;
  }
  
  if (info.ordenes.length > 0) {
    mensaje += `\n**Órdenes Recientes (${info.ordenes.length}):**\n`;
    info.ordenes.forEach((orden, index) => {
      mensaje += `${index + 1}. Orden #${orden.id_orden} - ${orden.estado} - $${orden.monto_total}\n`;
      mensaje += `   Fecha: ${new Date(orden.fecha_creacion).toLocaleDateString('es-MX')}\n`;
    });
  }
  
  if (info.suscripciones && info.suscripciones.length > 0) {
    mensaje += `\n**Suscripciones Activas (${info.suscripciones.length}):**\n`;
    info.suscripciones.forEach((sub, index) => {
      mensaje += `${index + 1}. ${sub.servicios.nombre} - ${sub.estado}\n`;
      mensaje += `   Próxima renovación: ${new Date(sub.fecha_proxima_renovacion).toLocaleDateString('es-MX')}\n`;
    });
  }
  
  if (info.tickets.length > 0) {
    mensaje += `\n**Tickets de Soporte (${info.tickets.length}):**\n`;
    info.tickets.forEach((ticket, index) => {
      mensaje += `${index + 1}. #${ticket.id_ticket} - ${ticket.estado} - ${ticket.titulo_problema}\n`;
    });
  }
  
  return mensaje;
}

/**
 * Registrar interacción en base de datos
 */
async function registrarInteraccion(data) {
  try {
    // Aquí puedes agregar lógica para registrar la interacción
    // en una tabla dedicada si lo deseas
    console.log('📝 Interacción registrada:', {
      conversation_id: data.conversation_id,
      phone: data.phone,
      registrado: data.registrado,
      timestamp: new Date()
    });
  } catch (error) {
    console.error('Error al registrar interacción:', error);
  }
}

/**
 * Webhook principal para recibir eventos de Chatwoot
 */
exports.handleChatwootWebhook = async (req, res) => {
  try {
    const event = req.body;
    
    console.log('📨 Webhook de Chatwoot recibido:', {
      event_type: event.event,
      conversation_id: event.conversation?.id,
      message_type: event.message_type
    });
    
    // Solo procesar mensajes entrantes (del usuario, no del agente)
    if (event.event === 'message_created' && event.message_type === 'incoming') {
      const conversationId = event.conversation.id;
      const contactPhone = event.conversation.meta?.sender?.phone_number || 
                          event.conversation.meta?.sender?.identifier;
      
      if (!contactPhone) {
        console.log('⚠️ No se pudo extraer número de teléfono del evento');
        return res.status(200).json({ status: 'ok', message: 'Sin número de teléfono' });
      }
      
      console.log(`🔍 Buscando usuario con teléfono: ${contactPhone}`);
      
      // Buscar usuario en CUENTY
      const usuario = await buscarUsuarioPorTelefono(contactPhone);
      
      if (usuario) {
        console.log(`✅ Usuario encontrado en CUENTY (${usuario.tipo})`);
        
        // Obtener información completa
        const informacion = await obtenerInformacionCuenta(usuario);
        
        // Enviar nota privada al agente con la información
        const mensajeFormateado = formatearInformacionParaChatwoot(informacion);
        await chatwootService.sendPrivateNote(conversationId, mensajeFormateado);
        
        // Actualizar atributos personalizados de la conversación
        await chatwootService.updateConversationAttributes(conversationId, {
          cuenty_registrado: true,
          cuenty_tipo: usuario.tipo,
          cuenty_id: usuario.tipo === 'usuario' ? usuario.data.celular : usuario.data.id,
          cuenty_ordenes_total: informacion.ordenes.length,
          cuenty_ultima_orden: informacion.ordenes[0]?.id_orden || null
        });
        
        // Agregar etiqueta
        await chatwootService.addLabelsToConversation(conversationId, ['cuenty-registrado']);
        
        // Registrar interacción
        await registrarInteraccion({
          conversation_id: conversationId,
          phone: contactPhone,
          registrado: true,
          tipo: usuario.tipo
        });
        
      } else {
        console.log('❌ Usuario NO encontrado en CUENTY');
        
        // Enviar nota indicando que no está registrado
        await chatwootService.sendPrivateNote(
          conversationId,
          '⚠️ **Usuario NO registrado en CUENTY**\n\n' +
          `Número: ${contactPhone}\n` +
          'Este número no está registrado en la plataforma.'
        );
        
        // Actualizar atributos
        await chatwootService.updateConversationAttributes(conversationId, {
          cuenty_registrado: false
        });
        
        // Agregar etiqueta
        await chatwootService.addLabelsToConversation(conversationId, ['cuenty-no-registrado']);
        
        // Registrar interacción
        await registrarInteraccion({
          conversation_id: conversationId,
          phone: contactPhone,
          registrado: false
        });
      }
    }
    
    res.status(200).json({ status: 'ok' });
    
  } catch (error) {
    console.error('❌ Error al procesar webhook de Chatwoot:', error);
    res.status(500).json({ error: 'Error al procesar webhook' });
  }
};

/**
 * Endpoint manual para buscar información de un número
 */
exports.buscarInformacionManual = async (req, res) => {
  try {
    const { telefono } = req.body;
    
    if (!telefono) {
      return res.status(400).json({ error: 'Número de teléfono requerido' });
    }
    
    const usuario = await buscarUsuarioPorTelefono(telefono);
    
    if (!usuario) {
      return res.status(404).json({ 
        registrado: false,
        mensaje: 'Usuario no encontrado en CUENTY' 
      });
    }
    
    const informacion = await obtenerInformacionCuenta(usuario);
    
    res.json(informacion);
    
  } catch (error) {
    console.error('Error al buscar información:', error);
    res.status(500).json({ error: 'Error al buscar información' });
  }
};

/**
 * Endpoint para enviar mensaje desde CUENTY a Chatwoot
 */
exports.enviarMensajeChatwoot = async (req, res) => {
  try {
    const { conversationId, mensaje, esPrivado } = req.body;
    
    if (!conversationId || !mensaje) {
      return res.status(400).json({ error: 'conversationId y mensaje son requeridos' });
    }
    
    let resultado;
    
    if (esPrivado) {
      resultado = await chatwootService.sendPrivateNote(conversationId, mensaje);
    } else {
      resultado = await chatwootService.sendMessage(conversationId, mensaje);
    }
    
    res.json({ 
      success: true,
      mensaje: 'Mensaje enviado exitosamente',
      data: resultado 
    });
    
  } catch (error) {
    console.error('Error al enviar mensaje:', error);
    res.status(500).json({ error: 'Error al enviar mensaje' });
  }
};

/**
 * Endpoint de prueba para verificar la configuración
 */
exports.probarConfiguracion = async (req, res) => {
  try {
    if (!chatwootService.isConfigured()) {
      return res.status(500).json({
        configurado: false,
        error: 'Variables de entorno de Chatwoot no configuradas'
      });
    }
    
    res.json({
      configurado: true,
      mensaje: 'Integración con Chatwoot configurada correctamente',
      baseURL: chatwootService.baseURL,
      accountId: chatwootService.accountId
    });
    
  } catch (error) {
    console.error('Error al probar configuración:', error);
    res.status(500).json({ error: 'Error al probar configuración' });
  }
};

/**
 * ============================================
 * CHATWOOT AUTOMATION SERVICE
 * ============================================
 * Servicio de automatización usando Chatwoot para envío de mensajes
 * 
 * Funcionalidades:
 * - Envío de mensajes WhatsApp via Chatwoot
 * - Gestión de conversaciones automáticas
 * - Asignación automática de agentes
 * - Seguimiento de conversaciones
 */

const chatwootService = require('./chatwootService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

class ChatwootAutomationService {
  constructor() {
    this.chatwootService = chatwootService;
    this.contactConversations = new Map(); // Cache de conversaciones activas
  }

  /**
   * Enviar mensaje de WhatsApp usando Chatwoot
   * @param {string} phoneNumber - Número de teléfono del cliente
   * @param {string} message - Mensaje a enviar
   * @param {Object} metadata - Metadatos adicionales
   * @returns {Promise<Object>}
   */
  async sendWhatsAppMessage(phoneNumber, message, metadata = {}) {
    try {
      // Limpiar y formatear número de teléfono
      const cleanPhone = this.formatPhoneNumber(phoneNumber);
      
      // Buscar o crear contacto
      const contact = await this.findOrCreateContact(cleanPhone);
      if (!contact) {
        throw new Error(`No se pudo crear o encontrar contacto para ${cleanPhone}`);
      }

      // Buscar o crear conversación
      const conversation = await this.findOrCreateConversation(contact.id, metadata);
      
      // Enviar mensaje
      const messageResult = await this.chatwootService.sendMessage(
        conversation.id, 
        message, 
        'outgoing'
      );

      console.log(`✅ Mensaje enviado vía Chatwoot a ${cleanPhone}:`, messageResult.id);

      return {
        success: true,
        messageId: messageResult.id,
        conversationId: conversation.id,
        contactId: contact.id,
        status: 'sent'
      };

    } catch (error) {
      console.error(`❌ Error enviando mensaje vía Chatwoot a ${phoneNumber}:`, error.message);
      
      return {
        success: false,
        error: error.message,
        status: 'failed'
      };
    }
  }

  /**
   * Enviar mensaje de entrega de cuenta
   * @param {string} phoneNumber 
   * @param {Object} accountData 
   * @returns {Promise<Object>}
   */
  async sendAccountDelivery(phoneNumber, accountData) {
    const { service, plan, email, password, profile, pin, expiration } = accountData;
    
    const message = `🎉 ¡Tu cuenta de ${service} está lista!

📧 **Credenciales:**
• Email: ${email}
• Contraseña: ${password}
${profile ? `• Perfil: ${profile}` : ''}
${pin ? `• PIN: ${pin}` : ''}

📅 **Válido hasta:** ${new Date(expiration).toLocaleDateString('es-MX')}

💡 **Instrucciones:**
1. Accede a ${service}
2. Inicia sesión con las credenciales
3. Disfruta tu contenido favorito

¿Necesitas ayuda? Responde a este mensaje.`;

    const result = await this.sendWhatsAppMessage(phoneNumber, message, {
      type: 'account_delivery',
      service,
      plan,
      urgency: 'normal'
    });

    // Agregar etiquetas para seguimiento
    if (result.success) {
      await this.chatwootService.addLabelsToConversation(result.conversationId, [
        'cuenta-entregada',
        `servicio-${service.toLowerCase().replace(' ', '-')}`,
        'automatizado'
      ]);
    }

    return result;
  }

  /**
   * Enviar recordatorio de renovación
   * @param {string} phoneNumber 
   * @param {Object} renewalData 
   * @returns {Promise<Object>}
   */
  async sendRenewalReminder(phoneNumber, renewalData) {
    const { service, expirationDate, daysUntilExpiration } = renewalData;
    
    let message = `⏰ Recordatorio de renovación

Tu suscripción a ${service} vence en ${daysUntilExpiration} día${daysUntilExpiration !== 1 ? 's' : ''}.

📅 Fecha de vencimiento: ${new Date(expirationDate).toLocaleDateString('es-MX')}

💳 Para renovar:
• Accede a nuestro sitio web
• O responde a este mensaje con "RENOVAR"

¿Necesitas ayuda? Responde a este mensaje.`;

    const result = await this.sendWhatsAppMessage(phoneNumber, message, {
      type: 'renewal_reminder',
      service,
      daysUntilExpiration,
      urgency: daysUntilExpiration <= 3 ? 'high' : 'normal'
    });

    // Agregar etiquetas
    if (result.success) {
      await this.chatwootService.addLabelsToConversation(result.conversationId, [
        'renovacion-recordatorio',
        `servicio-${service.toLowerCase().replace(' ', '-')}`,
        'automatizado'
      ]);
    }

    return result;
  }

  /**
   * Enviar confirmación de pago
   * @param {string} phoneNumber 
   * @param {Object} paymentData 
   * @returns {Promise<Object>}
   */
  async sendPaymentConfirmation(phoneNumber, paymentData) {
    const { ordenId, service, amount, paymentMethod } = paymentData;
    
    const message = `✅ Pago confirmado

¡Gracias por tu compra!

🧾 **Detalles:**
• Orden: #${ordenId}
• Servicio: ${service}
• Monto: $${amount}
• Método: ${paymentMethod}

🔄 Tu cuenta será asignada automáticamente en unos minutos.

¿Necesitas ayuda? Responde a este mensaje.`;

    const result = await this.sendWhatsAppMessage(phoneNumber, message, {
      type: 'payment_confirmation',
      ordenId,
      service,
      amount,
      urgency: 'normal'
    });

    // Agregar etiquetas
    if (result.success) {
      await this.chatwootService.addLabelsToConversation(result.conversationId, [
        'pago-confirmado',
        `servicio-${service.toLowerCase().replace(' ', '-')}`,
        'automatizado'
      ]);
    }

    return result;
  }

  /**
   * Enviar bienvenida a nuevo cliente
   * @param {string} phoneNumber 
   * @param {Object} welcomeData 
   * @returns {Promise<Object>}
   */
  async sendWelcomeMessage(phoneNumber, welcomeData) {
    const { nombre, service } = welcomeData;
    
    const message = `🎉 ¡Bienvenido a CUENTY!

Hola ${nombre}, ¡gracias por confiar en nosotros!

📺 **¿Qué puedes hacer?**
• Acceder a las mejores plataformas de streaming
• Gestionar tus suscripciones fácilmente
• Recibir notificaciones automáticas

🎬 **Tu primer servicio:** ${service}

💬 ¿Tienes dudas? Responde a este mensaje y te ayudaremos.

¡Disfruta tu contenido favorito!`;

    const result = await this.sendWhatsAppMessage(phoneNumber, message, {
      type: 'welcome',
      nombre,
      service,
      urgency: 'normal'
    });

    // Agregar etiquetas
    if (result.success) {
      await this.chatwootService.addLabelsToConversation(result.conversationId, [
        'bienvenida',
        'nuevo-cliente',
        'automatizado'
      ]);
    }

    return result;
  }

  /**
   * Buscar o crear contacto por número de teléfono
   * @param {string} phoneNumber 
   * @returns {Promise<Object>}
   */
  async findOrCreateContact(phoneNumber) {
    try {
      // Buscar contacto existente
      let contact = await this.chatwootService.searchContactByPhone(phoneNumber);
      
      if (contact) {
        return contact;
      }

      // Crear nuevo contacto
      const contactData = {
        name: `Cliente ${phoneNumber}`,
        phone_number: phoneNumber,
        custom_attributes: {
          source: 'automatizacion',
          created_via: 'api'
        }
      };

      const response = await this.chatwootService.api.post(
        `/api/v1/accounts/${this.chatwootService.accountId}/contacts`,
        contactData
      );

      console.log(`👤 Nuevo contacto creado para ${phoneNumber}`);
      return response.data;

    } catch (error) {
      console.error(`❌ Error gestionando contacto ${phoneNumber}:`, error.message);
      return null;
    }
  }

  /**
   * Buscar o crear conversación para un contacto
   * @param {number} contactId 
   * @param {Object} metadata 
   * @returns {Promise<Object>}
   */
  async findOrCreateConversation(contactId, metadata = {}) {
    try {
      // Buscar conversación activa
      const cacheKey = `${contactId}`;
      if (this.contactConversations.has(cacheKey)) {
        return this.contactConversations.get(cacheKey);
      }

      // Obtener conversaciones del contacto
      const response = await this.chatwootService.api.get(
        `/api/v1/accounts/${this.chatwootService.accountId}/contacts/${contactId}/conversations`
      );

      let conversation = null;
      
      // Buscar conversación abierta o pendiente
      if (response.data.payload && response.data.payload.length > 0) {
        conversation = response.data.payload.find(conv => 
          conv.status === 'open' || conv.status === 'pending'
        );
      }

      // Si no existe conversación activa, crear una nueva
      if (!conversation) {
        const conversationData = {
          contact_id: contactId,
          inbox_id: process.env.CHATWOOT_INBOX_ID, // ID de la bandeja de entrada de WhatsApp
          custom_attributes: metadata
        };

        const createResponse = await this.chatwootService.api.post(
          `/api/v1/accounts/${this.chatwootService.accountId}/conversations`,
          conversationData
        );

        conversation = createResponse.data;
        console.log(`💬 Nueva conversación creada: ${conversation.id}`);
      }

      // Guardar en cache
      this.contactConversations.set(cacheKey, conversation);
      
      return conversation;

    } catch (error) {
      console.error(`❌ Error gestionando conversación para contacto ${contactId}:`, error.message);
      throw error;
    }
  }

  /**
   * Formatear número de teléfono
   * @param {string} phone 
   * @returns {string}
   */
  formatPhoneNumber(phone) {
    // Remover caracteres especiales
    let cleanPhone = phone.replace(/[^\d]/g, '');
    
    // Si no tiene código de país, agregar +52 (México)
    if (cleanPhone.length === 10) {
      cleanPhone = '52' + cleanPhone;
    }
    
    // Asegurar que tenga el formato correcto
    if (!cleanPhone.startsWith('+')) {
      cleanPhone = '+' + cleanPhone;
    }
    
    return cleanPhone;
  }

  /**
   * Asignar conversación a agente automáticamente
   * @param {number} conversationId 
   * @param {string} serviceType 
   * @returns {Promise<Object>}
   */
  async autoAssignConversation(conversationId, serviceType) {
    try {
      // Lógica simple de asignación - se puede mejorar con round-robin
      const availableAgents = await this.getAvailableAgents();
      
      if (availableAgents.length === 0) {
        console.log(`⚠️ No hay agentes disponibles para conversación ${conversationId}`);
        return { success: false, error: 'No hay agentes disponibles' };
      }

      // Seleccionar agente (puede ser round-robin, load balancing, etc.)
      const selectedAgent = availableAgents[0]; // Por simplicidad, tomar el primero
      
      const result = await this.chatwootService.assignConversation(
        conversationId, 
        selectedAgent.id
      );

      console.log(`👤 Conversación ${conversationId} asignada a agente ${selectedAgent.name}`);
      
      return {
        success: true,
        agentId: selectedAgent.id,
        agentName: selectedAgent.name,
        conversationId
      };

    } catch (error) {
      console.error(`❌ Error asignando conversación ${conversationId}:`, error.message);
      return { success: false, error: error.message };
    }
  }

  /**
   * Obtener agentes disponibles (placeholder - implementar según necesidades)
   * @returns {Promise<Array>}
   */
  async getAvailableAgents() {
    try {
      // TODO: Implementar lógica real de agentes disponibles
      // Por ahora retornamos un agente por defecto
      return [
        {
          id: 1, // ID del agente por defecto
          name: 'Auto-Assign'
        }
      ];
    } catch (error) {
      console.error('❌ Error obteniendo agentes disponibles:', error.message);
      return [];
    }
  }

  /**
   * Validar configuración del servicio
   * @returns {Object}
   */
  validateConfiguration() {
    const issues = [];
    
    if (!this.chatwootService.isConfigured()) {
      issues.push('Chatwoot no está configurado correctamente');
    }
    
    if (!process.env.CHATWOOT_INBOX_ID) {
      issues.push('CHATWOOT_INBOX_ID no configurado');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      configured: this.chatwootService.isConfigured()
    };
  }

  /**
   * Limpiar cache de conversaciones
   */
  clearCache() {
    this.contactConversations.clear();
    console.log('🧹 Cache de conversaciones limpiado');
  }

  /**
   * Obtener estadísticas del servicio
   * @returns {Promise<Object>}
   */
  async getServiceStats() {
    try {
      const cacheSize = this.contactConversations.size;
      const config = this.validateConfiguration();
      
      return {
        cacheSize,
        configured: config.configured,
        issues: config.issues,
        uptime: process.uptime()
      };
    } catch (error) {
      return {
        error: error.message,
        cacheSize: this.contactConversations.size
      };
    }
  }
}

// Exportar instancia singleton
module.exports = new ChatwootAutomationService();
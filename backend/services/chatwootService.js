
/**
 * ============================================
 * CHATWOOT SERVICE
 * ============================================
 * Servicio para interactuar con la API de Chatwoot
 * 
 * Funcionalidades:
 * - Enviar mensajes
 * - Actualizar conversaciones
 * - Obtener información de contactos
 * - Gestionar etiquetas
 */

const axios = require('axios');

class ChatwootService {
  constructor() {
    this.baseURL = process.env.CHATWOOT_URL;
    this.apiToken = process.env.CHATWOOT_API_TOKEN;
    this.accountId = process.env.CHATWOOT_ACCOUNT_ID;
    
    if (!this.baseURL || !this.apiToken || !this.accountId) {
      console.warn('⚠️ Advertencia: Variables de entorno de Chatwoot no configuradas');
    }
    
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        'api_access_token': this.apiToken,
        'Content-Type': 'application/json'
      }
    });
  }

  /**
   * Enviar un mensaje a una conversación
   * @param {number} conversationId - ID de la conversación
   * @param {string} content - Contenido del mensaje
   * @param {string} messageType - Tipo de mensaje (outgoing, incoming)
   * @returns {Promise<Object>} - Datos del mensaje enviado
   */
  async sendMessage(conversationId, content, messageType = 'outgoing') {
    try {
      const response = await this.api.post(
        `/api/v1/accounts/${this.accountId}/conversations/${conversationId}/messages`,
        {
          content,
          message_type: messageType,
          private: false
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error al enviar mensaje a Chatwoot:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Enviar mensaje privado (nota interna)
   * @param {number} conversationId - ID de la conversación
   * @param {string} content - Contenido de la nota
   * @returns {Promise<Object>} - Datos de la nota enviada
   */
  async sendPrivateNote(conversationId, content) {
    try {
      const response = await this.api.post(
        `/api/v1/accounts/${this.accountId}/conversations/${conversationId}/messages`,
        {
          content,
          message_type: 'outgoing',
          private: true
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error al enviar nota privada:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Actualizar atributos personalizados de una conversación
   * @param {number} conversationId - ID de la conversación
   * @param {Object} customAttributes - Atributos personalizados
   * @returns {Promise<Object>} - Datos de la conversación actualizada
   */
  async updateConversationAttributes(conversationId, customAttributes) {
    try {
      const response = await this.api.post(
        `/api/v1/accounts/${this.accountId}/conversations/${conversationId}/custom_attributes`,
        {
          custom_attributes: customAttributes
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar atributos:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Actualizar estado de una conversación
   * @param {number} conversationId - ID de la conversación
   * @param {string} status - Estado (open, resolved, pending)
   * @returns {Promise<Object>} - Datos de la conversación actualizada
   */
  async updateConversationStatus(conversationId, status) {
    try {
      const response = await this.api.post(
        `/api/v1/accounts/${this.accountId}/conversations/${conversationId}/toggle_status`,
        {
          status
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar estado:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Agregar etiquetas a una conversación
   * @param {number} conversationId - ID de la conversación
   * @param {Array<string>} labels - Array de etiquetas
   * @returns {Promise<Object>} - Datos de la conversación actualizada
   */
  async addLabelsToConversation(conversationId, labels) {
    try {
      const response = await this.api.post(
        `/api/v1/accounts/${this.accountId}/conversations/${conversationId}/labels`,
        {
          labels
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error al agregar etiquetas:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtener información de una conversación
   * @param {number} conversationId - ID de la conversación
   * @returns {Promise<Object>} - Datos de la conversación
   */
  async getConversation(conversationId) {
    try {
      const response = await this.api.get(
        `/api/v1/accounts/${this.accountId}/conversations/${conversationId}`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener conversación:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Obtener contacto por ID
   * @param {number} contactId - ID del contacto
   * @returns {Promise<Object>} - Datos del contacto
   */
  async getContact(contactId) {
    try {
      const response = await this.api.get(
        `/api/v1/accounts/${this.accountId}/contacts/${contactId}`
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error al obtener contacto:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Buscar contacto por número de teléfono
   * @param {string} phoneNumber - Número de teléfono
   * @returns {Promise<Object|null>} - Datos del contacto o null si no existe
   */
  async searchContactByPhone(phoneNumber) {
    try {
      const response = await this.api.get(
        `/api/v1/accounts/${this.accountId}/contacts/search`,
        {
          params: { q: phoneNumber }
        }
      );
      
      if (response.data.payload && response.data.payload.length > 0) {
        return response.data.payload[0];
      }
      return null;
    } catch (error) {
      console.error('❌ Error al buscar contacto:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Actualizar atributos personalizados de un contacto
   * @param {number} contactId - ID del contacto
   * @param {Object} customAttributes - Atributos personalizados
   * @returns {Promise<Object>} - Datos del contacto actualizado
   */
  async updateContactAttributes(contactId, customAttributes) {
    try {
      const response = await this.api.put(
        `/api/v1/accounts/${this.accountId}/contacts/${contactId}`,
        {
          custom_attributes: customAttributes
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error al actualizar contacto:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Asignar conversación a un agente
   * @param {number} conversationId - ID de la conversación
   * @param {number} agentId - ID del agente (0 para sin asignar)
   * @returns {Promise<Object>} - Datos de la conversación actualizada
   */
  async assignConversation(conversationId, agentId) {
    try {
      const response = await this.api.post(
        `/api/v1/accounts/${this.accountId}/conversations/${conversationId}/assignments`,
        {
          assignee_id: agentId
        }
      );
      return response.data;
    } catch (error) {
      console.error('❌ Error al asignar conversación:', error.response?.data || error.message);
      throw error;
    }
  }

  /**
   * Validar que el servicio esté configurado correctamente
   * @returns {boolean} - true si está configurado, false si no
   */
  isConfigured() {
    return !!(this.baseURL && this.apiToken && this.accountId);
  }
}

// Exportar instancia singleton
module.exports = new ChatwootService();

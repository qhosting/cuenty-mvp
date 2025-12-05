/**
 * ============================================
 * EMAIL SERVICE - CUENTY MVP
 * ============================================
 * Servicio de emails transaccionales usando SendGrid
 * 
 * Funcionalidades:
 * - Envío de emails con templates
 * - Emails de bienvenida, confirmación, entrega
 * - Recordatorios de renovación
 * - Configuración avanzada de templates
 */

const axios = require('axios');

class EmailService {
  constructor() {
    this.sendgridApiKey = process.env.SENDGRID_API_KEY;
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@cuenty.com';
    this.fromName = process.env.FROM_NAME || 'CUENTY';
    this.baseURL = 'https://api.sendgrid.com/v3';
    
    if (!this.sendgridApiKey) {
      console.warn('⚠️ Advertencia: SENDGRID_API_KEY no configurado');
    }
  }

  /**
   * Enviar email con template personalizado
   * @param {string} to 
   * @param {string} subject 
   * @param {string} htmlContent 
   * @param {string} textContent 
   * @param {Object} categories 
   * @returns {Promise<Object>}
   */
  async sendEmail(to, subject, htmlContent, textContent = '', categories = []) {
    try {
      const emailData = {
        personalizations: [
          {
            to: [{ email: to }],
            subject: subject
          }
        ],
        from: { 
          email: this.fromEmail, 
          name: this.fromName 
        },
        content: []
      };

      // Agregar contenido de texto si se proporciona
      if (textContent) {
        emailData.content.push({
          type: 'text/plain',
          value: textContent
        });
      }

      // Agregar contenido HTML (siempre presente)
      emailData.content.push({
        type: 'text/html',
        value: htmlContent
      });

      // Agregar categorías para tracking
      if (categories.length > 0) {
        emailData.categories = categories;
      }

      const response = await axios.post(`${this.baseURL}/mail/send`, emailData, {
        headers: {
          'Authorization': `Bearer ${this.sendgridApiKey}`,
          'Content-Type': 'application/json'
        }
      });

      console.log(`✅ Email enviado a ${to}:`, response.status);
      return { 
        success: true, 
        messageId: response.headers['x-message-id'],
        status: response.status
      };

    } catch (error) {
      console.error(`❌ Error enviando email a ${to}:`, error.response?.data || error.message);
      return { 
        success: false, 
        error: error.message,
        status: error.response?.status
      };
    }
  }

  /**
   * Enviar email de bienvenida a nuevo cliente
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async sendWelcomeEmail(data) {
    const { to, nombre, celular, servicios = [] } = data;
    const subject = '¡Bienvenido a CUENTY! 🎉 Tu plataforma de streaming';
    
    const htmlContent = this.generateWelcomeEmail({ nombre, celular, servicios });
    const textContent = this.generateWelcomeEmailText({ nombre, celular, servicios });
    
    const result = await this.sendEmail(
      to, 
      subject, 
      htmlContent, 
      textContent,
      ['bienvenida', 'automatizado', 'nuevo-cliente']
    );

    if (result.success) {
      console.log(`📧 Email de bienvenida enviado a ${to}`);
    }

    return result;
  }

  /**
   * Enviar confirmación de pago
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async sendPaymentConfirmation(data) {
    const { to, orden, cliente } = data;
    const subject = `Pago confirmado - Orden #${orden.id_orden}`;
    
    const htmlContent = this.generatePaymentConfirmationEmail({ orden, cliente });
    const textContent = this.generatePaymentConfirmationEmailText({ orden, cliente });
    
    const result = await this.sendEmail(
      to, 
      subject, 
      htmlContent, 
      textContent,
      ['pago-confirmado', 'automatizado', `orden-${orden.id_orden}`]
    );

    if (result.success) {
      console.log(`📧 Email de confirmación de pago enviado a ${to}`);
    }

    return result;
  }

  /**
   * Enviar entrega de cuenta
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async sendAccountDelivery(data) {
    const { to, account } = data;
    const subject = `🎬 Tu cuenta de ${account.service} está lista - Credenciales incluidas`;
    
    const htmlContent = this.generateAccountDeliveryEmail({ account });
    const textContent = this.generateAccountDeliveryEmailText({ account });
    
    const result = await this.sendEmail(
      to, 
      subject, 
      htmlContent, 
      textContent,
      ['cuenta-entregada', 'automatizado', `servicio-${account.service.toLowerCase().replace(' ', '-')}`]
    );

    if (result.success) {
      console.log(`📧 Email de entrega de cuenta enviado a ${to}`);
    }

    return result;
  }

  /**
   * Enviar recordatorio de renovación
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async sendRenewalReminder(data) {
    const { to, suscripcion, service } = data;
    const diasRestantes = Math.ceil(
      (new Date(suscripcion.fecha_proxima_renovacion) - new Date()) / (1000 * 60 * 60 * 24)
    );
    
    const subject = `⏰ Tu suscripción a ${service} vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}`;
    
    const htmlContent = this.generateRenewalReminderEmail({ suscripcion, service, diasRestantes });
    const textContent = this.generateRenewalReminderEmailText({ suscripcion, service, diasRestantes });
    
    const result = await this.sendEmail(
      to, 
      subject, 
      htmlContent, 
      textContent,
      ['recordatorio-renovacion', 'automatizado', `servicio-${service.toLowerCase().replace(' ', '-')}`]
    );

    if (result.success) {
      console.log(`📧 Email de recordatorio enviado a ${to}`);
    }

    return result;
  }

  /**
   * Enviar confirmación de renovación exitosa
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async sendRenewalConfirmation(data) {
    const { to, suscripcion, service } = data;
    const subject = `✅ Renovación exitosa - ${service}`;
    
    const htmlContent = this.generateRenewalConfirmationEmail({ suscripcion, service });
    const textContent = this.generateRenewalConfirmationEmailText({ suscripcion, service });
    
    const result = await this.sendEmail(
      to, 
      subject, 
      htmlContent, 
      textContent,
      ['renovacion-confirmada', 'automatizado', `servicio-${service.toLowerCase().replace(' ', '-')}`]
    );

    if (result.success) {
      console.log(`📧 Email de confirmación de renovación enviado a ${to}`);
    }

    return result;
  }

  /**
   * Enviar reporte de estado de cuenta
   * @param {Object} data 
   * @returns {Promise<Object>}
   */
  async sendAccountStatement(data) {
    const { to, cliente, suscripciones } = data;
    const subject = '📊 Tu estado de cuenta CUENTY';
    
    const htmlContent = this.generateAccountStatementEmail({ cliente, suscripciones });
    const textContent = this.generateAccountStatementEmailText({ cliente, suscripciones });
    
    const result = await this.sendEmail(
      to, 
      subject, 
      htmlContent, 
      textContent,
      ['estado-cuenta', 'automatizado']
    );

    if (result.success) {
      console.log(`📧 Email de estado de cuenta enviado a ${to}`);
    }

    return result;
  }

  /**
   * Generar template de bienvenida HTML
   */
  generateWelcomeEmail({ nombre, celular, servicios }) {
    const serviciosList = servicios.map(s => `<li>🎬 <strong>${s}</strong></li>`).join('');
    
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Bienvenido a CUENTY</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8fafc;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); padding: 30px; border-radius: 15px 15px 0 0; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">¡Bienvenido a CUENTY!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Tu plataforma de suscripciones de streaming</p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <h2 style="color: #1e293b; margin-top: 0; font-size: 22px;">¡Hola ${nombre}! 👋</h2>
            
            <p style="font-size: 16px; color: #4b5563; margin-bottom: 25px;">
                ¡Gracias por registrarte en CUENTY! Estamos emocionados de tenerte como parte de nuestra comunidad de streaming.
            </p>
            
            <!-- Services -->
            ${servicios.length > 0 ? `
            <div style="background: #f0f9ff; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #3b82f6;">
                <h3 style="color: #1e40af; margin-top: 0;">🎯 Tus servicios disponibles:</h3>
                <ul style="color: #1e40af; margin: 0; padding-left: 20px;">
                    ${serviciosList}
                </ul>
            </div>
            ` : ''}
            
            <!-- Features -->
            <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
                <h3 style="color: #374151; margin-top: 0;">¿Qué puedes hacer en CUENTY?</h3>
                <div style="display: grid; gap: 15px;">
                    <div style="display: flex; align-items: center;">
                        <span style="background: #10b981; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0;">1</span>
                        <span style="color: #4b5563;">🎬 Acceder a las mejores plataformas de streaming</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <span style="background: #3b82f6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0;">2</span>
                        <span style="color: #4b5563;">💳 Gestionar tus suscripciones de forma fácil</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <span style="background: #8b5cf6; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0;">3</span>
                        <span style="color: #4b5563;">📱 Recibir notificaciones automáticas</span>
                    </div>
                    <div style="display: flex; align-items: center;">
                        <span style="background: #f59e0b; color: white; border-radius: 50%; width: 30px; height: 30px; display: flex; align-items: center; justify-content: center; font-weight: bold; margin-right: 15px; flex-shrink: 0;">4</span>
                        <span style="color: #4b5563;">🎯 Disfrutar de contenido de calidad</span>
                    </div>
                </div>
            </div>
            
            <!-- Contact Info -->
            <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; margin-top: 0;">📞 Información de contacto</h3>
                <p style="color: #451a03; margin: 0;">
                    <strong>WhatsApp:</strong> ${celular}<br>
                    <strong>Email:</strong> ${this.fromEmail}
                </p>
                <p style="color: #92400e; margin: 10px 0 0 0; font-size: 14px;">
                    💡 Guarda nuestro WhatsApp para recibir todas tus notificaciones automáticas
                </p>
            </div>
            
            <!-- CTA -->
            <div style="text-align: center; margin: 30px 0;">
                <a href="#" style="display: inline-block; background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%); color: white; padding: 15px 30px; border-radius: 25px; text-decoration: none; font-weight: bold; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
                    🚀 Explorar Servicios
                </a>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">© 2025 CUENTY. Todos los derechos reservados.</p>
            <p style="margin: 5px 0 0 0;">Tu satisfacción es nuestra prioridad 💜</p>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Generar template de bienvenida texto
   */
  generateWelcomeEmailText({ nombre, celular, servicios }) {
    const serviciosText = servicios.length > 0 ? `\n\nTus servicios disponibles:\n${servicios.map(s => `- ${s}`).join('\n')}` : '';
    
    return `¡Bienvenido a CUENTY!

Hola ${nombre},

¡Gracias por registrarte en CUENTY! Estamos emocionados de tenerte como parte de nuestra comunidad de streaming.

¿Qué puedes hacer en CUENTY?
• Acceder a las mejores plataformas de streaming
• Gestionar tus suscripciones de forma fácil  
• Recibir notificaciones automáticas
• Disfrutar de contenido de calidad${serviciosText}

Información de contacto:
WhatsApp: ${celular}
Email: ${this.fromEmail}

💡 Guarda nuestro WhatsApp para recibir todas tus notificaciones automáticas

© 2025 CUENTY. Tu satisfacción es nuestra prioridad.`;
  }

  /**
   * Generar template de entrega de cuenta HTML
   */
  generateAccountDeliveryEmail({ account }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Tu cuenta de ${account.service} está lista</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f0fdf4;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 30px; border-radius: 15px 15px 0 0; text-align: center; color: white;">
            <h1 style="margin: 0; font-size: 28px; font-weight: bold;">🎉 ¡Tu cuenta está lista!</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Accede ahora a ${account.service}</p>
        </div>
        
        <!-- Content -->
        <div style="background: white; padding: 30px; border-radius: 0 0 15px 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
            <!-- Credentials -->
            <div style="background: #f0fdf4; padding: 25px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #10b981;">
                <h2 style="color: #065f46; margin-top: 0;">📧 Credenciales de acceso</h2>
                
                <table style="width: 100%; margin: 15px 0; border-collapse: collapse;">
                    <tr>
                        <td style="padding: 12px 0; font-weight: bold; color: #065f46; width: 120px; border-bottom: 1px solid #d1fae5;">Email:</td>
                        <td style="padding: 12px 0; color: #374151; border-bottom: 1px solid #d1fae5;">
                            <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace;">${account.email}</code>
                        </td>
                    </tr>
                    <tr>
                        <td style="padding: 12px 0; font-weight: bold; color: #065f46; border-bottom: 1px solid #d1fae5;">Contraseña:</td>
                        <td style="padding: 12px 0; color: #374151; border-bottom: 1px solid #d1fae5;">
                            <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace;">${account.password}</code>
                        </td>
                    </tr>
                    ${account.profile ? `
                    <tr>
                        <td style="padding: 12px 0; font-weight: bold; color: #065f46; border-bottom: 1px solid #d1fae5;">Perfil:</td>
                        <td style="padding: 12px 0; color: #374151; border-bottom: 1px solid #d1fae5;">${account.profile}</td>
                    </tr>
                    ` : ''}
                    ${account.pin ? `
                    <tr>
                        <td style="padding: 12px 0; font-weight: bold; color: #065f46; border-bottom: 1px solid #d1fae5;">PIN:</td>
                        <td style="padding: 12px 0; color: #374151; border-bottom: 1px solid #d1fae5;">
                            <code style="background: #f3f4f6; padding: 4px 8px; border-radius: 4px; font-family: 'Courier New', monospace;">${account.pin}</code>
                        </td>
                    </tr>
                    ` : ''}
                    <tr>
                        <td style="padding: 12px 0; font-weight: bold; color: #065f46;">Válido hasta:</td>
                        <td style="padding: 12px 0; color: #374151; font-weight: 600;">${new Date(account.expiration).toLocaleDateString('es-MX', { 
                          weekday: 'long', 
                          year: 'numeric', 
                          month: 'long', 
                          day: 'numeric' 
                        })}</td>
                    </tr>
                </table>
            </div>
            
            <!-- Instructions -->
            <div style="background: #fef3c7; padding: 20px; border-radius: 10px; margin: 20px 0; border-left: 4px solid #f59e0b;">
                <h3 style="color: #92400e; margin-top: 0;">💡 Instrucciones de uso</h3>
                <ol style="color: #451a03; margin: 0; padding-left: 20px;">
                    <li style="margin-bottom: 8px;">Ve a <strong>${account.service}</strong></li>
                    <li style="margin-bottom: 8px;">Haz clic en "Iniciar sesión" o "Login"</li>
                    <li style="margin-bottom: 8px;">Introduce las credenciales que aparecen arriba</li>
                    <li style="margin-bottom: 0;">¡Disfruta de tu contenido favorito! 🎬</li>
                </ol>
            </div>
            
            <!-- Support -->
            <div style="background: #ede9fe; padding: 20px; border-radius: 10px; margin: 20px 0; text-align: center;">
                <h3 style="color: #7c3aed; margin-top: 0;">🆘 ¿Problemas para acceder?</h3>
                <p style="color: #5b21b6; margin: 0; font-size: 16px;">
                    <strong>Responde a nuestro WhatsApp</strong> y te ayudaremos inmediatamente.
                </p>
                <p style="color: #7c3aed; margin: 10px 0 0 0; font-size: 14px;">
                    Nuestro equipo está disponible 24/7 para resolver cualquier inconveniente.
                </p>
            </div>
        </div>
        
        <!-- Footer -->
        <div style="text-align: center; margin-top: 20px; padding: 20px; color: #6b7280; font-size: 14px;">
            <p style="margin: 0;">© 2025 CUENTY. Tu satisfacción es nuestra prioridad 💜</p>
        </div>
    </body>
    </html>
    `;
  }

  /**
   * Generar template de entrega de cuenta texto
   */
  generateAccountDeliveryEmailText({ account }) {
    return `¡Tu cuenta de ${account.service} está lista!

📧 CREDENCIALES DE ACCESO:

Email: ${account.email}
Contraseña: ${account.password}
${account.profile ? `Perfil: ${account.profile}` : ''}
${account.pin ? `PIN: ${account.pin}` : ''}
Válido hasta: ${new Date(account.expiration).toLocaleDateString('es-MX')}

💡 INSTRUCCIONES:
1. Ve a ${account.service}
2. Haz clic en "Iniciar sesión"
3. Introduce las credenciales que aparecen arriba
4. ¡Disfruta de tu contenido favorito!

🆘 ¿PROBLEMAS PARA ACCEDER?
Responde a nuestro WhatsApp y te ayudaremos inmediatamente.

© 2025 CUENTY. Tu satisfacción es nuestra prioridad.`;
  }

  /**
   * Generar template de confirmación de pago HTML
   */
  generatePaymentConfirmationEmail({ orden, cliente }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Pago confirmado - Orden #${orden.id_orden}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin-bottom: 10px;">✅ Pago Confirmado</h1>
            <p style="font-size: 18px; color: #666;">¡Gracias por tu compra!</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #065f46; margin-top: 0;">Detalles de tu orden</h2>
            <p><strong>Orden:</strong> #${orden.id_orden}</p>
            <p><strong>Cliente:</strong> ${cliente?.nombre || 'N/A'}</p>
            <p><strong>Monto:</strong> $${orden.monto_total}</p>
            <p><strong>Método de pago:</strong> ${orden.metodo_pago}</p>
            <p><strong>Fecha:</strong> ${new Date(orden.fecha_pago).toLocaleDateString('es-MX')}</p>
        </div>
        
        <div style="background: #fef3c7; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #92400e;"><strong>🔄 Próximo paso:</strong> Tu cuenta será asignada automáticamente en unos minutos.</p>
        </div>
        
        <footer style="text-align: center; margin-top: 30px; color: #9ca3af;">
            <p>© 2025 CUENTY</p>
        </footer>
    </body>
    </html>
    `;
  }

  /**
   * Generar template de confirmación de pago texto
   */
  generatePaymentConfirmationEmailText({ orden, cliente }) {
    return `Pago Confirmado - Orden #${orden.id_orden}

¡Gracias por tu compra!

DETALLES DE TU ORDEN:
Orden: #${orden.id_orden}
Cliente: ${cliente?.nombre || 'N/A'}
Monto: $${orden.monto_total}
Método de pago: ${orden.metodo_pago}
Fecha: ${new Date(orden.fecha_pago).toLocaleDateString('es-MX')}

🔄 PRÓXIMO PASO:
Tu cuenta será asignada automáticamente en unos minutos.

© 2025 CUENTY`;
  }

  /**
   * Generar template de recordatorio de renovación HTML
   */
  generateRenewalReminderEmail({ suscripcion, service, diasRestantes }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Recordatorio de renovación - ${service}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #f59e0b; margin-bottom: 10px;">⏰ Recordatorio de Renovación</h1>
            <p style="font-size: 18px; color: #666;">Tu suscripción vence pronto</p>
        </div>
        
        <div style="background: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #92400e; margin-top: 0;">Detalles de renovación</h2>
            <p><strong>Servicio:</strong> ${service}</p>
            <p><strong>Días restantes:</strong> ${diasRestantes}</p>
            <p><strong>Fecha de vencimiento:</strong> ${new Date(suscripcion.fecha_proxima_renovacion).toLocaleDateString('es-MX')}</p>
        </div>
        
        <div style="background: #ede9fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #7c3aed;"><strong>💳 Para renovar:</strong> Accede a nuestro sitio web o responde a nuestro WhatsApp.</p>
        </div>
        
        <footer style="text-align: center; margin-top: 30px; color: #9ca3af;">
            <p>© 2025 CUENTY</p>
        </footer>
    </body>
    </html>
    `;
  }

  /**
   * Generar template de recordatorio de renovación texto
   */
  generateRenewalReminderEmailText({ service, diasRestantes, fechaVencimiento }) {
    return `Recordatorio de Renovación - ${service}

Tu suscripción vence en ${diasRestantes} día${diasRestantes !== 1 ? 's' : ''}.

DETALLES:
Servicio: ${service}
Fecha de vencimiento: ${new Date(fechaVencimiento).toLocaleDateString('es-MX')}

💳 PARA RENOVAR:
Accede a nuestro sitio web o responde a nuestro WhatsApp.

© 2025 CUENTY`;
  }

  /**
   * Generar template de confirmación de renovación HTML
   */
  generateRenewalConfirmationEmail({ suscripcion, service }) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Renovación exitosa - ${service}</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #10b981; margin-bottom: 10px;">🎉 ¡Renovación Exitosa!</h1>
            <p style="font-size: 18px; color: #666;">Tu suscripción ha sido renovada automáticamente</p>
        </div>
        
        <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #065f46; margin-top: 0;">Detalles de renovación</h2>
            <p><strong>Servicio:</strong> ${service}</p>
            <p><strong>Nueva fecha de vencimiento:</strong> ${new Date(suscripcion.fecha_proxima_renovacion).toLocaleDateString('es-MX')}</p>
            <p><strong>Estado:</strong> Activa ✅</p>
        </div>
        
        <div style="background: #ede9fe; padding: 15px; border-radius: 8px; margin: 20px 0;">
            <p style="margin: 0; color: #7c3aed;"><strong>✅ El servicio continuará sin interrupciones.</strong></p>
        </div>
        
        <footer style="text-align: center; margin-top: 30px; color: #9ca3af;">
            <p>© 2025 CUENTY</p>
        </footer>
    </body>
    </html>
    `;
  }

  /**
   * Generar template de confirmación de renovación texto
   */
  generateRenewalConfirmationEmailText({ service, fechaVencimiento }) {
    return `¡Renovación Exitosa! - ${service}

Tu suscripción ha sido renovada automáticamente.

DETALLES:
Servicio: ${service}
Nueva fecha de vencimiento: ${new Date(fechaVencimiento).toLocaleDateString('es-MX')}
Estado: Activa ✅

✅ El servicio continuará sin interrupciones.

© 2025 CUENTY`;
  }

  /**
   * Generar template de estado de cuenta HTML
   */
  generateAccountStatementEmail({ cliente, suscripciones }) {
    const suscripcionesList = suscripciones.map(s => 
      `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.service}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.plan}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${s.estado}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e5e7eb;">${new Date(s.fechaVencimiento).toLocaleDateString('es-MX')}</td>
      </tr>`
    ).join('');

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <title>Estado de Cuenta - CUENTY</title>
    </head>
    <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #6366f1; margin-bottom: 10px;">📊 Tu Estado de Cuenta</h1>
            <p style="font-size: 18px; color: #666;">Hola ${cliente.nombre}</p>
        </div>
        
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #1e293b; margin-top: 0;">Tus suscripciones activas</h2>
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: #e2e8f0;">
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #cbd5e1;">Servicio</th>
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #cbd5e1;">Plan</th>
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #cbd5e1;">Estado</th>
                        <th style="padding: 8px; text-align: left; border-bottom: 2px solid #cbd5e1;">Vencimiento</th>
                    </tr>
                </thead>
                <tbody>
                    ${suscripcionesList}
                </tbody>
            </table>
        </div>
        
        <footer style="text-align: center; margin-top: 30px; color: #9ca3af;">
            <p>© 2025 CUENTY</p>
        </footer>
    </body>
    </html>
    `;
  }

  /**
   * Generar template de estado de cuenta texto
   */
  generateAccountStatementEmailText({ cliente, suscripciones }) {
    const suscripcionesText = suscripciones.map(s => 
      `- ${s.service} (${s.plan}): ${s.estado} - Vence: ${new Date(s.fechaVencimiento).toLocaleDateString('es-MX')}`
    ).join('\n');

    return `Estado de Cuenta - CUENTY

Hola ${cliente.nombre},

TUS SUSCRIPCIONES ACTIVAS:
${suscripcionesText}

© 2025 CUENTY`;
  }

  /**
   * Validar configuración del servicio
   * @returns {Object}
   */
  validateConfiguration() {
    const issues = [];
    
    if (!this.sendgridApiKey) {
      issues.push('SENDGRID_API_KEY no configurado');
    }
    
    if (!this.fromEmail) {
      issues.push('FROM_EMAIL no configurado');
    }
    
    return {
      isValid: issues.length === 0,
      issues,
      configured: !!this.sendgridApiKey
    };
  }

  /**
   * Obtener estadísticas del servicio
   * @returns {Object}
   */
  getServiceStats() {
    const config = this.validateConfiguration();
    
    return {
      configured: config.configured,
      issues: config.issues,
      fromEmail: this.fromEmail,
      fromName: this.fromName
    };
  }
}

module.exports = new EmailService();
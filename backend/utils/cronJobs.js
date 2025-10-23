const cron = require('node-cron');
const notificationService = require('../services/notificationService');
const renovacionService = require('../services/renovacionService');

/**
 * Configuración de trabajos cron para suscripciones
 */

/**
 * Verificar y enviar notificaciones de vencimiento
 * Se ejecuta cada 6 horas
 */
const verificarNotificaciones = cron.schedule('0 */6 * * *', async () => {
  console.log('⏰ [CRON] Iniciando verificación de notificaciones...');
  try {
    const resultado = await notificationService.verificarYEnviarNotificaciones();
    console.log(`✅ [CRON] Notificaciones procesadas: ${resultado.notificacionesEnviadas}`);
    console.log(`✅ [CRON] Suscripciones actualizadas: ${resultado.suscripcionesActualizadas}`);
  } catch (error) {
    console.error('❌ [CRON] Error verificando notificaciones:', error);
  }
}, {
  scheduled: false,
  timezone: "America/Mexico_City"
});

/**
 * Verificar suscripciones vencidas
 * Se ejecuta cada día a las 00:00
 */
const verificarVencimientos = cron.schedule('0 0 * * *', async () => {
  console.log('⏰ [CRON] Iniciando verificación de suscripciones vencidas...');
  try {
    const resultado = await renovacionService.verificarSuscripcionesVencidas();
    console.log(`✅ [CRON] Suscripciones vencidas actualizadas: ${resultado.suscripcionesActualizadas}`);
  } catch (error) {
    console.error('❌ [CRON] Error verificando vencimientos:', error);
  }
}, {
  scheduled: false,
  timezone: "America/Mexico_City"
});

/**
 * Procesar renovaciones automáticas
 * Se ejecuta cada día a las 01:00
 */
const procesarRenovaciones = cron.schedule('0 1 * * *', async () => {
  console.log('⏰ [CRON] Iniciando procesamiento de renovaciones automáticas...');
  try {
    const resultado = await renovacionService.procesarRenovacionesAutomaticas();
    console.log(`✅ [CRON] Renovaciones procesadas: ${resultado.totalProcesadas}`);
    console.log(`✅ [CRON] Renovaciones exitosas: ${resultado.renovacionesExitosas}`);
    console.log(`✅ [CRON] Renovaciones fallidas: ${resultado.renovacionesFallidas}`);
  } catch (error) {
    console.error('❌ [CRON] Error procesando renovaciones:', error);
  }
}, {
  scheduled: false,
  timezone: "America/Mexico_City"
});

/**
 * Iniciar todos los trabajos cron
 */
function iniciarCronJobs() {
  console.log('🕐 Iniciando trabajos cron para suscripciones...');
  
  verificarNotificaciones.start();
  console.log('✅ Cron de notificaciones iniciado (cada 6 horas)');
  
  verificarVencimientos.start();
  console.log('✅ Cron de verificación de vencimientos iniciado (diario a las 00:00)');
  
  procesarRenovaciones.start();
  console.log('✅ Cron de renovaciones automáticas iniciado (diario a las 01:00)');
}

/**
 * Detener todos los trabajos cron
 */
function detenerCronJobs() {
  console.log('🛑 Deteniendo trabajos cron...');
  verificarNotificaciones.stop();
  verificarVencimientos.stop();
  procesarRenovaciones.stop();
  console.log('✅ Trabajos cron detenidos');
}

module.exports = {
  iniciarCronJobs,
  detenerCronJobs,
  verificarNotificaciones,
  verificarVencimientos,
  procesarRenovaciones
};

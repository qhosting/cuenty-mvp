/**
 * Cron Job para Verificación de Vencimientos de Suscripciones
 * Se ejecuta diariamente a las 9:00 AM para verificar y notificar vencimientos
 */

const cron = require('node-cron');
const renovacionService = require('../services/renovacionService');
const notificationService = require('../services/notificationService');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Función principal que ejecuta la verificación de vencimientos
 */
async function verificarVencimientos() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║   🔔 CRON JOB: Verificación de Vencimientos Iniciada      ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log(`⏰ Timestamp: ${new Date().toISOString()}\n`);

  const resultados = {
    verificadas: 0,
    vencidas: 0,
    notificaciones7dias: 0,
    notificaciones3dias: 0,
    notificaciones1dia: 0,
    notificacionesVencidas: 0,
    errores: []
  };

  try {
    // 1. Verificar y actualizar suscripciones vencidas
    console.log('📋 Paso 1: Verificando suscripciones vencidas...');
    const resultadoVencidas = await renovacionService.verificarSuscripcionesVencidas();
    resultados.verificadas = resultadoVencidas.total;
    resultados.vencidas = resultadoVencidas.actualizadas;
    console.log(`   ✅ Verificadas: ${resultadoVencidas.total}, Actualizadas: ${resultadoVencidas.actualizadas}\n`);

    // 2. Enviar notificaciones de 7 días
    console.log('📋 Paso 2: Verificando suscripciones que vencen en 7 días...');
    const suscripciones7dias = await renovacionService.obtenerSuscripcionesProximasVencer(7);
    
    for (const sub of suscripciones7dias) {
      const diasRestantes = renovacionService.calcularDiasRestantes(sub.fechaProximaRenovacion);
      
      // Solo enviar si faltan exactamente 7 días
      if (diasRestantes === 7) {
        try {
          // Verificar si ya se envió esta notificación
          const yaEnviada = await notificationService.verificarNotificacionEnviada(sub.id, 'siete_dias');
          
          if (!yaEnviada) {
            await notificationService.enviarNotificacionVencimiento(sub.id, 'siete_dias');
            resultados.notificaciones7dias++;
            console.log(`   ✅ Notificación 7 días enviada: Suscripción ${sub.id} (${sub.servicio.nombre})`);
          }
        } catch (error) {
          console.error(`   ❌ Error en suscripción ${sub.id}:`, error.message);
          resultados.errores.push({ 
            suscripcionId: sub.id, 
            tipo: '7_dias', 
            error: error.message 
          });
        }
      }
    }
    console.log(`   📊 Total notificaciones 7 días: ${resultados.notificaciones7dias}\n`);

    // 3. Enviar notificaciones de 3 días
    console.log('📋 Paso 3: Verificando suscripciones que vencen en 3 días...');
    const suscripciones3dias = await renovacionService.obtenerSuscripcionesProximasVencer(3);
    
    for (const sub of suscripciones3dias) {
      const diasRestantes = renovacionService.calcularDiasRestantes(sub.fechaProximaRenovacion);
      
      // Solo enviar si faltan exactamente 3 días
      if (diasRestantes === 3) {
        try {
          const yaEnviada = await notificationService.verificarNotificacionEnviada(sub.id, 'tres_dias');
          
          if (!yaEnviada) {
            await notificationService.enviarNotificacionVencimiento(sub.id, 'tres_dias');
            resultados.notificaciones3dias++;
            console.log(`   ⚠️  Notificación 3 días enviada: Suscripción ${sub.id} (${sub.servicio.nombre})`);
          }
        } catch (error) {
          console.error(`   ❌ Error en suscripción ${sub.id}:`, error.message);
          resultados.errores.push({ 
            suscripcionId: sub.id, 
            tipo: '3_dias', 
            error: error.message 
          });
        }
      }
    }
    console.log(`   📊 Total notificaciones 3 días: ${resultados.notificaciones3dias}\n`);

    // 4. Enviar notificaciones de 1 día
    console.log('📋 Paso 4: Verificando suscripciones que vencen en 1 día...');
    const suscripciones1dia = await renovacionService.obtenerSuscripcionesProximasVencer(1);
    
    for (const sub of suscripciones1dia) {
      const diasRestantes = renovacionService.calcularDiasRestantes(sub.fechaProximaRenovacion);
      
      // Solo enviar si falta exactamente 1 día
      if (diasRestantes === 1) {
        try {
          const yaEnviada = await notificationService.verificarNotificacionEnviada(sub.id, 'un_dia');
          
          if (!yaEnviada) {
            await notificationService.enviarNotificacionVencimiento(sub.id, 'un_dia');
            resultados.notificaciones1dia++;
            console.log(`   🚨 Notificación 1 día enviada: Suscripción ${sub.id} (${sub.servicio.nombre})`);
          }
        } catch (error) {
          console.error(`   ❌ Error en suscripción ${sub.id}:`, error.message);
          resultados.errores.push({ 
            suscripcionId: sub.id, 
            tipo: '1_dia', 
            error: error.message 
          });
        }
      }
    }
    console.log(`   📊 Total notificaciones 1 día: ${resultados.notificaciones1dia}\n`);

    // 5. Enviar notificaciones de vencimiento
    console.log('📋 Paso 5: Notificando suscripciones vencidas...');
    const suscripcionesVencidas = await prisma.suscripcion.findMany({
      where: { estado: 'vencida' },
      include: {
        cliente: true,
        servicio: true,
        plan: true
      }
    });

    for (const sub of suscripcionesVencidas) {
      try {
        const yaEnviada = await notificationService.verificarNotificacionEnviada(sub.id, 'vencido');
        
        if (!yaEnviada) {
          await notificationService.enviarNotificacionVencimiento(sub.id, 'vencido');
          resultados.notificacionesVencidas++;
          console.log(`   ❌ Notificación vencida enviada: Suscripción ${sub.id} (${sub.servicio.nombre})`);
        }
      } catch (error) {
        console.error(`   ❌ Error en suscripción ${sub.id}:`, error.message);
        resultados.errores.push({ 
          suscripcionId: sub.id, 
          tipo: 'vencido', 
          error: error.message 
        });
      }
    }
    console.log(`   📊 Total notificaciones vencidas: ${resultados.notificacionesVencidas}\n`);

    // Resumen final
    console.log('╔════════════════════════════════════════════════════════════╗');
    console.log('║               📊 RESUMEN DE VERIFICACIÓN                   ║');
    console.log('╚════════════════════════════════════════════════════════════╝');
    console.log(`   Suscripciones verificadas:       ${resultados.verificadas}`);
    console.log(`   Suscripciones vencidas:          ${resultados.vencidas}`);
    console.log(`   Notificaciones 7 días:           ${resultados.notificaciones7dias}`);
    console.log(`   Notificaciones 3 días:           ${resultados.notificaciones3dias}`);
    console.log(`   Notificaciones 1 día:            ${resultados.notificaciones1dia}`);
    console.log(`   Notificaciones vencidas:         ${resultados.notificacionesVencidas}`);
    console.log(`   Errores:                         ${resultados.errores.length}`);
    
    if (resultados.errores.length > 0) {
      console.log('\n⚠️  Errores encontrados:');
      resultados.errores.forEach((err, index) => {
        console.log(`   ${index + 1}. Suscripción ${err.suscripcionId} (${err.tipo}): ${err.error}`);
      });
    }
    
    console.log('\n✅ Verificación completada exitosamente');
    console.log('═══════════════════════════════════════════════════════════\n');

    return resultados;

  } catch (error) {
    console.error('\n❌ ERROR CRÍTICO en verificación de vencimientos:', error);
    console.error('Stack trace:', error.stack);
    console.log('═══════════════════════════════════════════════════════════\n');
    throw error;
  }
}

/**
 * Inicializar el cron job
 * Se ejecuta todos los días a las 9:00 AM (zona horaria del servidor)
 * Formato cron: '0 9 * * *'
 * - 0: minuto 0
 * - 9: hora 9
 * - *: todos los días del mes
 * - *: todos los meses
 * - *: todos los días de la semana
 */
function inicializarCronJob() {
  console.log('\n╔════════════════════════════════════════════════════════════╗');
  console.log('║     🤖 CRON JOB: Sistema de Suscripciones Inicializado   ║');
  console.log('╚════════════════════════════════════════════════════════════╝');
  console.log('   ⏰ Programación: Todos los días a las 9:00 AM');
  console.log('   📅 Zona horaria: Sistema local');
  console.log('   🔄 Estado: Activo');
  console.log('═══════════════════════════════════════════════════════════\n');

  // Programar ejecución diaria a las 9:00 AM
  const job = cron.schedule('0 9 * * *', async () => {
    try {
      await verificarVencimientos();
    } catch (error) {
      console.error('❌ Error en ejecución programada del cron job:', error);
    }
  }, {
    scheduled: true,
    timezone: "America/Mexico_City" // Ajustar según tu zona horaria
  });

  // Ejecutar inmediatamente una vez al iniciar (opcional, útil para testing)
  // Comentar esta línea en producción si solo quieres ejecución programada
  // verificarVencimientos().catch(console.error);

  return job;
}

/**
 * Ejecutar verificación manual (útil para testing)
 */
async function ejecutarVerificacionManual() {
  console.log('🔧 Ejecutando verificación manual...\n');
  return await verificarVencimientos();
}

module.exports = {
  inicializarCronJob,
  verificarVencimientos,
  ejecutarVerificacionManual
};

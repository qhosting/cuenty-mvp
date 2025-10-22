#!/usr/bin/env node

/**
 * Script de Migración Segura para Prisma - BACKEND
 * 
 * Este script ejecuta migraciones de base de datos de forma segura
 * usando 'prisma migrate deploy' que NO resetea la base de datos.
 * 
 * Características:
 * - Usa migrate deploy (NO migrate dev que puede resetear datos)
 * - Manejo robusto de errores
 * - Logs detallados del proceso
 * - Verificación de variables de entorno
 * - Reintentos automáticos en caso de fallos
 */

const { execSync } = require('child_process');
const path = require('path');

// Configuración
const MAX_RETRIES = 5;
const RETRY_DELAY = 5000; // 5 segundos
const PRISMA_SCHEMA_PATH = path.join(__dirname, '..', 'prisma', 'schema.prisma');

// Colores para logs
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

/**
 * Logger con colores
 */
const logger = {
  info: (msg) => console.log(`${colors.blue}ℹ ${msg}${colors.reset}`),
  success: (msg) => console.log(`${colors.green}✓ ${msg}${colors.reset}`),
  error: (msg) => console.error(`${colors.red}✗ ${msg}${colors.reset}`),
  warning: (msg) => console.warn(`${colors.yellow}⚠ ${msg}${colors.reset}`),
  header: (msg) => console.log(`\n${colors.bright}${colors.blue}${'='.repeat(60)}${colors.reset}`),
};

/**
 * Espera un tiempo determinado
 */
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verifica que la variable DATABASE_URL esté configurada
 */
function checkDatabaseUrl() {
  logger.header();
  logger.info('Verificando configuración de base de datos (BACKEND)...');
  
  if (!process.env.DATABASE_URL) {
    logger.error('DATABASE_URL no está configurada en las variables de entorno');
    logger.error('Por favor, configure DATABASE_URL antes de ejecutar migraciones');
    process.exit(1);
  }
  
  // Ocultar credenciales al mostrar la URL
  const dbUrl = process.env.DATABASE_URL;
  const sanitizedUrl = dbUrl.replace(/:\/\/([^:]+):([^@]+)@/, '://***:***@');
  logger.success(`Base de datos configurada: ${sanitizedUrl}`);
}

/**
 * Verifica conectividad con la base de datos
 */
async function checkDatabaseConnection(attempt = 1) {
  try {
    logger.info(`Verificando conectividad con la base de datos (intento ${attempt}/${MAX_RETRIES})...`);
    
    execSync('npx prisma db execute --stdin < /dev/null', {
      encoding: 'utf8',
      stdio: 'pipe',
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      }
    });
    
    logger.success('Conexión a la base de datos exitosa');
    return true;
    
  } catch (error) {
    logger.warning(`No se pudo conectar a la base de datos (intento ${attempt}/${MAX_RETRIES})`);
    
    if (attempt < MAX_RETRIES) {
      logger.warning(`Reintentando en ${RETRY_DELAY / 1000} segundos...`);
      await sleep(RETRY_DELAY);
      return checkDatabaseConnection(attempt + 1);
    } else {
      logger.error('No se pudo conectar a la base de datos después de múltiples intentos');
      return false;
    }
  }
}

/**
 * Ejecuta el comando de migración con reintentos
 */
async function runMigration(attempt = 1) {
  try {
    logger.info(`Ejecutando migraciones del BACKEND (intento ${attempt}/${MAX_RETRIES})...`);
    logger.warning('Usando "prisma migrate deploy" - Modo SEGURO (no resetea datos)');
    
    // Ejecutar migrate deploy (NO usa migrate dev que puede resetear)
    execSync('npx prisma migrate deploy', {
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      }
    });
    
    logger.success('Migraciones del BACKEND aplicadas exitosamente');
    return true;
    
  } catch (error) {
    logger.error(`Error al ejecutar migraciones (intento ${attempt}/${MAX_RETRIES})`);
    
    if (attempt < MAX_RETRIES) {
      logger.warning(`Reintentando en ${RETRY_DELAY / 1000} segundos...`);
      await sleep(RETRY_DELAY);
      return runMigration(attempt + 1);
    } else {
      logger.error('Se agotaron los reintentos. Migraciones fallidas.');
      logger.error('Detalles del error:');
      console.error(error.message);
      
      // Instrucciones de diagnóstico
      logger.header();
      logger.warning('Pasos de diagnóstico sugeridos:');
      logger.info('1. Verificar que la base de datos esté accesible');
      logger.info('2. Verificar credenciales de la base de datos');
      logger.info('3. Verificar que existan archivos de migración en backend/prisma/migrations/');
      logger.info('4. Revisar logs de la base de datos para más detalles');
      logger.info('5. Intentar ejecutar manualmente: cd /app/backend && npx prisma migrate deploy');
      logger.header();
      
      return false;
    }
  }
}

/**
 * Genera el Prisma Client después de las migraciones
 */
function generatePrismaClient() {
  try {
    logger.info('Generando Prisma Client para el BACKEND...');
    
    execSync('npx prisma generate', {
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    
    logger.success('Prisma Client del BACKEND generado exitosamente');
    return true;
  } catch (error) {
    logger.error('Error al generar Prisma Client del BACKEND');
    console.error(error.message);
    return false;
  }
}

/**
 * Función principal
 */
async function main() {
  const startTime = Date.now();
  
  logger.header();
  logger.info('🚀 Iniciando proceso de migración segura de Prisma - BACKEND');
  logger.info(`📅 Fecha: ${new Date().toISOString()}`);
  logger.header();
  
  // Paso 1: Verificar DATABASE_URL
  checkDatabaseUrl();
  
  // Paso 2: Verificar conectividad con la base de datos
  logger.header();
  const connectionSuccess = await checkDatabaseConnection();
  
  if (!connectionSuccess) {
    logger.error('No se pudo establecer conexión con la base de datos');
    logger.warning('El servidor backend NO iniciará hasta resolver este problema');
    process.exit(1);
  }
  
  // Paso 3: Ejecutar migraciones
  logger.header();
  const migrationSuccess = await runMigration();
  
  if (!migrationSuccess) {
    logger.error('Fallo al ejecutar migraciones del BACKEND');
    logger.warning('El servidor backend podría tener problemas al iniciar');
    process.exit(1);
  }
  
  // Paso 4: Generar Prisma Client
  logger.header();
  const generateSuccess = generatePrismaClient();
  
  if (!generateSuccess) {
    logger.error('Fallo al generar Prisma Client del BACKEND');
    process.exit(1);
  }
  
  // Resumen final
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  logger.header();
  logger.success('✅ Proceso de migración del BACKEND completado exitosamente');
  logger.info(`⏱️  Duración total: ${duration} segundos`);
  logger.success('🎉 El servidor backend puede iniciar de forma segura');
  logger.header();
  
  process.exit(0);
}

// Ejecutar script
if (require.main === module) {
  main().catch((error) => {
    logger.error('Error inesperado en el proceso de migración del BACKEND');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runMigration, generatePrismaClient, checkDatabaseConnection };

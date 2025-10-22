#!/usr/bin/env node

/**
 * Script de Migración Segura para Prisma
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
const MAX_RETRIES = 3;
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
  logger.info('Verificando configuración de base de datos...');
  
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
 * Lista las migraciones disponibles
 */
function listMigrations() {
  try {
    const fs = require('fs');
    const migrationsDir = path.join(__dirname, '..', 'prisma', 'migrations');
    
    if (!fs.existsSync(migrationsDir)) {
      logger.warning('No se encontró el directorio prisma/migrations/');
      return;
    }
    
    const migrations = fs.readdirSync(migrationsDir)
      .filter(file => {
        const stat = fs.statSync(path.join(migrationsDir, file));
        return stat.isDirectory() && file !== 'migration_lock.toml';
      })
      .sort();
    
    if (migrations.length === 0) {
      logger.warning('No se encontraron migraciones en el directorio');
    } else {
      logger.info(`📋 Migraciones encontradas en FRONTEND: ${migrations.length}`);
      migrations.forEach((migration, index) => {
        logger.info(`   ${index + 1}. ${migration}`);
      });
    }
  } catch (error) {
    logger.warning('No se pudo listar las migraciones: ' + error.message);
  }
}

/**
 * Ejecuta el comando de migración con reintentos
 */
async function runMigration(attempt = 1) {
  try {
    logger.info(`Ejecutando migraciones del FRONTEND (intento ${attempt}/${MAX_RETRIES})...`);
    logger.warning('Usando "prisma migrate deploy" - Modo SEGURO (no resetea datos)');
    
    // Listar migraciones disponibles
    listMigrations();
    
    logger.info('');
    logger.info('🚀 Aplicando migraciones pendientes...');
    
    // Ejecutar migrate deploy (NO usa migrate dev que puede resetear)
    const output = execSync('npx prisma migrate deploy', {
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
      env: {
        ...process.env,
        DATABASE_URL: process.env.DATABASE_URL,
      }
    });
    
    logger.success('Migraciones del FRONTEND aplicadas exitosamente');
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
      logger.info('3. Verificar que existan archivos de migración en prisma/migrations/');
      logger.info('4. Revisar logs de la base de datos para más detalles');
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
    logger.info('Generando Prisma Client...');
    
    execSync('npx prisma generate', {
      encoding: 'utf8',
      stdio: 'inherit',
      cwd: path.join(__dirname, '..'),
    });
    
    logger.success('Prisma Client generado exitosamente');
    return true;
  } catch (error) {
    logger.error('Error al generar Prisma Client');
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
  logger.info('Iniciando proceso de migración segura de Prisma');
  logger.info(`Fecha: ${new Date().toISOString()}`);
  logger.header();
  
  // Paso 1: Verificar DATABASE_URL
  checkDatabaseUrl();
  
  // Paso 2: Ejecutar migraciones
  logger.header();
  const migrationSuccess = await runMigration();
  
  if (!migrationSuccess) {
    process.exit(1);
  }
  
  // Paso 3: Generar Prisma Client
  logger.header();
  const generateSuccess = generatePrismaClient();
  
  if (!generateSuccess) {
    process.exit(1);
  }
  
  // Resumen final
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  logger.header();
  logger.success('Proceso de migración completado exitosamente');
  logger.info(`Duración total: ${duration} segundos`);
  logger.header();
  
  process.exit(0);
}

// Ejecutar script
if (require.main === module) {
  main().catch((error) => {
    logger.error('Error inesperado en el proceso de migración');
    console.error(error);
    process.exit(1);
  });
}

module.exports = { runMigration, generatePrismaClient };

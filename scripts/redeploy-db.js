#!/usr/bin/env node

/**
 * Script para reiniciar y desplegar la base de datos de CUENTY MVP
 * 
 * Este script:
 * 1. Conecta a la base de datos indicada.
 * 2. Elimina el esquema public completo (CASCADE) y lo vuelve a crear.
 * 3. Aplica las migraciones del Backend.
 * 4. Aplica las migraciones del Frontend (NextJS).
 * 5. Ejecuta los scripts de Seed (semillas) para poblar datos iniciales.
 * 
 * Uso: 
 *   node scripts/redeploy-db.js [DATABASE_URL]
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Intentar cargar 'pg' robustamente
let pg;
try {
  pg = require('pg');
} catch (e) {
  try {
    pg = require(path.join(__dirname, '..', 'backend', 'node_modules', 'pg'));
  } catch (err) {
    try {
      pg = require(path.join(__dirname, '..', 'nextjs_space', 'node_modules', 'pg'));
    } catch (err2) {
      console.error('❌ Error: No se pudo cargar el módulo "pg". Ejecuta "npm install" en el backend o frontend.');
      process.exit(1);
    }
  }
}
const { Pool } = pg;

// Cargar variables de entorno si existe un .env en la raíz
const rootEnvPath = path.join(__dirname, '..', '.env');
if (fs.existsSync(rootEnvPath)) {
  try {
    require('dotenv').config({ path: rootEnvPath });
  } catch (e) {
    try {
      require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv')).config({ path: rootEnvPath });
    } catch (err) {
      try {
        require(path.join(__dirname, '..', 'nextjs_space', 'node_modules', 'dotenv')).config({ path: rootEnvPath });
      } catch (err2) {
        console.warn('⚠️  No se pudo inicializar dotenv, se usarán variables del sistema.');
      }
    }
  }
}

// Determinar qué URL usar (desde argumento o variable de entorno)
const databaseUrl = process.argv[2] || process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error('❌ Error: Debes especificar la DATABASE_URL como argumento o en la variable de entorno DATABASE_URL.');
  console.error('   Uso: node scripts/redeploy-db.js [DATABASE_URL]');
  process.exit(1);
}

function maskUrl(url) {
  try {
    const parsed = new URL(url.replace('postgresql://', 'http://').replace('postgres://', 'http://'));
    return `${parsed.protocol.replace('http', 'postgres')}//${parsed.username}:******@${parsed.host}${parsed.pathname}${parsed.search}`;
  } catch (e) {
    return 'URL de base de datos protegida/inválida';
  }
}

async function main() {
  console.log('===============================================================');
  console.log('🔥 INICIANDO REINICIO Y REDESPLIEGUE DE BASE DE DATOS 🔥');
  console.log('===============================================================');
  console.log(`📍 Base de datos objetivo: ${maskUrl(databaseUrl)}`);
  console.log('===============================================================\n');

  // 1. Limpieza de base de datos (Eliminación de contenido)
  console.log('🛑 PASO 1: Eliminando contenido actual (Esquema public)...');
  
  const pool = new Pool({ connectionString: databaseUrl });
  
  try {
    // Comprobar la conexión ejecutando un query simple
    await pool.query('SELECT 1');
    console.log('  ✅ Conectado a la base de datos correctamente.');

    // Eliminar esquema public
    console.log('  ⚠️  Ejecutando DROP SCHEMA public CASCADE...');
    await pool.query('DROP SCHEMA IF EXISTS public CASCADE;');
    
    // Volver a crear el esquema public
    console.log('  ➕ Ejecutando CREATE SCHEMA public...');
    await pool.query('CREATE SCHEMA public;');
    
    // Restaurar permisos por defecto
    console.log('  🔑 Otorgando permisos en el esquema public...');
    await pool.query('GRANT ALL ON SCHEMA public TO postgres;');
    await pool.query('GRANT ALL ON SCHEMA public TO public;');
    
    console.log('  ✅ Base de datos limpiada con éxito (esquema public vacío).\n');
  } catch (error) {
    console.error('  ❌ Error durante la limpieza de la base de datos:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }

  // Preparar entorno para comandos
  const env = { ...process.env, DATABASE_URL: databaseUrl };

  // 2. Desplegar backend migrations
  console.log('⚙️  PASO 2: Desplegando migraciones del Backend...');
  const backendDir = path.join(__dirname, '..', 'backend');
  try {
    console.log('  运行 npx prisma migrate deploy en el Backend...');
    execSync('npx prisma migrate deploy', { cwd: backendDir, stdio: 'inherit', env });
    
    console.log('  Generando Prisma Client para el Backend...');
    execSync('npx prisma generate', { cwd: backendDir, stdio: 'inherit', env });
    
    console.log('  ✅ Migraciones de Backend aplicadas con éxito.\n');
  } catch (error) {
    console.error('  ❌ Error al desplegar migraciones de Backend:', error.message);
    process.exit(1);
  }

  // 3. Desplegar frontend (NextJS) migrations
  console.log('🌐 PASO 3: Desplegando migraciones del Frontend (NextJS)...');
  const nextjsDir = path.join(__dirname, '..', 'nextjs_space');
  try {
    console.log('  Ejecutando npx prisma migrate deploy en NextJS...');
    execSync('npx prisma migrate deploy', { cwd: nextjsDir, stdio: 'inherit', env });
    
    console.log('  Generando Prisma Client para NextJS...');
    execSync('npx prisma generate', { cwd: nextjsDir, stdio: 'inherit', env });
    
    console.log('  ✅ Migraciones de NextJS aplicadas con éxito.\n');
  } catch (error) {
    console.error('  ❌ Error al desplegar migraciones de NextJS:', error.message);
    process.exit(1);
  }

  // 4. Sembrar base de datos (Seed)
  console.log('🌱 PASO 4: Sembrando datos iniciales en la base de datos...');
  try {
    console.log('  Ejecutando prisma db seed en NextJS...');
    execSync('npx prisma db seed', { cwd: nextjsDir, stdio: 'inherit', env });
    
    console.log('  Ejecutando seed-users.js de la raíz...');
    execSync('node scripts/seed-users.js', { cwd: path.join(__dirname, '..'), stdio: 'inherit', env });
    
    console.log('  ✅ Base de datos sembrada con éxito.\n');
  } catch (error) {
    console.warn('  ⚠️  Advertencia durante el sembrado de datos (seed):', error.message);
  }

  console.log('===============================================================');
  console.log('🎉 ¡PROCESO DE REDESPLIEGUE COMPLETADO CON ÉXITO! 🎉');
  console.log('===============================================================');
  console.log('La base de datos está limpia y con la última estructura y semillas aplicadas.');
  console.log('===============================================================');
}

main().catch((error) => {
  console.error('❌ Error fatal:', error);
  process.exit(1);
});

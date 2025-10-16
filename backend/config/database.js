
const { Pool } = require('pg');

// Configuración de conexión a PostgreSQL
// Prioriza DATABASE_URL para facilitar despliegue en contenedores y servicios externos
// Si no existe DATABASE_URL, usa variables individuales (compatibilidad backward)
const pool = new Pool(
  process.env.DATABASE_URL
    ? {
        connectionString: process.env.DATABASE_URL,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
    : {
        host: process.env.DB_HOST || 'localhost',
        port: process.env.DB_PORT || 5432,
        database: process.env.DB_NAME || 'cuenty_db',
        user: process.env.DB_USER || 'postgres',
        password: process.env.DB_PASSWORD || 'postgres',
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 2000,
      }
);

// Probar conexión al inicio
pool.on('connect', () => {
  console.log('✅ Conectado a la base de datos PostgreSQL');
  console.log('📍 Conexión usando:', process.env.DATABASE_URL ? 'DATABASE_URL' : 'variables individuales');
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la conexión a la base de datos:', err);
  process.exit(-1);
});

module.exports = pool;

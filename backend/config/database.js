
const { Pool } = require('pg');

// Configuración de conexión a PostgreSQL
// Prioriza DATABASE_URL para facilitar despliegue en contenedores y servicios externos
// Si no existe DATABASE_URL, usa variables individuales (compatibilidad backward)

// Función para parsear DATABASE_URL y crear configuración
function getDatabaseConfig() {
  if (process.env.DATABASE_URL) {
    // Parsear DATABASE_URL manualmente para extraer parámetros
    const url = new URL(process.env.DATABASE_URL.replace('postgresql://', 'postgres://'));
    
    return {
      connectionString: process.env.DATABASE_URL,
      host: url.hostname,
      port: parseInt(url.port) || 5432,
      database: url.pathname.split('/')[1]?.split('?')[0],
      user: url.username,
      password: url.password,
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
      // Deshabilitar SSL si se especifica en la URL
      ssl: url.searchParams.get('sslmode') === 'disable' ? false : undefined,
    };
  } else {
    // Configuración usando variables individuales
    return {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 5432,
      database: process.env.DB_NAME || 'cuenty_db',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres',
      max: 20,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 2000,
    };
  }
}

const pool = new Pool(getDatabaseConfig());

// Probar conexión al inicio
pool.on('connect', () => {
  console.log('✅ Conectado a la base de datos PostgreSQL');
  if (process.env.DATABASE_URL) {
    const config = getDatabaseConfig();
    console.log(`📍 Conexión usando: DATABASE_URL`);
    console.log(`   Host: ${config.host}:${config.port}`);
    console.log(`   Database: ${config.database}`);
    console.log(`   SSL: ${config.ssl === false ? 'disabled' : 'default'}`);
  } else {
    console.log('📍 Conexión usando: variables individuales');
  }
});

pool.on('error', (err) => {
  console.error('❌ Error inesperado en la conexión a la base de datos:', err);
  process.exit(-1);
});

module.exports = pool;

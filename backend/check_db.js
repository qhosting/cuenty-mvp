const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL || 'postgresql://postgres:51056d26ddf0ddbbc77a@cloudmx_cuenty-db:5432/cuenty-db?sslmode=disable'
});

async function checkDatabase() {
  try {
    console.log('🔍 Verificando base de datos...\n');
    
    // Verificar tablas
    const tablesQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name;
    `;
    const tables = await pool.query(tablesQuery);
    console.log('📋 Tablas disponibles:');
    tables.rows.forEach(row => console.log(`  - ${row.table_name}`));
    console.log('');
    
    // Verificar tabla users (Prisma)
    try {
      const usersCount = await pool.query('SELECT COUNT(*) FROM "User"');
      console.log(`👤 Usuarios en tabla User (Prisma): ${usersCount.rows[0].count}`);
      
      const users = await pool.query('SELECT id, name, email, phone FROM "User" LIMIT 5');
      if (users.rows.length > 0) {
        console.log('   Usuarios encontrados:');
        users.rows.forEach(user => {
          console.log(`   - ${user.name || 'Sin nombre'} (${user.email}) - Tel: ${user.phone || 'N/A'}`);
        });
      }
    } catch (e) {
      console.log('⚠️  Tabla User no existe o está vacía');
    }
    console.log('');
    
    // Verificar tabla admins (Backend API)
    try {
      const adminsCount = await pool.query('SELECT COUNT(*) FROM admins');
      console.log(`👑 Administradores en tabla admins: ${adminsCount.rows[0].count}`);
      
      const admins = await pool.query('SELECT id, username, email FROM admins LIMIT 5');
      if (admins.rows.length > 0) {
        console.log('   Admins encontrados:');
        admins.rows.forEach(admin => {
          console.log(`   - ${admin.username} (${admin.email || 'Sin email'})`);
        });
      }
    } catch (e) {
      console.log('⚠️  Tabla admins no existe o está vacía');
    }
    
  } catch (error) {
    console.error('❌ Error al conectar a la base de datos:', error.message);
  } finally {
    await pool.end();
  }
}

checkDatabase();

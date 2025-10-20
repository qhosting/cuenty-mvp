
const bcrypt = require('bcryptjs');
const pool = require('../config/database');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function createAdmin() {
  console.log('\n🔧 Creador de Administrador\n');

  try {
    const username = await question('Usuario (username): ');
    const password = await question('Contraseña: ');
    const email = await question('Email (opcional): ');

    if (!username || !password) {
      console.log('❌ Usuario y contraseña son requeridos');
      process.exit(1);
    }

    // Crear tabla si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        fecha_creacion TIMESTAMP DEFAULT NOW()
      )
    `);

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar admin
    const result = await pool.query(
      'INSERT INTO admins (username, password, email) VALUES ($1, $2, $3) RETURNING id, username, email',
      [username, hashedPassword, email || null]
    );

    console.log('\n✅ Administrador creado exitosamente:');
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Username: ${result.rows[0].username}`);
    console.log(`   Email: ${result.rows[0].email || 'N/A'}`);

  } catch (error) {
    if (error.code === '23505') {
      console.error('❌ Error: Ya existe un administrador con ese username');
    } else {
      console.error('❌ Error al crear administrador:', error.message);
    }
  } finally {
    rl.close();
    await pool.end();
  }
}

createAdmin();

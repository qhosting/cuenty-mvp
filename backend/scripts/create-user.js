
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

async function createUser() {
  console.log('\n👤 Creador de Usuario\n');

  try {
    const name = await question('Nombre: ');
    const email = await question('Email: ');
    const phone = await question('Teléfono (formato: +525551234567): ');
    const password = await question('Contraseña: ');

    if (!phone || !password || !email) {
      console.log('❌ Teléfono, email y contraseña son requeridos');
      process.exit(1);
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insertar usuario
    const result = await pool.query(`
      INSERT INTO "User" (id, name, email, phone, password, "emailVerified", "createdAt", "updatedAt")
      VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW(), NOW())
      RETURNING id, name, email, phone
    `, [name, email, phone, hashedPassword]);

    console.log('\n✅ Usuario creado exitosamente:');
    console.log(`   ID: ${result.rows[0].id}`);
    console.log(`   Nombre: ${result.rows[0].name}`);
    console.log(`   Email: ${result.rows[0].email}`);
    console.log(`   Teléfono: ${result.rows[0].phone}`);

  } catch (error) {
    if (error.code === '23505') {
      console.error('❌ Error: Ya existe un usuario con ese email o teléfono');
    } else {
      console.error('❌ Error al crear usuario:', error.message);
    }
  } finally {
    rl.close();
    await pool.end();
  }
}

createUser();

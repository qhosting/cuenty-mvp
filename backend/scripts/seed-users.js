
const bcrypt = require('bcryptjs');
const pool = require('../config/database');

async function seedUsers() {
  console.log('🌱 Iniciando seed de usuarios...\n');

  try {
    // Usuario de prueba para NextAuth
    const testUserPhone = '+525551234567';
    const testUserPassword = 'johndoe123';
    const hashedPassword = await bcrypt.hash(testUserPassword, 10);

    // Verificar si el usuario ya existe en la tabla User (Prisma)
    const checkUser = await pool.query(
      'SELECT id FROM "User" WHERE phone = $1',
      [testUserPhone]
    );

    if (checkUser.rows.length > 0) {
      console.log('✅ Usuario de prueba ya existe, actualizando...');
      await pool.query(
        'UPDATE "User" SET password = $1, name = $2, email = $3 WHERE phone = $4',
        [hashedPassword, 'John Doe', 'john@doe.com', testUserPhone]
      );
    } else {
      console.log('➕ Creando usuario de prueba...');
      await pool.query(`
        INSERT INTO "User" (id, name, email, phone, password, "emailVerified", "createdAt", "updatedAt")
        VALUES (gen_random_uuid()::text, $1, $2, $3, $4, NOW(), NOW(), NOW())
      `, ['John Doe', 'john@doe.com', testUserPhone, hashedPassword]);
    }

    console.log('');
    console.log('📋 Credenciales de prueba:');
    console.log(`   📱 Teléfono: ${testUserPhone}`);
    console.log(`   🔑 Contraseña: ${testUserPassword}`);
    console.log('');

    // Verificar/crear admin de prueba
    const adminUsername = 'admin';
    const adminPassword = 'admin123';
    const adminHashedPassword = await bcrypt.hash(adminPassword, 10);

    // Crear tabla admins si no existe
    await pool.query(`
      CREATE TABLE IF NOT EXISTS admins (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        email VARCHAR(100),
        fecha_creacion TIMESTAMP DEFAULT NOW()
      )
    `);

    const checkAdmin = await pool.query(
      'SELECT id FROM admins WHERE username = $1',
      [adminUsername]
    );

    if (checkAdmin.rows.length > 0) {
      console.log('✅ Admin de prueba ya existe, actualizando contraseña...');
      await pool.query(
        'UPDATE admins SET password = $1 WHERE username = $2',
        [adminHashedPassword, adminUsername]
      );
    } else {
      console.log('➕ Creando admin de prueba...');
      await pool.query(
        'INSERT INTO admins (username, password, email) VALUES ($1, $2, $3)',
        [adminUsername, adminHashedPassword, 'admin@cuenty.com']
      );
    }

    console.log('📋 Credenciales de admin:');
    console.log(`   👤 Username: ${adminUsername}`);
    console.log(`   🔑 Contraseña: ${adminPassword}`);
    console.log('');
    console.log('✨ Seed completado exitosamente!');

  } catch (error) {
    console.error('❌ Error durante el seed:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  seedUsers()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { seedUsers };

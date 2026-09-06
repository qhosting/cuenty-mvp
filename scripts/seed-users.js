#!/usr/bin/env node

/**
 * Script para crear usuarios administradores iniciales
 * 
 * Este script usa Prisma para crear usuarios en la base de datos
 * con contraseñas hasheadas usando bcrypt.
 * 
 * Uso: node scripts/seed-users.js
 * 
 * NOTA: El schema actual de User no incluye un campo 'role' o 'isAdmin'.
 * Si necesitas distinguir entre usuarios normales y administradores,
 * considera agregar un campo 'role' al schema de Prisma.
 */

const path = require('path');
const { PrismaClient } = require('../nextjs_space/node_modules/.prisma/client');

// Intentar cargar bcryptjs robustamente
let bcrypt;
try {
  bcrypt = require('bcryptjs');
} catch (e) {
  try {
    bcrypt = require(path.join(__dirname, '..', 'nextjs_space', 'node_modules', 'bcryptjs'));
  } catch (err) {
    try {
      bcrypt = require(path.join(__dirname, '..', 'backend', 'node_modules', 'bcryptjs'));
    } catch (err2) {
      console.error('❌ Error: No se pudo cargar bcryptjs.');
      process.exit(1);
    }
  }
}

// Intentar cargar dotenv robustamente
const rootEnvPath = path.join(__dirname, '..', '.env');
try {
  require('dotenv').config({ path: rootEnvPath });
} catch (e) {
  try {
    require(path.join(__dirname, '..', 'backend', 'node_modules', 'dotenv')).config({ path: rootEnvPath });
  } catch (err) {
    try {
      require(path.join(__dirname, '..', 'nextjs_space', 'node_modules', 'dotenv')).config({ path: rootEnvPath });
    } catch (err2) {
      console.warn('⚠️  No se pudo inicializar dotenv en seed-users.js');
    }
  }
}

const prisma = new PrismaClient();

// Configuración de usuarios administradores iniciales
const DEFAULT_ADMIN_USERS = [
  {
    name: 'Administrador CUENTY',
    email: 'admin@cuenty.com',
    phone: '+5215512345678',
    password: 'CuentyAdmin2025!', // CAMBIAR EN PRODUCCIÓN
  },
  {
    name: 'Super Admin',
    email: 'superadmin@cuenty.com',
    phone: '+5215587654321',
    password: 'SuperCuenty2025!', // CAMBIAR EN PRODUCCIÓN
  }
];

/**
 * Hashea una contraseña usando bcrypt
 * @param {string} password - Contraseña en texto plano
 * @returns {Promise<string>} - Contraseña hasheada
 */
async function hashPassword(password) {
  const saltRounds = 10;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Crea o actualiza un usuario en la base de datos
 * @param {Object} userData - Datos del usuario
 * @returns {Promise<Object>} - Usuario creado o actualizado
 */
async function createOrUpdateUser(userData) {
  const { name, email, phone, password } = userData;
  
  try {
    // Verificar si el usuario ya existe por email o teléfono
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email },
          { phone: phone }
        ]
      }
    });

    if (existingUser) {
      console.log(`⚠️  Usuario ya existe: ${email} (${phone})`);
      console.log(`   ID: ${existingUser.id}`);
      
      // Preguntar si quiere actualizar la contraseña
      if (process.env.UPDATE_EXISTING_PASSWORDS === 'true') {
        const hashedPassword = await hashPassword(password);
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: { password: hashedPassword }
        });
        console.log(`   ✅ Contraseña actualizada`);
        return updatedUser;
      }
      
      return existingUser;
    }

    // Crear nuevo usuario
    const hashedPassword = await hashPassword(password);
    const newUser = await prisma.user.create({
      data: {
        name,
        email,
        phone,
        password: hashedPassword,
        emailVerified: new Date(), // Marcar email como verificado
      }
    });

    console.log(`✅ Usuario creado exitosamente: ${email}`);
    console.log(`   ID: ${newUser.id}`);
    console.log(`   Nombre: ${newUser.name}`);
    console.log(`   Teléfono: ${newUser.phone}`);
    
    return newUser;
  } catch (error) {
    console.error(`❌ Error al crear usuario ${email}:`, error.message);
    throw error;
  }
}

/**
 * Función principal del script
 */
async function main() {
  console.log('🚀 Iniciando script de seed de usuarios...\n');
  console.log('📦 Base de datos:', process.env.DATABASE_URL ? 'Configurada' : '❌ NO CONFIGURADA');
  console.log('');

  if (!process.env.DATABASE_URL) {
    console.error('❌ ERROR: DATABASE_URL no está configurada en el archivo .env');
    process.exit(1);
  }

  const createdUsers = [];
  const errors = [];

  // Crear usuarios administradores por defecto
  console.log('👥 Creando usuarios administradores...\n');
  
  for (const userData of DEFAULT_ADMIN_USERS) {
    try {
      const user = await createOrUpdateUser(userData);
      createdUsers.push(user);
    } catch (error) {
      errors.push({ userData, error });
    }
    console.log(''); // Línea en blanco para separar
  }

  // Resumen
  console.log('📊 Resumen de operaciones:');
  console.log(`   ✅ Usuarios procesados: ${createdUsers.length}`);
  console.log(`   ❌ Errores: ${errors.length}`);
  console.log('');

  if (errors.length > 0) {
    console.log('⚠️  Errores encontrados:');
    errors.forEach(({ userData, error }) => {
      console.log(`   - ${userData.email}: ${error.message}`);
    });
  }

  // Información adicional
  console.log('');
  console.log('📝 Credenciales de acceso:');
  console.log('   IMPORTANTE: Cambia estas contraseñas en producción');
  console.log('');
  DEFAULT_ADMIN_USERS.forEach(user => {
    console.log(`   Email: ${user.email}`);
    console.log(`   Teléfono: ${user.phone}`);
    console.log(`   Contraseña: ${user.password}`);
    console.log('');
  });

  console.log('');
  console.log('💡 Notas importantes:');
  console.log('   1. El schema actual no incluye un campo "role" o "isAdmin"');
  console.log('   2. Si necesitas diferenciar administradores de usuarios normales,');
  console.log('      considera agregar un campo "role" al schema de Prisma');
  console.log('   3. Para actualizar contraseñas de usuarios existentes, ejecuta:');
  console.log('      UPDATE_EXISTING_PASSWORDS=true node scripts/seed-users.js');
  console.log('');

  console.log('✅ Script completado exitosamente!');
}

// Ejecutar el script
main()
  .catch((error) => {
    console.error('❌ Error fatal:', error);
    process.exit(1);
  })
  .finally(async () => {
    // Cerrar la conexión con Prisma
    await prisma.$disconnect();
  });

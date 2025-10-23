
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function initAdmin() {
  try {
    console.log('\n🔧 Inicializando usuario administrador...\n');

    // Obtener credenciales de variables de entorno
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@cuenty.top';
    const adminPassword = process.env.ADMIN_PASSWORD || 'defaultpassword';
    
    // Extraer username del email (parte antes del @)
    const username = adminEmail.split('@')[0];

    console.log(`📧 Email: ${adminEmail}`);
    console.log(`👤 Username: ${username}`);

    // Verificar si ya existe un admin con ese username
    const adminExistente = await prisma.admins.findUnique({
      where: { username }
    });

    if (adminExistente) {
      console.log('ℹ️  El administrador ya existe en la base de datos');
      console.log(`   ID: ${adminExistente.id}`);
      console.log(`   Username: ${adminExistente.username}`);
      console.log(`   Email: ${adminExistente.email || 'N/A'}`);
      
      // Verificar si la contraseña actual es diferente
      const passwordMatch = await bcrypt.compare(adminPassword, adminExistente.password);
      
      if (!passwordMatch) {
        console.log('🔄 Actualizando contraseña del administrador...');
        const hashedPassword = await bcrypt.hash(adminPassword, 10);
        
        await prisma.admins.update({
          where: { username },
          data: { 
            password: hashedPassword,
            email: adminEmail.toLowerCase().trim() // Actualizar email también
          }
        });
        
        console.log('✅ Contraseña y email actualizados exitosamente');
        console.log('\n🔐 Credenciales de acceso actualizadas:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('   URL: /admin/login\n');
      } else {
        console.log('✅ La contraseña actual es correcta');
        console.log('\n🔐 Credenciales de acceso:');
        console.log(`   Email: ${adminEmail}`);
        console.log(`   Password: ${adminPassword}`);
        console.log('   URL: /admin/login\n');
      }
      
      return;
    }

    // Hash de la contraseña
    const hashedPassword = await bcrypt.hash(adminPassword, 10);

    // Crear admin
    const nuevoAdmin = await prisma.admins.create({
      data: {
        username: username.toLowerCase().trim(),
        password: hashedPassword,
        email: adminEmail.toLowerCase().trim()
      },
      select: {
        id: true,
        username: true,
        email: true,
        fecha_creacion: true
      }
    });

    console.log('\n✅ Administrador creado exitosamente:');
    console.log(`   ID: ${nuevoAdmin.id}`);
    console.log(`   Username: ${nuevoAdmin.username}`);
    console.log(`   Email: ${nuevoAdmin.email}`);
    console.log(`   Fecha: ${nuevoAdmin.fecha_creacion}`);
    console.log('\n🔐 Credenciales de acceso:');
    console.log(`   Email: ${adminEmail}`);
    console.log(`   Password: ${adminPassword}`);
    console.log('   URL: /admin/login\n');

  } catch (error) {
    if (error.code === 'P2002') {
      console.error('❌ Error: Ya existe un administrador con ese username o email');
    } else {
      console.error('❌ Error al inicializar administrador:', error.message);
      console.error('Stack:', error.stack);
    }
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Ejecutar solo si se llama directamente
if (require.main === module) {
  initAdmin()
    .then(() => {
      console.log('✅ Inicialización completada\n');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Error en inicialización:', error);
      process.exit(1);
    });
}

module.exports = { initAdmin };

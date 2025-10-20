import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...\n')

  // Crear usuario de prueba
  const testUserPhone = '+525551234567'
  const testUserPassword = 'johndoe123'
  
  // Verificar si ya existe
  const existingUser = await prisma.user.findFirst({
    where: { phone: testUserPhone }
  })

  if (existingUser) {
    console.log('✅ Usuario de prueba ya existe, actualizando contraseña...')
    const hashedPassword = await bcrypt.hash(testUserPassword, 10)
    
    await prisma.user.update({
      where: { id: existingUser.id },
      data: { 
        password: hashedPassword,
        name: 'John Doe',
        email: 'john@doe.com'
      }
    })
    console.log(`   📱 Teléfono: ${testUserPhone}`)
    console.log(`   🔑 Contraseña: ${testUserPassword}`)
  } else {
    console.log('➕ Creando usuario de prueba...')
    const hashedPassword = await bcrypt.hash(testUserPassword, 10)
    
    const user = await prisma.user.create({
      data: {
        name: 'John Doe',
        email: 'john@doe.com',
        phone: testUserPhone,
        password: hashedPassword,
        emailVerified: new Date()
      }
    })
    
    console.log(`✅ Usuario creado con ID: ${user.id}`)
    console.log(`   📱 Teléfono: ${testUserPhone}`)
    console.log(`   🔑 Contraseña: ${testUserPassword}`)
  }

  console.log('\n✨ Seed completado exitosamente!')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

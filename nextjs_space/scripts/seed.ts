
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Crear usuario de prueba (administrador)
  const hashedPassword = await bcrypt.hash('johndoe123', 12)
  
  const testUser = await prisma.user.upsert({
    where: { email: 'john@doe.com' },
    update: {},
    create: {
      email: 'john@doe.com',
      name: 'John Doe',
      phone: '+525551234567'
    }
  })

  console.log('👤 Usuario de prueba creado:', testUser.email)

  // Crear productos de streaming
  const productos = [
    {
      name: 'Netflix Premium',
      description: 'Disfruta de Netflix en 4K con hasta 4 pantallas simultáneas. Acceso completo a todo el contenido.',
      category: 'streaming',
      features: ['4K Ultra HD', '4 pantallas simultáneas', 'Descargas ilimitadas', 'Sin anuncios']
    },
    {
      name: 'Disney+ Premium',
      description: 'Todo el contenido de Disney, Marvel, Star Wars, Pixar y National Geographic en una sola plataforma.',
      category: 'streaming', 
      features: ['Contenido 4K', '4 pantallas simultáneas', 'Descargas offline', 'Perfiles familiares']
    },
    {
      name: 'HBO Max',
      description: 'Series y películas exclusivas de HBO, Warner Bros y mucho más contenido premium.',
      category: 'streaming',
      features: ['Contenido exclusivo HBO', '3 pantallas simultáneas', 'Calidad 4K', 'Sin publicidad']
    },
    {
      name: 'Prime Video',
      description: 'Amazon Prime Video con acceso a miles de películas, series y contenido original.',
      category: 'streaming',
      features: ['Contenido original Amazon', 'Múltiples perfiles', 'Descargas móviles', 'X-Ray features']
    },
    {
      name: 'Spotify Premium',
      description: 'Música sin límites y sin anuncios. Descarga tu música favorita y escúchala offline.',
      category: 'music',
      features: ['Sin anuncios', 'Música offline', 'Calidad alta', 'Saltos ilimitados']
    },
    {
      name: 'YouTube Premium',
      description: 'YouTube sin anuncios, reproducción en segundo plano y acceso a YouTube Music.',
      category: 'streaming',
      features: ['Sin anuncios', 'Reproducción de fondo', 'YouTube Music incluido', 'Descargas offline']
    },
    {
      name: 'Apple TV+',
      description: 'Contenido original exclusivo de Apple con calidad cinematográfica.',
      category: 'streaming',
      features: ['Contenido original Apple', 'Calidad 4K HDR', '6 cuentas familiares', 'Descargas offline']
    },
    {
      name: 'Paramount+',
      description: 'Lo mejor de Paramount, CBS, Comedy Central y más en una sola plataforma.',
      category: 'streaming',
      features: ['Contenido en vivo', 'Deportes CBS', 'Películas Paramount', 'Sin anuncios']
    }
  ]

  // Precios por duración (en pesos mexicanos)
  const preciosPorDuracion = {
    30: { netflix: 89, disney: 79, hbo: 99, prime: 69, spotify: 59, youtube: 89, appletv: 79, paramount: 69 },
    90: { netflix: 229, disney: 199, hbo: 259, prime: 179, spotify: 149, youtube: 229, appletv: 199, paramount: 179 },
    180: { netflix: 399, disney: 349, hbo: 449, prime: 319, spotify: 269, youtube: 399, appletv: 349, paramount: 319 },
    365: { netflix: 699, disney: 599, hbo: 799, prime: 559, spotify: 479, youtube: 699, appletv: 599, paramount: 559 }
  }

  for (const producto of productos) {
    const servicioKey = producto.name.toLowerCase().replace(/[^a-z]/g, '').substring(0, 7)
    
    // Crear planes para cada duración
    for (const [dias, precios] of Object.entries(preciosPorDuracion)) {
      const duracionDias = parseInt(dias)
      const precio = precios[servicioKey as keyof typeof precios] || precios.netflix

      await prisma.product.upsert({
        where: {
          id: `${servicioKey}_${duracionDias}d`
        },
        update: {
          price: precio,
          isActive: true
        },
        create: {
          id: `${servicioKey}_${duracionDias}d`,
          name: `${producto.name} - ${duracionDias === 30 ? '1 Mes' : duracionDias === 90 ? '3 Meses' : duracionDias === 180 ? '6 Meses' : '1 Año'}`,
          description: producto.description,
          price: precio,
          duration: duracionDias,
          category: producto.category,
          features: producto.features,
          isActive: true
        }
      })
    }
  }

  console.log('🎬 Productos de streaming creados')
  console.log('✅ Seed completado exitosamente')
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

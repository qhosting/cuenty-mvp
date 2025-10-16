
'use client'

import { motion } from 'framer-motion'
import { Play, Crown, Sparkles, Clock } from 'lucide-react'
import { useState } from 'react'

const products = [
  {
    id: 1,
    name: 'Netflix Premium',
    description: '4K UHD, 4 pantallas simultáneas, sin anuncios',
    price: 89,
    duration: 30,
    icon: '🎬',
    color: 'from-red-500 to-red-600',
    features: ['4K Ultra HD', '4 Pantallas', 'Sin Publicidad', 'Descargas'],
    popular: true
  },
  {
    id: 2,
    name: 'Disney+ Premium',
    description: 'Contenido Disney, Pixar, Marvel, Star Wars',
    price: 69,
    duration: 30,
    icon: '🏰',
    color: 'from-blue-500 to-blue-600',
    features: ['4K HDR', 'Sin Límites', 'Todo Disney', 'Estrenar Primero']
  },
  {
    id: 3,
    name: 'HBO Max',
    description: 'Series exclusivas, películas y documentales',
    price: 79,
    duration: 30,
    icon: '👑',
    color: 'from-purple-500 to-purple-600',
    features: ['Contenido Exclusivo', 'Sin Anuncios', 'Máxima Calidad', 'Estrenos']
  },
  {
    id: 4,
    name: 'Prime Video',
    description: 'Películas, series y envío gratis Amazon',
    price: 59,
    duration: 30,
    icon: '📦',
    color: 'from-orange-500 to-orange-600',
    features: ['Prime Shipping', 'Video HD', 'Música Incluida', 'Lectura']
  },
  {
    id: 5,
    name: 'Spotify Premium',
    description: 'Música sin límites, sin anuncios, offline',
    price: 49,
    duration: 30,
    icon: '🎵',
    color: 'from-green-500 to-green-600',
    features: ['Sin Anuncios', 'Offline', 'Alta Calidad', 'Playlists']
  },
  {
    id: 6,
    name: 'YouTube Premium',
    description: 'Sin anuncios, background play, YouTube Music',
    price: 39,
    duration: 30,
    icon: '📺',
    color: 'from-red-500 to-red-600',
    features: ['Sin Publicidad', 'Background Play', 'YouTube Music', 'Descargas']
  },
  {
    id: 7,
    name: 'Apple TV+',
    description: 'Contenido original de Apple en alta calidad',
    price: 35,
    duration: 30,
    icon: '🍎',
    color: 'from-gray-600 to-gray-700',
    features: ['Contenido Original', '4K Dolby', 'Sin Anuncios', 'Familia']
  },
  {
    id: 8,
    name: 'Crunchyroll',
    description: 'Anime y manga premium sin restricciones',
    price: 45,
    duration: 30,
    icon: '🍜',
    color: 'from-orange-500 to-yellow-500',
    features: ['Sin Anuncios', 'Simulcast', 'Manga Premium', 'Offline']
  }
]

export function ProductCatalog() {
  const [selectedCategory, setSelectedCategory] = useState('all')

  const categories = [
    { id: 'all', name: 'Todos', icon: Sparkles },
    { id: 'streaming', name: 'Streaming', icon: Play },
    { id: 'music', name: 'Música', icon: Crown },
  ]

  return (
    <section id="productos" className="py-20 bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Nuestros <span className="text-gradient">Productos</span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Accede a las mejores plataformas de streaming y entretenimiento con cuentas premium
            a precios increíbles.
          </p>
        </motion.div>

        {/* Category Filter */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="flex justify-center mb-12"
        >
          <div className="flex bg-white/5 backdrop-blur-md rounded-full p-2 border border-white/10">
            {categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`flex items-center space-x-2 px-6 py-3 rounded-full transition-all duration-300 ${
                  selectedCategory === category.id
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-lg'
                    : 'text-white/60 hover:text-white/80 hover:bg-white/5'
                }`}
              >
                <category.icon className="w-5 h-5" />
                <span className="font-medium">{category.name}</span>
              </button>
            ))}
          </div>
        </motion.div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {products?.map((product, index) => (
            <motion.div
              key={product?.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="card card-hover h-full flex flex-col">
                {product?.popular && (
                  <div className="absolute -top-3 -right-3 z-10">
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black text-xs font-bold px-3 py-1 rounded-full shadow-lg">
                      MÁS POPULAR
                    </div>
                  </div>
                )}

                <div className="flex flex-col h-full">
                  {/* Header */}
                  <div className="flex items-center space-x-4 mb-4">
                    <div className={`w-16 h-16 bg-gradient-to-r ${product?.color} rounded-xl flex items-center justify-center text-2xl shadow-lg`}>
                      {product?.icon}
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-white">{product?.name}</h3>
                      <p className="text-white/60 text-sm">{product?.description}</p>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex-1 mb-6">
                    <div className="grid grid-cols-2 gap-2">
                      {product?.features?.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2 text-sm text-white/70">
                          <div className="w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full"></div>
                          <span>{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Price and Duration */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-gradient">${product?.price}</div>
                      <div className="text-white/60 text-sm">MXN</div>
                    </div>
                    <div className="flex items-center space-x-2 text-white/70">
                      <Clock className="w-4 h-4" />
                      <span className="text-sm">{product?.duration} días</span>
                    </div>
                  </div>

                  {/* CTA Button */}
                  <button className="w-full btn-primary group-hover:shadow-xl">
                    Obtener Ahora
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Bottom CTA */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="text-center mt-16"
        >
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">¿No encuentras lo que buscas?</h3>
            <p className="text-white/70 mb-6">
              Contáctanos y te ayudaremos a encontrar la cuenta perfecta para ti.
            </p>
            <button className="btn-primary">
              Contactar Soporte
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

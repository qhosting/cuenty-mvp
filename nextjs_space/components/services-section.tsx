

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ArrowRight, Star } from 'lucide-react'
import Link from 'next/link'

const services = [
  {
    name: 'Netflix',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/7/7a/Logonetflix.png',
    description: 'Series, películas y documentales premium',
    price: 'Desde $3.99',
    popular: true,
    gradient: 'from-red-600/20 to-red-500/20',
    borderColor: 'border-red-500/30'
  },
  {
    name: 'Disney+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/3/3e/Disney%2B_logo.svg',
    description: 'Marvel, Star Wars, Pixar y más',
    price: 'Desde $2.99',
    popular: false,
    gradient: 'from-blue-600/20 to-blue-500/20',
    borderColor: 'border-blue-500/30'
  },
  {
    name: 'HBO Max',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/17/HBO_Max_Logo.svg/2560px-HBO_Max_Logo.svg.png',
    description: 'Contenido exclusivo y blockbusters',
    price: 'Desde $4.99',
    popular: false,
    gradient: 'from-purple-600/20 to-purple-500/20',
    borderColor: 'border-purple-500/30'
  },
  {
    name: 'Prime Video',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/11/Amazon_Prime_Video_logo.svg/1280px-Amazon_Prime_Video_logo.svg.png',
    description: 'Películas y series Amazon Originals',
    price: 'Desde $3.49',
    popular: false,
    gradient: 'from-cyan-600/20 to-cyan-500/20',
    borderColor: 'border-cyan-500/30'
  },
  {
    name: 'Spotify',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Spotify_logo_with_text.svg/2560px-Spotify_logo_with_text.svg.png',
    description: 'Música premium sin anuncios',
    price: 'Desde $1.99',
    popular: true,
    gradient: 'from-green-600/20 to-green-500/20',
    borderColor: 'border-green-500/30'
  },
  {
    name: 'Apple TV+',
    logo: 'https://upload.wikimedia.org/wikipedia/commons/2/28/Apple_TV_Plus_Logo.svg',
    description: 'Contenido original de Apple',
    price: 'Desde $2.49',
    popular: false,
    gradient: 'from-gray-600/20 to-gray-500/20',
    borderColor: 'border-gray-500/30'
  }
]

export function ServicesSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <section className="py-24 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-12 bg-slate-800/50 rounded animate-pulse mb-6 max-w-md mx-auto"></div>
            <div className="h-6 bg-slate-800/50 rounded animate-pulse max-w-2xl mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-slate-900/50 rounded-xl p-6 animate-pulse">
                <div className="h-16 bg-slate-800 rounded mb-4"></div>
                <div className="h-4 bg-slate-800 rounded mb-2"></div>
                <div className="h-6 bg-slate-800 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="servicios" className="py-24 bg-slate-950 relative">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-900/20 to-transparent"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Plataformas
            </span>
            {' '}Disponibles
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Accede a las mejores plataformas de streaming y entretenimiento con cuentas premium verificadas
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => (
            <div
              key={service.name}
              className={`group relative bg-gradient-to-br ${service.gradient} backdrop-blur-sm rounded-xl border ${service.borderColor} hover:border-opacity-60 transition-all duration-300 hover:scale-105 overflow-hidden`}
            >
              {/* Popular badge */}
              {service.popular && (
                <div className="absolute top-4 right-4 z-10">
                  <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold">
                    <Star className="w-3 h-3 fill-current" />
                    <span>Popular</span>
                  </div>
                </div>
              )}

              <div className="p-6">
                {/* Service Logo */}
                <div className="flex items-center justify-center h-16 mb-4">
                  <div className="relative w-full h-12">
                    <Image
                      src={service.logo}
                      alt={`${service.name} logo`}
                      fill
                      className="object-contain filter brightness-110"
                      loading="lazy"
                    />
                  </div>
                </div>

                {/* Service Info */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-2">{service.name}</h3>
                  <p className="text-slate-300 text-sm mb-4">{service.description}</p>
                  
                  {/* Price */}
                  <div className="mb-6">
                    <span className="text-2xl font-bold text-white">{service.price}</span>
                    <span className="text-slate-400 text-sm">/mes</span>
                  </div>

                  {/* CTA Button */}
                  <Link
                    href="/catalogo"
                    className="inline-flex items-center justify-center w-full bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-lg transition-colors group-hover:bg-white/20 font-medium"
                  >
                    <span>Ver Planes</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>

              {/* Hover effect overlay */}
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/20 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"></div>
            </div>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="text-center">
          <p className="text-slate-400 mb-6">¿No encuentras la plataforma que buscas?</p>
          <Link
            href="/catalogo"
            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-medium"
          >
            <span>Ver Catálogo Completo</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </section>
  )
}


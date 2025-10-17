

'use client'

import { useState, useEffect } from 'react'
import { ArrowRight, Play, Star, Users, Shield, Clock } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950">
        <div className="absolute inset-0 bg-black/40"></div>
        <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
          <div className="h-16 bg-slate-800/50 rounded animate-pulse mb-6"></div>
          <div className="h-32 bg-slate-800/50 rounded animate-pulse mb-8"></div>
          <div className="h-12 bg-slate-800/50 rounded animate-pulse"></div>
        </div>
      </section>
    )
  }

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src="https://i.etsystatic.com/41319467/r/il/1a4b6c/6558311821/il_fullxfull.6558311821_jitc.jpg"
          alt="Gaming setup with streaming ambiance"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-b from-slate-900/80 via-slate-900/70 to-slate-950/90"></div>
      </div>

      {/* Animated particles background */}
      <div className="absolute inset-0 z-5">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 2}s`,
              animationDuration: `${2 + Math.random() * 3}s`
            }}
          >
            <div className="w-1 h-1 bg-blue-400/30 rounded-full"></div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="max-w-4xl mx-auto">
          {/* Badge */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-8">
            <Star className="w-4 h-4 text-yellow-400 fill-current" />
            <span className="text-blue-300 text-sm font-medium">+10,000 clientes satisfechos</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold text-white mb-6 leading-tight">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Streaming
            </span>
            <br />
            Premium
            <br />
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Sin Límites
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
            Accede a <span className="text-white font-semibold">Netflix, Disney+, HBO Max, Spotify</span> y más 
            con cuentas premium verificadas. <span className="text-green-400 font-semibold">Entrega inmediata</span> y 
            <span className="text-blue-400 font-semibold"> precios increíbles.</span>
          </p>

          {/* Stats */}
          <div className="flex flex-wrap justify-center gap-8 mb-10">
            <div className="flex items-center space-x-2 text-slate-300">
              <Users className="w-5 h-5 text-blue-400" />
              <span className="font-semibold">+10K usuarios</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Shield className="w-5 h-5 text-green-400" />
              <span className="font-semibold">100% seguro</span>
            </div>
            <div className="flex items-center space-x-2 text-slate-300">
              <Clock className="w-5 h-5 text-purple-400" />
              <span className="font-semibold">Entrega inmediata</span>
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link
              href="/catalogo"
              className="group relative bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-xl font-semibold text-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl flex items-center space-x-2"
            >
              <span>Ver Catálogo</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-blue-400 to-purple-400 opacity-0 group-hover:opacity-20 transition-opacity"></div>
            </Link>
            
            <button 
              onClick={() => {
                document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })
              }}
              className="group flex items-center space-x-2 text-white border border-white/20 px-8 py-4 rounded-xl hover:bg-white/10 transition-all duration-300 font-medium"
            >
              <Play className="w-5 h-5" />
              <span>Cómo Funciona</span>
            </button>
          </div>

          {/* Trust indicators */}
          <div className="flex flex-wrap justify-center items-center gap-6 opacity-60">
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Shield className="w-4 h-4 text-green-400" />
              <span>Pago 100% Seguro</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Clock className="w-4 h-4 text-blue-400" />
              <span>Soporte 24/7</span>
            </div>
            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Star className="w-4 h-4 text-yellow-400" />
              <span>4.9/5 estrellas</span>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent z-20"></div>
    </section>
  )
}


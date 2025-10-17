
'use client'

import { useEffect, useState } from 'react'
import { Star, Shield, Zap, Play, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 px-4 py-2 rounded-full mb-8">
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm text-slate-200">Plataforma #1 en México</span>
        </div>

        {/* Main heading */}
        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight">
          Accede a tus
          <br />
          <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
            Plataformas Favoritas
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed">
          Obtén cuentas premium de Netflix, Disney+, HBO Max, Prime Video y más.
          <br />
          <strong className="text-white">Entrega inmediata</strong> y <strong className="text-white">soporte 24/7</strong>.
        </p>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-4 mb-12">
          <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-sm text-slate-200">100% Seguro</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700">
            <Zap className="w-4 h-4 text-yellow-400" />
            <span className="text-sm text-slate-200">Entrega Inmediata</span>
          </div>
          <div className="flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-700">
            <Play className="w-4 h-4 text-blue-400" />
            <span className="text-sm text-slate-200">Todas las Plataformas</span>
          </div>
        </div>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-16">
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold text-lg"
          >
            <span>Ver Catálogo</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#como-funciona"
            className="inline-flex items-center justify-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-slate-600 text-white px-8 py-4 rounded-lg hover:bg-slate-700/50 transition-all font-semibold text-lg"
          >
            <span>Cómo Funciona</span>
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto">
          {[
            { value: '10,000+', label: 'Clientes Satisfechos' },
            { value: '15+', label: 'Plataformas' },
            { value: '99.9%', label: 'Uptime' },
            { value: '24/7', label: 'Soporte' },
          ].map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-2xl md:text-3xl font-bold text-white mb-2">{stat.value}</div>
              <div className="text-sm text-slate-400">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2">
        <div className="w-6 h-10 border-2 border-slate-400 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-slate-400 rounded-full mt-2 animate-bounce"></div>
        </div>
      </div>
    </section>
  )
}

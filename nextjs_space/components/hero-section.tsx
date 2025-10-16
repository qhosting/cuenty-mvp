
'use client'

import { motion } from 'framer-motion'
import { Play, Shield, Zap, Star } from 'lucide-react'
import Link from 'next/link'

export function HeroSection() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-600/20 via-purple-600/20 to-cyan-600/20"></div>
      <div className="absolute inset-0 bg-[url('/images/grid.svg')] opacity-10"></div>
      
      {/* Floating Orbs */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/30 rounded-full blur-xl animate-float"></div>
      <div className="absolute bottom-20 right-20 w-48 h-48 bg-purple-500/20 rounded-full blur-xl animate-float" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-cyan-500/40 rounded-full blur-xl animate-float" style={{ animationDelay: '4s' }}></div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="space-y-8"
        >
          {/* Badge */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-md rounded-full px-6 py-2 border border-white/20"
          >
            <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
            <span className="text-white/90 text-sm font-medium">Plataforma #1 en México</span>
          </motion.div>

          {/* Main Heading */}
          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="text-4xl md:text-6xl lg:text-7xl font-bold text-white text-shadow"
          >
            Accede a tus
            <span className="block text-gradient">
              Plataformas Favoritas
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed"
          >
            Obtén cuentas premium de Netflix, Disney+, HBO Max, Prime Video y más. 
            <span className="text-gradient font-semibold"> Entrega inmediata</span> y 
            <span className="text-gradient font-semibold"> soporte 24/7</span>.
          </motion.p>

          {/* Features Pills */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.5 }}
            className="flex flex-wrap justify-center gap-4 max-w-2xl mx-auto"
          >
            {[
              { icon: Shield, text: '100% Seguro' },
              { icon: Zap, text: 'Entrega Inmediata' },
              { icon: Play, text: 'Todas las Plataformas' }
            ].map((feature, index) => (
              <div 
                key={index}
                className="flex items-center space-x-2 bg-white/5 backdrop-blur-md rounded-full px-4 py-2 border border-white/10"
              >
                <feature.icon className="w-5 h-5 text-cyan-400" />
                <span className="text-white/90 text-sm font-medium">{feature.text}</span>
              </div>
            ))}
          </motion.div>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4"
          >
            <Link href="#productos" className="btn-primary text-lg px-8 py-4">
              Ver Productos
            </Link>
            <Link href="#como-funciona" className="btn-secondary text-lg px-8 py-4">
              Cómo Funciona
            </Link>
          </motion.div>

          {/* Stats */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
            className="pt-16 grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
          >
            {[
              { number: '10,000+', label: 'Clientes Satisfechos' },
              { number: '15+', label: 'Plataformas' },
              { number: '99.9%', label: 'Uptime' },
              { number: '24/7', label: 'Soporte' }
            ].map((stat, index) => (
              <div key={index} className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.8 + index * 0.1 }}
                  className="text-2xl md:text-3xl font-bold text-gradient mb-2"
                >
                  {stat.number}
                </motion.div>
                <div className="text-white/70 text-sm">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>

      {/* Scroll Indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.5 }}
        className="absolute bottom-8 left-1/2 transform -translate-x-1/2"
      >
        <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
          <div className="w-1 h-3 bg-gradient-to-b from-white to-transparent rounded-full mt-2 animate-bounce"></div>
        </div>
      </motion.div>
    </section>
  )
}

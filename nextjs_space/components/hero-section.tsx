
'use client'

import { useEffect, useState } from 'react'
import { Star, Shield, Zap, Play, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'

interface SiteConfig {
  heroTitle?: string
  heroSubtitle?: string
  heroBadgeText?: string
  heroCtaPrimary?: string
  heroCTASecondary?: string
  stat1Value?: string
  stat1Label?: string
  stat2Value?: string
  stat2Label?: string
  stat3Value?: string
  stat3Label?: string
  stat4Value?: string
  stat4Label?: string
}

export function HeroSection() {
  const [mounted, setMounted] = useState(false)
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({})

  useEffect(() => {
    setMounted(true)
    
    // Load site configuration
    const loadSiteConfig = async () => {
      try {
        const response = await fetch('/api/site-config')
        if (response.ok) {
          const config = await response.json()
          setSiteConfig(config)
        }
      } catch (error) {
        console.error('Failed to load site config:', error)
      }
    }
    
    loadSiteConfig()
  }, [])

  if (!mounted) return null

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900" />
      
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <motion.div 
          className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.5, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
        />
        <motion.div 
          className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.5, 0.3, 0.5],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 2
          }}
        />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Badge */}
        <motion.div 
          className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-sm border border-blue-500/30 px-4 py-2 rounded-full mb-8"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <Star className="w-4 h-4 text-yellow-400 fill-current" />
          <span className="text-sm text-slate-200">
            {siteConfig?.heroBadgeText || 'Plataforma #1 en México'}
          </span>
        </motion.div>

        {/* Main heading */}
        <motion.h1 
          className="text-5xl md:text-7xl font-bold text-white mb-6 leading-tight"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          {siteConfig?.heroTitle?.split('\n')?.map((line, index) => (
            <span key={index}>
              {index === 0 ? line : (
                <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                  {line}
                </span>
              )}
              {index === 0 && <br />}
            </span>
          )) || (
            <>
              Accede a tus
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
                Plataformas Favoritas
              </span>
            </>
          )}
        </motion.h1>

        {/* Subtitle */}
        <motion.div 
          className="text-xl md:text-2xl text-slate-300 mb-8 max-w-3xl mx-auto leading-relaxed"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          {siteConfig?.heroSubtitle?.split('\n')?.map((line, index) => (
            <span key={index}>
              {line.includes('Entrega inmediata') ? (
                line.split('Entrega inmediata').map((part, partIndex) => (
                  <span key={partIndex}>
                    {part}
                    {partIndex === 0 && <strong className="text-white">Entrega inmediata</strong>}
                  </span>
                ))
              ) : line.includes('soporte 24/7') ? (
                line.split('soporte 24/7').map((part, partIndex) => (
                  <span key={partIndex}>
                    {part}
                    {partIndex === 0 && <strong className="text-white">soporte 24/7</strong>}
                  </span>
                ))
              ) : line}
              {index === 0 && <br />}
            </span>
          )) || (
            <>
              Obtén cuentas premium de Netflix, Disney+, HBO Max, Prime Video y más.
              <br />
              <strong className="text-white">Entrega inmediata</strong> y <strong className="text-white">soporte 24/7</strong>.
            </>
          )}
        </motion.div>

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
        <motion.div 
          className="flex flex-col sm:flex-row justify-center gap-4 mb-16"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <Link
            href="/catalogo"
            className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all transform hover:scale-105 font-semibold text-lg shadow-2xl hover:shadow-blue-500/25"
          >
            <span>{siteConfig?.heroCtaPrimary || 'Ver Catálogo'}</span>
            <ArrowRight className="w-5 h-5" />
          </Link>
          <Link
            href="#como-funciona"
            className="inline-flex items-center justify-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-slate-600 text-white px-8 py-4 rounded-lg hover:bg-slate-700/50 transition-all font-semibold text-lg hover:border-slate-500"
          >
            <span>{siteConfig?.heroCTASecondary || 'Cómo Funciona'}</span>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div 
          className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-2xl mx-auto"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1.0 }}
        >
          {[
            { 
              value: siteConfig?.stat1Value || '10,000+', 
              label: siteConfig?.stat1Label || 'Clientes Satisfechos' 
            },
            { 
              value: siteConfig?.stat2Value || '15+', 
              label: siteConfig?.stat2Label || 'Plataformas' 
            },
            { 
              value: siteConfig?.stat3Value || '99.9%', 
              label: siteConfig?.stat3Label || 'Uptime' 
            },
            { 
              value: siteConfig?.stat4Value || '24/7', 
              label: siteConfig?.stat4Label || 'Soporte' 
            },
          ].map((stat, index) => (
            <motion.div 
              key={index} 
              className="text-center group cursor-default"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5, delay: 1.2 + index * 0.1 }}
              whileHover={{ scale: 1.05 }}
            >
              <div className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {stat.value}
              </div>
              <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                {stat.label}
              </div>
            </motion.div>
          ))}
        </motion.div>
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

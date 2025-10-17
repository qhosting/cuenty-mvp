
'use client'

import { Shield, Zap, Clock, Headphones, CreditCard, CheckCircle } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface SiteConfig {
  featuresTitle?: string
  featuresSubtitle?: string
  stat1Value?: string
  stat1Label?: string
  stat2Value?: string
  stat2Label?: string
  stat3Value?: string
  stat3Label?: string
  stat4Value?: string
  stat4Label?: string
}

export function FeaturesSection() {
  const [siteConfig, setSiteConfig] = useState<SiteConfig>({})

  useEffect(() => {
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
  const features = [
    {
      icon: Shield,
      title: '100% Seguro',
      description: 'Todas nuestras cuentas son verificadas y cuentan con garantía de funcionamiento.',
      color: 'from-blue-500 to-blue-600',
      bgColor: 'bg-blue-500/10 border-blue-500/20'
    },
    {
      icon: Zap,
      title: 'Entrega Inmediata',
      description: 'Recibe tus credenciales al instante después de confirmar tu pago.',
      color: 'from-yellow-500 to-orange-500',
      bgColor: 'bg-yellow-500/10 border-yellow-500/20'
    },
    {
      icon: Clock,
      title: 'Disponible 24/7',
      description: 'Nuestro servicio está disponible las 24 horas del día, todos los días del año.',
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-500/10 border-green-500/20'
    },
    {
      icon: Headphones,
      title: 'Soporte Técnico',
      description: 'Equipo de soporte especializado listo para ayudarte cuando lo necesites.',
      color: 'from-purple-500 to-violet-500',
      bgColor: 'bg-purple-500/10 border-purple-500/20'
    },
    {
      icon: CreditCard,
      title: 'Pagos Seguros',
      description: 'Múltiples métodos de pago seguros y encriptación de datos.',
      color: 'from-red-500 to-rose-500',
      bgColor: 'bg-red-500/10 border-red-500/20'
    },
    {
      icon: CheckCircle,
      title: 'Garantía Total',
      description: 'Si algo no funciona, te devolvemos tu dinero sin preguntas.',
      color: 'from-cyan-500 to-teal-500',
      bgColor: 'bg-cyan-500/10 border-cyan-500/20'
    },
  ]

  const stats = [
    { 
      value: siteConfig?.stat3Value || '99.9%', 
      label: siteConfig?.stat3Label ? `${siteConfig.stat3Label} garantizado` : 'Uptime garantizado'
    },
    { 
      value: siteConfig?.stat1Value || '10,000+', 
      label: siteConfig?.stat1Label?.toLowerCase() || 'Clientes satisfechos'
    },
    { 
      value: siteConfig?.stat2Value || '15+', 
      label: siteConfig?.stat2Label ? `${siteConfig.stat2Label} disponibles` : 'Plataformas disponibles'
    },
    { 
      value: siteConfig?.stat4Value || '24/7', 
      label: siteConfig?.stat4Label ? `${siteConfig.stat4Label} técnico` : 'Soporte técnico'
    },
  ]

  return (
    <section id="caracteristicas" className="py-24 bg-slate-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            {siteConfig?.featuresTitle?.replace('CUENTY', '') || '¿Por qué elegir '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CUENTY
            </span>
            {siteConfig?.featuresTitle?.includes('CUENTY') ? '' : '?'}
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {siteConfig?.featuresSubtitle || 'Somos la plataforma más confiable de México para obtener cuentas premium de streaming y entretenimiento.'}
          </p>
        </motion.div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              className="group relative bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-slate-600 p-6 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-purple-500/10"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
              whileHover={{ y: -5 }}
            >
              <div className={`inline-flex p-3 rounded-xl border ${feature.bgColor} mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className={`w-6 h-6 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} 
                  style={{
                    filter: 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%)'
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">{feature.title}</h3>
              <p className="text-slate-300 leading-relaxed group-hover:text-slate-200 transition-colors">{feature.description}</p>
            </motion.div>
          ))}
        </div>

        {/* Stats */}
        <motion.div 
          className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 hover:border-slate-600 transition-colors"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div 
                key={index} 
                className="text-center group cursor-default"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.5 + index * 0.1 }}
                viewport={{ once: true }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="text-3xl md:text-4xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

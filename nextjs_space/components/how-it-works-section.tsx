
'use client'

import { Search, CreditCard, MessageSquare, Play, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface SiteConfig {
  howItWorksTitle?: string
  howItWorksSubtitle?: string
  whatsappNumber?: string
}

export function HowItWorksSection() {
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
  const steps = [
    {
      number: '01',
      icon: Search,
      title: 'Elige tu servicio',
      description: 'Explora nuestro catálogo y selecciona la plataforma que más te guste.',
      color: 'from-blue-500 to-blue-600'
    },
    {
      number: '02',
      icon: CreditCard,
      title: 'Realiza el pago',
      description: 'Completa tu compra de forma segura con nuestros métodos de pago disponibles.',
      color: 'from-purple-500 to-purple-600'
    },
    {
      number: '03',
      icon: MessageSquare,
      title: 'Recibe tus datos',
      description: 'Te enviaremos las credenciales de acceso por WhatsApp al instante.',
      color: 'from-green-500 to-green-600'
    },
    {
      number: '04',
      icon: Play,
      title: '¡Disfruta!',
      description: 'Accede a tu plataforma favorita y disfruta de todo el contenido premium.',
      color: 'from-red-500 to-red-600'
    },
  ]

  return (
    <section id="como-funciona" className="py-24 bg-slate-900/50">
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
            {siteConfig?.howItWorksTitle?.includes('Funciona') ? (
              siteConfig.howItWorksTitle.split('Funciona').map((part, index) => (
                <span key={index}>
                  {part}
                  {index === 0 && <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Funciona</span>}
                </span>
              ))
            ) : (
              <>
                ¿Cómo <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Funciona</span>?
              </>
            )}
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            {siteConfig?.howItWorksSubtitle || 'Obtener tu cuenta premium es muy fácil. Solo sigue estos 4 simples pasos y estarás disfrutando en minutos.'}
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <motion.div 
              key={index} 
              className="relative group"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <motion.div 
                  className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-slate-600 to-transparent transform translate-x-4 z-0"
                  initial={{ scaleX: 0 }}
                  whileInView={{ scaleX: 1 }}
                  transition={{ duration: 0.8, delay: 0.5 + index * 0.1 }}
                  viewport={{ once: true }}
                />
              )}
              
              <motion.div 
                className="relative bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 text-center hover:border-slate-600 transition-all duration-300 hover:scale-105 z-10 hover:shadow-2xl hover:shadow-purple-500/10"
                whileHover={{ y: -5 }}
              >
                {/* Step number */}
                <div className="absolute -top-3 left-6">
                  <motion.div 
                    className={`w-8 h-8 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg`}
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    transition={{ duration: 0.5, delay: 0.3 + index * 0.1 }}
                    viewport={{ once: true }}
                    whileHover={{ scale: 1.1 }}
                  >
                    {step.number}
                  </motion.div>
                </div>

                {/* Icon */}
                <motion.div 
                  className={`inline-flex p-4 bg-gradient-to-r ${step.color} bg-opacity-10 rounded-xl mb-4 mt-4 group-hover:scale-110 transition-transform`}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.4 + index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <step.icon className={`w-8 h-8 text-white`} />
                </motion.div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3 group-hover:text-blue-400 transition-colors">{step.title}</h3>
                <p className="text-slate-300 leading-relaxed text-sm group-hover:text-slate-200 transition-colors">{step.description}</p>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div 
          className="text-center"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          viewport={{ once: true }}
        >
          <motion.div 
            className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 hover:border-slate-600 transition-colors"
            whileHover={{ scale: 1.02 }}
          >
            <h3 className="text-2xl font-bold text-white mb-4">¿Listo para empezar?</h3>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
              Únete a miles de usuarios que ya disfrutan de sus plataformas favoritas con CUENTY.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Link
                  href="/catalogo"
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium shadow-lg hover:shadow-blue-500/25"
                >
                  <span>Explorar Productos</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
              <motion.button
                onClick={() => {
                  const message = encodeURIComponent('¡Hola! Me interesa conocer más sobre CUENTY y sus servicios de streaming premium. 🎬')
                  const whatsappNumber = siteConfig?.whatsappNumber || 'message/IOR2WUU66JVMM1'
                  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`
                  window.open(whatsappUrl, '_blank')
                }}
                className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700/50 transition-colors font-medium hover:border-slate-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <MessageSquare className="w-4 h-4" />
                <span>Hablar con Soporte</span>
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </section>
  )
}

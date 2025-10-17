

'use client'

import { useState, useEffect } from 'react'
import { Search, CreditCard, Download, Play, ArrowRight, CheckCircle } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Elige tu Plan',
    description: 'Navega por nuestro catálogo y selecciona la plataforma que más te guste.',
    details: ['Más de 100 opciones disponibles', 'Precios desde $1.99/mes', 'Diferentes duraciones'],
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-500/30'
  },
  {
    number: '02',
    icon: CreditCard,
    title: 'Realiza el Pago',
    description: 'Completa tu compra de forma segura con múltiples métodos de pago.',
    details: ['Pago 100% seguro', 'Múltiples métodos', 'Confirmación instantánea'],
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-500/30'
  },
  {
    number: '03',
    icon: Download,
    title: 'Recibe tu Cuenta',
    description: 'Obtén tus credenciales inmediatamente después del pago confirmado.',
    details: ['Entrega inmediata', 'Email + Dashboard', 'Instrucciones incluidas'],
    color: 'from-purple-500 to-violet-500',
    bgColor: 'from-purple-500/10 to-violet-500/10',
    borderColor: 'border-purple-500/30'
  },
  {
    number: '04',
    icon: Play,
    title: '¡Disfruta!',
    description: 'Accede a todo el contenido premium y disfruta sin límites.',
    details: ['Acceso completo', 'Calidad premium', 'Soporte incluido'],
    color: 'from-pink-500 to-rose-500',
    bgColor: 'from-pink-500/10 to-rose-500/10',
    borderColor: 'border-pink-500/30'
  }
]

export function HowItWorks() {
  const [mounted, setMounted] = useState(false)
  const [activeStep, setActiveStep] = useState(0)

  useEffect(() => {
    setMounted(true)
    
    // Auto-advance steps
    const interval = setInterval(() => {
      setActiveStep(current => (current + 1) % steps.length)
    }, 3000)
    
    return () => clearInterval(interval)
  }, [])

  if (!mounted) {
    return (
      <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-12 bg-slate-800/50 rounded animate-pulse mb-6 max-w-md mx-auto"></div>
            <div className="h-6 bg-slate-800/50 rounded animate-pulse max-w-2xl mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-6 animate-pulse">
                <div className="w-16 h-16 bg-slate-700 rounded-full mb-4"></div>
                <div className="h-6 bg-slate-700 rounded mb-2"></div>
                <div className="h-4 bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section id="como-funciona" className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
      {/* Background decorations */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/3 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-full px-4 py-2 mb-6">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Proceso súper simple</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Cómo{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Funciona?
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            En solo 4 pasos simples tendrás acceso completo a tu plataforma favorita
          </p>
        </div>

        {/* Steps Navigation */}
        <div className="flex justify-center mb-16">
          <div className="flex space-x-2 bg-slate-800/30 backdrop-blur-sm p-2 rounded-xl border border-slate-700/50">
            {steps.map((_, index) => (
              <button
                key={index}
                onClick={() => setActiveStep(index)}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  activeStep === index
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 scale-125'
                    : 'bg-slate-600 hover:bg-slate-500'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div
              key={step.title}
              className={`group relative transition-all duration-500 ${
                activeStep === index ? 'scale-105' : 'hover:scale-105'
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
              onMouseEnter={() => setActiveStep(index)}
            >
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-20 left-full w-8 h-0.5 bg-gradient-to-r from-slate-600 to-slate-700 z-0 transform -translate-x-4">
                  <div 
                    className={`h-full bg-gradient-to-r ${step.color} transition-all duration-500 ${
                      activeStep >= index ? 'w-full' : 'w-0'
                    }`}
                  />
                </div>
              )}

              <div
                className={`relative bg-gradient-to-br ${step.bgColor} backdrop-blur-sm rounded-xl border ${step.borderColor} p-8 text-center overflow-hidden transition-all duration-300 ${
                  activeStep === index 
                    ? 'border-opacity-100 shadow-2xl' 
                    : 'hover:border-opacity-60'
                }`}
              >
                {/* Glow effect */}
                <div 
                  className={`absolute inset-0 bg-gradient-to-br ${step.bgColor} opacity-0 transition-opacity duration-300 ${
                    activeStep === index ? 'opacity-100' : 'group-hover:opacity-100'
                  }`}
                />
                
                <div className="relative">
                  {/* Step number */}
                  <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${step.color} rounded-full text-white font-bold text-xl mb-6 shadow-lg transition-transform duration-300 ${
                    activeStep === index ? 'scale-110' : 'group-hover:scale-110'
                  }`}>
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="flex justify-center mb-4">
                    <div className={`p-3 bg-gradient-to-r ${step.color} rounded-lg transition-all duration-300 ${
                      activeStep === index ? 'scale-110' : 'group-hover:scale-110'
                    }`}>
                      <step.icon className="w-6 h-6 text-white" />
                    </div>
                  </div>

                  {/* Content */}
                  <h3 className={`text-xl font-bold text-white mb-4 transition-colors ${
                    activeStep === index ? 'text-opacity-100' : 'group-hover:text-opacity-90'
                  }`}>
                    {step.title}
                  </h3>
                  
                  <p className={`text-slate-300 mb-6 transition-colors leading-relaxed ${
                    activeStep === index ? 'text-slate-200' : 'group-hover:text-slate-200'
                  }`}>
                    {step.description}
                  </p>

                  {/* Details */}
                  <div className="space-y-2">
                    {step.details.map((detail, detailIndex) => (
                      <div 
                        key={detailIndex}
                        className="flex items-center justify-center space-x-2 text-xs text-slate-400"
                      >
                        <CheckCircle className="w-3 h-3 text-green-400" />
                        <span className={activeStep === index ? 'text-slate-300' : 'group-hover:text-slate-300'}>{detail}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Bottom accent */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color} opacity-0 transition-opacity ${
                  activeStep === index ? 'opacity-100' : 'group-hover:opacity-100'
                }`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            
            <div className="relative">
              <h3 className="text-3xl font-bold text-white mb-4">
                ¿Listo para comenzar?
              </h3>
              <p className="text-slate-300 mb-8 max-w-md mx-auto">
                Únete a miles de usuarios que ya disfrutan de entretenimiento premium por menos.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={() => document.getElementById('productos')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold hover:scale-105 transform duration-300"
                >
                  <span>Explorar Productos</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
                
                <button
                  onClick={() => {
                    const message = encodeURIComponent('¡Hola! Me interesa conocer más sobre CUENTY y sus servicios de streaming premium. 🎬')
                    window.open(`https://wa.me/message/IOR2WUU66JVMM1?text=${message}`, '_blank')
                  }}
                  className="inline-flex items-center space-x-2 text-white border border-white/20 px-8 py-4 rounded-lg hover:bg-white/10 transition-colors font-medium"
                >
                  <span>Contactar Soporte</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


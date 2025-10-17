
'use client'

import { Search, CreditCard, MessageSquare, Play, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export function HowItWorksSection() {
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
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Cómo <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Funciona</span>?
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Obtener tu cuenta premium es muy fácil. Solo sigue estos 4 simples pasos y estarás disfrutando en minutos.
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
          {steps.map((step, index) => (
            <div key={index} className="relative group">
              {/* Connection line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-slate-600 to-transparent transform translate-x-4 z-0" />
              )}
              
              <div className="relative bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 text-center hover:border-slate-600 transition-all duration-300 hover:scale-105 z-10">
                {/* Step number */}
                <div className="absolute -top-3 left-6">
                  <div className={`w-8 h-8 bg-gradient-to-r ${step.color} rounded-full flex items-center justify-center text-white text-sm font-bold shadow-lg`}>
                    {step.number}
                  </div>
                </div>

                {/* Icon */}
                <div className={`inline-flex p-4 bg-gradient-to-r ${step.color} bg-opacity-10 rounded-xl mb-4 mt-4`}>
                  <step.icon className={`w-8 h-8 text-white`} />
                </div>

                {/* Content */}
                <h3 className="text-xl font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-slate-300 leading-relaxed text-sm">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">¿Listo para empezar?</h3>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
              Únete a miles de usuarios que ya disfrutan de sus plataformas favoritas con CUENTY.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <Link
                href="/catalogo"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
              >
                <span>Explorar Productos</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <button
                onClick={() => {
                  const message = encodeURIComponent('¡Hola! Me interesa conocer más sobre CUENTY y sus servicios de streaming premium. 🎬')
                  const whatsappUrl = `https://wa.me/message/IOR2WUU66JVMM1?text=${message}`
                  window.open(whatsappUrl, '_blank')
                }}
                className="inline-flex items-center space-x-2 bg-slate-800/50 backdrop-blur-sm border border-slate-600 text-white px-6 py-3 rounded-lg hover:bg-slate-700/50 transition-colors font-medium"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Hablar con Soporte</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


'use client'

import { motion } from 'framer-motion'
import { Search, CreditCard, MessageSquare, Play } from 'lucide-react'

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
  }
]

export function HowItWorksSection() {
  return (
    <section id="como-funciona" className="py-20 bg-black/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Cómo <span className="text-gradient">Funciona</span>?
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Obtener tu cuenta premium es muy fácil. Solo sigue estos 4 simples pasos
            y estarás disfrutando en minutos.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps?.map((step, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
              className="relative"
            >
              <div className="card card-hover text-center h-full">
                {/* Step Number */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-white/20 to-white/10 rounded-full flex items-center justify-center border border-white/20 backdrop-blur-sm">
                  <span className="text-white/80 font-bold text-sm">{step?.number}</span>
                </div>

                <div className="mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${step?.color} rounded-xl mx-auto flex items-center justify-center shadow-lg`}>
                    <step.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                <h3 className="text-xl font-bold text-white mb-4">{step?.title}</h3>
                <p className="text-white/70 leading-relaxed">{step?.description}</p>

                {/* Connection Line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-0.5 bg-gradient-to-r from-white/30 to-transparent transform -translate-y-1/2 z-10">
                    <div className="absolute right-0 w-2 h-2 bg-white/30 rounded-full transform translate-x-1 -translate-y-0.5"></div>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.8 }}
          className="mt-16 text-center"
        >
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">¿Listo para empezar?</h3>
            <p className="text-white/70 mb-6">
              Únete a miles de usuarios que ya disfrutan de sus plataformas favoritas con CUENTY.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="btn-primary">
                Explorar Productos
              </button>
              <button className="btn-secondary">
                Hablar con Soporte
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}


'use client'

import { motion } from 'framer-motion'
import { Shield, Zap, Clock, Headphones, CreditCard, CheckCircle } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: '100% Seguro',
    description: 'Todas nuestras cuentas son verificadas y cuentan con garantía de funcionamiento.',
    color: 'from-blue-500 to-blue-600'
  },
  {
    icon: Zap,
    title: 'Entrega Inmediata',
    description: 'Recibe tus credenciales al instante después de confirmar tu pago.',
    color: 'from-yellow-500 to-yellow-600'
  },
  {
    icon: Clock,
    title: 'Disponible 24/7',
    description: 'Nuestro servicio está disponible las 24 horas del día, todos los días del año.',
    color: 'from-green-500 to-green-600'
  },
  {
    icon: Headphones,
    title: 'Soporte Técnico',
    description: 'Equipo de soporte especializado listo para ayudarte cuando lo necesites.',
    color: 'from-purple-500 to-purple-600'
  },
  {
    icon: CreditCard,
    title: 'Pagos Seguros',
    description: 'Múltiples métodos de pago seguros y encriptación de datos.',
    color: 'from-red-500 to-red-600'
  },
  {
    icon: CheckCircle,
    title: 'Garantía Total',
    description: 'Si algo no funciona, te devolvemos tu dinero sin preguntas.',
    color: 'from-cyan-500 to-cyan-600'
  }
]

export function FeaturesSection() {
  return (
    <section id="caracteristicas" className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Por qué elegir <span className="text-gradient">CUENTY</span>?
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Somos la plataforma más confiable de México para obtener cuentas premium
            de streaming y entretenimiento.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features?.map((feature, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              className="group"
            >
              <div className="card card-hover h-full text-center">
                <div className="mb-6">
                  <div className={`w-16 h-16 bg-gradient-to-r ${feature?.color} rounded-xl mx-auto flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300`}>
                    <feature.icon className="w-8 h-8 text-white" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-white mb-4">{feature?.title}</h3>
                <p className="text-white/70 leading-relaxed">{feature?.description}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Stats Section */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-20"
        >
          <div className="card">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
              {[
                { number: '99.9%', label: 'Uptime garantizado', suffix: '%' },
                { number: '10,000', label: 'Clientes satisfechos', suffix: '+' },
                { number: '15', label: 'Plataformas disponibles', suffix: '+' },
                { number: '24', label: 'Soporte técnico', suffix: '/7' }
              ].map((stat, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  transition={{ duration: 0.6, delay: 0.5 + index * 0.1 }}
                >
                  <div className="text-3xl md:text-4xl font-bold text-gradient mb-2">
                    {stat.number}{stat.suffix}
                  </div>
                  <div className="text-white/70 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

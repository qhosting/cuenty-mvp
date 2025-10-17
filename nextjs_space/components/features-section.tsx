
'use client'

import { Shield, Zap, Clock, Headphones, CreditCard, CheckCircle } from 'lucide-react'

export function FeaturesSection() {
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
    { value: '99.9%', label: 'Uptime garantizado' },
    { value: '10,000+', label: 'Clientes satisfechos' },
    { value: '15+', label: 'Plataformas disponibles' },
    { value: '24/7', label: 'Soporte técnico' },
  ]

  return (
    <section id="caracteristicas" className="py-24 bg-slate-800/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Por qué elegir <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">CUENTY</span>?
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Somos la plataforma más confiable de México para obtener cuentas premium de streaming y entretenimiento.
          </p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          {features.map((feature, index) => (
            <div
              key={index}
              className="group relative bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-slate-600 p-6 transition-all duration-300 hover:scale-105"
            >
              <div className={`inline-flex p-3 rounded-xl border ${feature.bgColor} mb-4`}>
                <feature.icon className={`w-6 h-6 bg-gradient-to-r ${feature.color} bg-clip-text text-transparent`} 
                  style={{
                    filter: 'brightness(0) saturate(100%) invert(42%) sepia(93%) saturate(1352%) hue-rotate(87deg) brightness(119%) contrast(119%)'
                  }}
                />
              </div>
              <h3 className="text-xl font-semibold text-white mb-3">{feature.title}</h3>
              <p className="text-slate-300 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-white mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-slate-400">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

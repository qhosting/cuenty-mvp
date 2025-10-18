

'use client'

import { Clock, Shield, Headphones, DollarSign, Star, Zap, Users, Award } from 'lucide-react'

const benefits = [
  {
    icon: Clock,
    title: 'Entrega Inmediata',
    description: 'Recibe tus credenciales al instante después del pago. Sin esperas, sin demoras.',
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-500/30'
  },
  {
    icon: Shield,
    title: 'Garantía Total',
    description: 'Cuentas 100% funcionales o te devolvemos tu dinero. Respaldamos la calidad.',
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-500/30'
  },
  {
    icon: Headphones,
    title: 'Soporte 24/7',
    description: 'Nuestro equipo está disponible siempre para ayudarte. Resolveremos cualquier duda.',
    color: 'from-purple-500 to-violet-500',
    bgColor: 'from-purple-500/10 to-violet-500/10',
    borderColor: 'border-purple-500/30'
  },
  {
    icon: DollarSign,
    title: 'Precios Increíbles',
    description: 'Hasta 80% más barato que las suscripciones oficiales. Calidad premium, precio justo.',
    color: 'from-yellow-500 to-orange-500',
    bgColor: 'from-yellow-500/10 to-orange-500/10',
    borderColor: 'border-yellow-500/30'
  },
  {
    icon: Star,
    title: 'Calidad Premium',
    description: 'Todas nuestras cuentas son premium con acceso completo a todo el contenido.',
    color: 'from-pink-500 to-rose-500',
    bgColor: 'from-pink-500/10 to-rose-500/10',
    borderColor: 'border-pink-500/30'
  },
  {
    icon: Users,
    title: '+10K Clientes',
    description: 'Miles de usuarios satisfechos confían en nosotros para su entretenimiento diario.',
    color: 'from-indigo-500 to-blue-500',
    bgColor: 'from-indigo-500/10 to-blue-500/10',
    borderColor: 'border-indigo-500/30'
  }
]

const stats = [
  { number: '10,000+', label: 'Clientes Satisfechos', icon: Users },
  { number: '99.9%', label: 'Uptime Garantizado', icon: Zap },
  { number: '4.9/5', label: 'Calificación Promedio', icon: Star },
  { number: '24/7', label: 'Soporte Disponible', icon: Headphones }
]

export function WhyChooseUs() {
  return (
    <section className="py-24 bg-slate-900 relative">
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 -left-20 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 -right-20 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-full px-4 py-2 mb-6">
            <Award className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">La mejor opción del mercado</span>
          </div>
          
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            ¿Por qué elegir{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CUENTY?
            </span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Somos líderes en el mercado de cuentas premium con miles de clientes satisfechos
          </p>
        </div>

        {/* Stats Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className="text-center group"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-blue-500/50 transition-all duration-300 hover:scale-105">
                <div className="flex justify-center mb-3">
                  <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                    <stat.icon className="w-6 h-6 text-blue-400" />
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-2 group-hover:text-blue-300 transition-colors">
                  {stat.number}
                </div>
                <div className="text-sm text-slate-400 group-hover:text-slate-300 transition-colors">
                  {stat.label}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Benefits Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {benefits.map((benefit, index) => (
            <div
              key={benefit.title}
              className={`group relative bg-gradient-to-br ${benefit.bgColor} backdrop-blur-sm rounded-xl border ${benefit.borderColor} hover:border-opacity-60 transition-all duration-500 hover:scale-105 overflow-hidden`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Glow effect */}
              <div className={`absolute inset-0 bg-gradient-to-br ${benefit.bgColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>
              
              <div className="relative p-8">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                  <div className={`p-4 bg-gradient-to-r ${benefit.color} rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                    <benefit.icon className="w-8 h-8 text-white" />
                  </div>
                </div>

                {/* Content */}
                <div className="text-center">
                  <h3 className="text-xl font-bold text-white mb-4 group-hover:text-opacity-90 transition-colors">
                    {benefit.title}
                  </h3>
                  <p className="text-slate-300 group-hover:text-slate-200 transition-colors leading-relaxed">
                    {benefit.description}
                  </p>
                </div>

                {/* Subtle accent line */}
                <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${benefit.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
              </div>
            </div>
          ))}
        </div>

        {/* Trust Section */}
        <div className="mt-16 text-center">
          <div className="bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-green-500/5 to-blue-500/5"></div>
            
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-6 h-6 text-yellow-400 fill-current" />
                  ))}
                </div>
              </div>
              
              <h3 className="text-2xl font-bold text-white mb-4">
                Confianza que se ve reflejada en resultados
              </h3>
              <p className="text-slate-300 max-w-2xl mx-auto mb-6">
                "Llevo más de 2 años usando CUENTY y jamás he tenido problemas. 
                El soporte es excelente y las cuentas siempre funcionan perfectamente."
              </p>
              <div className="text-sm text-slate-400">
                <span className="font-semibold text-white">María González</span> - Cliente desde 2022
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


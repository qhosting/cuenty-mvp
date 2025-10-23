'use client'

import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button-dynamic'
import { Search, CreditCard, Download, Play, CheckCircle, ShieldCheck, Zap, Clock, Users, Star, TrendingUp, ArrowRight, Gift, Heart, Lock } from 'lucide-react'

const steps = [
  {
    number: '01',
    icon: Search,
    title: 'Explora Nuestro Catálogo',
    description: 'Navega por una amplia selección de plataformas de streaming premium disponibles en CUENTY.',
    details: [
      'Más de 100 servicios disponibles',
      'Netflix, Disney+, HBO Max, Spotify y más',
      'Diferentes planes y duraciones',
      'Precios desde $1.99/mes'
    ],
    color: 'from-blue-500 to-cyan-500',
    bgColor: 'from-blue-500/10 to-cyan-500/10',
    borderColor: 'border-blue-500/30'
  },
  {
    number: '02',
    icon: CreditCard,
    title: 'Selecciona y Compra',
    description: 'Elige el plan que más te convenga y completa tu compra de forma segura.',
    details: [
      'Múltiples métodos de pago',
      'Procesamiento seguro y encriptado',
      'Confirmación instantánea',
      'Factura electrónica incluida'
    ],
    color: 'from-green-500 to-emerald-500',
    bgColor: 'from-green-500/10 to-emerald-500/10',
    borderColor: 'border-green-500/30'
  },
  {
    number: '03',
    icon: Download,
    title: 'Recibe tus Credenciales',
    description: 'Obtén acceso inmediato a tus credenciales después de confirmar el pago.',
    details: [
      'Entrega inmediata por email',
      'Acceso desde tu dashboard',
      'Instrucciones de uso incluidas',
      'Soporte en tiempo real'
    ],
    color: 'from-purple-500 to-violet-500',
    bgColor: 'from-purple-500/10 to-violet-500/10',
    borderColor: 'border-purple-500/30'
  },
  {
    number: '04',
    icon: Play,
    title: 'Disfruta tu Contenido',
    description: 'Accede a todo el contenido premium y disfruta sin límites durante tu suscripción.',
    details: [
      'Acceso completo y sin restricciones',
      'Calidad HD/4K disponible',
      'Múltiples dispositivos',
      'Renovación automática opcional'
    ],
    color: 'from-pink-500 to-rose-500',
    bgColor: 'from-pink-500/10 to-rose-500/10',
    borderColor: 'border-pink-500/30'
  }
]

const features = [
  {
    icon: ShieldCheck,
    title: 'Seguridad Garantizada',
    description: 'Todas las transacciones están protegidas con encriptación de nivel bancario.',
    color: 'text-blue-400'
  },
  {
    icon: Zap,
    title: 'Entrega Instantánea',
    description: 'Recibe tus credenciales en segundos después de confirmar tu pago.',
    color: 'text-yellow-400'
  },
  {
    icon: Clock,
    title: 'Disponible 24/7',
    description: 'Compra y accede a tus cuentas en cualquier momento, todos los días del año.',
    color: 'text-green-400'
  },
  {
    icon: Users,
    title: 'Soporte Experto',
    description: 'Nuestro equipo está listo para ayudarte con cualquier duda o problema.',
    color: 'text-purple-400'
  },
  {
    icon: Star,
    title: 'Calidad Premium',
    description: 'Acceso completo a todas las funciones y contenido de cada plataforma.',
    color: 'text-orange-400'
  },
  {
    icon: TrendingUp,
    title: 'Mejor Precio',
    description: 'Los precios más competitivos del mercado sin comprometer la calidad.',
    color: 'text-pink-400'
  }
]

const benefits = [
  {
    icon: Gift,
    title: 'Sin Compromisos',
    description: 'Compra solo lo que necesites, cuando lo necesites. Sin contratos largos.'
  },
  {
    icon: Heart,
    title: 'Satisfacción Garantizada',
    description: 'Si no estás satisfecho, trabajamos contigo para resolver cualquier inconveniente.'
  },
  {
    icon: Lock,
    title: 'Privacidad Protegida',
    description: 'Tus datos están seguros y nunca compartimos tu información con terceros.'
  }
]

export default function ComoFuncionaPage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Header />
      
      {/* Hero Section */}
      <section className="relative pt-32 pb-20 overflow-hidden">
        {/* Background decorations */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
          <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600/20 to-purple-600/20 border border-blue-500/30 rounded-full px-4 py-2 mb-6">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            <span className="text-blue-400 text-sm font-medium">Proceso Simple y Rápido</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            ¿Cómo Funciona{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              CUENTY?
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-12">
            Descubre lo fácil que es acceder a tus plataformas de streaming favoritas con CUENTY. 
            En solo 4 pasos simples estarás disfrutando de contenido premium.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/catalogo"
              className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold"
            >
              <span>Explorar Catálogo</span>
              <ArrowRight className="w-5 h-5" />
            </a>
          </div>
        </div>
      </section>

      {/* Steps Section */}
      <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              El Proceso en{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                4 Pasos
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Desde la selección hasta el disfrute, todo está diseñado para tu comodidad
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="group relative transition-all duration-500 hover:scale-105"
              >
                {/* Connection line */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-20 left-full w-8 h-0.5 bg-gradient-to-r from-slate-600 to-slate-700 z-0 transform -translate-x-4"></div>
                )}

                <div
                  className={`relative bg-gradient-to-br ${step.bgColor} backdrop-blur-sm rounded-xl border ${step.borderColor} p-8 text-center overflow-hidden transition-all duration-300 hover:border-opacity-100 hover:shadow-2xl h-full`}
                >
                  <div className="relative">
                    {/* Step number */}
                    <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${step.color} rounded-full text-white font-bold text-xl mb-6 shadow-lg transition-transform duration-300 group-hover:scale-110`}>
                      {step.number}
                    </div>

                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                      <div className={`p-3 bg-gradient-to-r ${step.color} rounded-lg transition-all duration-300 group-hover:scale-110`}>
                        <step.icon className="w-6 h-6 text-white" />
                      </div>
                    </div>

                    {/* Content */}
                    <h3 className="text-xl font-bold text-white mb-4">
                      {step.title}
                    </h3>
                    
                    <p className="text-slate-300 mb-6 leading-relaxed">
                      {step.description}
                    </p>

                    {/* Details */}
                    <div className="space-y-2">
                      {step.details.map((detail, detailIndex) => (
                        <div 
                          key={detailIndex}
                          className="flex items-center justify-center space-x-2 text-xs text-slate-400"
                        >
                          <CheckCircle className="w-3 h-3 text-green-400 flex-shrink-0" />
                          <span className="group-hover:text-slate-300">{detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Bottom accent */}
                  <div className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${step.color} opacity-0 group-hover:opacity-100 transition-opacity`}></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-slate-900 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              ¿Por Qué Elegir{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                CUENTY?
              </span>
            </h2>
            <p className="text-xl text-slate-300 max-w-2xl mx-auto">
              Ofrecemos la mejor experiencia en servicios de streaming premium
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 hover:border-slate-600 transition-all duration-300 hover:scale-105"
              >
                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg bg-slate-800 mb-4`}>
                  <feature.icon className={`w-6 h-6 ${feature.color}`} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-gradient-to-b from-slate-900 to-slate-950 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Beneficios{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Adicionales
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
            {benefits.map((benefit) => (
              <div
                key={benefit.title}
                className="text-center group"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-4 group-hover:scale-110 transition-transform">
                  <benefit.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{benefit.title}</h3>
                <p className="text-slate-300">{benefit.description}</p>
              </div>
            ))}
          </div>

          {/* CTA */}
          <div className="bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 text-center relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            
            <div className="relative">
              <h3 className="text-3xl font-bold text-white mb-4">
                ¿Listo para Comenzar?
              </h3>
              <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
                Únete a miles de usuarios que ya disfrutan de entretenimiento premium 
                a precios accesibles con CUENTY.
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <a
                  href="/catalogo"
                  className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold"
                >
                  <span>Ver Productos</span>
                  <ArrowRight className="w-5 h-5" />
                </a>
                
                <a
                  href="/soporte"
                  className="inline-flex items-center justify-center space-x-2 text-white border border-white/20 px-8 py-4 rounded-lg hover:bg-white/10 transition-colors font-medium"
                >
                  <span>Contactar Soporte</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </main>
  )
}

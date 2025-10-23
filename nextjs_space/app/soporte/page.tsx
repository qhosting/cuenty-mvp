'use client'

import { useState } from 'react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button-dynamic'
import { 
  MessageCircle, 
  Mail, 
  Clock, 
  HelpCircle, 
  ChevronDown, 
  ChevronUp,
  Phone,
  Send,
  CheckCircle,
  Shield,
  Zap,
  Users,
  FileText,
  MessageSquare,
  AlertCircle
} from 'lucide-react'

const faqs = [
  {
    category: 'General',
    questions: [
      {
        question: '¿Qué es CUENTY?',
        answer: 'CUENTY es una plataforma que ofrece acceso a cuentas de servicios de streaming premium como Netflix, Disney+, HBO Max, Spotify y muchos más, a precios accesibles. Facilitamos el acceso a entretenimiento de calidad sin necesidad de contratos largos.'
      },
      {
        question: '¿Cómo funciona el servicio?',
        answer: 'El proceso es muy simple: 1) Exploras nuestro catálogo y eliges el servicio que deseas, 2) Realizas el pago de forma segura, 3) Recibes tus credenciales inmediatamente por email y en tu dashboard, 4) Disfrutas de tu servicio premium. Todo en cuestión de minutos.'
      },
      {
        question: '¿Es legal usar CUENTY?',
        answer: 'Sí, nuestro servicio es completamente legal. Proporcionamos acceso a cuentas compartidas legítimas de acuerdo con las políticas de uso de cada plataforma. Operamos bajo un modelo de suscripción compartida permitido por los proveedores de streaming.'
      }
    ]
  },
  {
    category: 'Pagos y Facturación',
    questions: [
      {
        question: '¿Qué métodos de pago aceptan?',
        answer: 'Aceptamos múltiples métodos de pago incluyendo tarjetas de crédito/débito (Visa, Mastercard, American Express), transferencias bancarias, PayPal y pagos en efectivo en puntos autorizados. Todos los pagos son procesados de forma segura con encriptación bancaria.'
      },
      {
        question: '¿Cuándo recibiré mi cuenta después del pago?',
        answer: 'La entrega es inmediata. Una vez que tu pago sea confirmado (lo cual suele tomar solo segundos), recibirás tus credenciales automáticamente por email y podrás verlas también en tu dashboard personal.'
      },
      {
        question: '¿Puedo obtener un reembolso?',
        answer: 'Ofrecemos garantía de satisfacción. Si tienes algún problema con tu cuenta dentro de las primeras 24 horas, contáctanos y trabajaremos para resolverlo o procesar tu reembolso. Consulta nuestras políticas de reembolso para más detalles.'
      },
      {
        question: '¿Ofrecen facturas?',
        answer: 'Sí, con cada compra recibirás una factura electrónica automáticamente en tu email registrado. También puedes descargar tus facturas desde tu dashboard en cualquier momento.'
      }
    ]
  },
  {
    category: 'Cuentas y Uso',
    questions: [
      {
        question: '¿Las cuentas son compartidas o individuales?',
        answer: 'Ofrecemos ambas opciones dependiendo del servicio. Algunas cuentas son individuales y otras son perfiles exclusivos dentro de cuentas compartidas. Cada producto especifica claramente el tipo de acceso que recibirás.'
      },
      {
        question: '¿Puedo cambiar la contraseña de mi cuenta?',
        answer: 'No, las credenciales son administradas por nosotros para garantizar el funcionamiento continuo del servicio. Sin embargo, tu acceso está protegido y es exclusivo para tu uso durante el período contratado.'
      },
      {
        question: '¿Qué pasa si la cuenta deja de funcionar?',
        answer: 'Si experimentas algún problema con tu cuenta, contáctanos inmediatamente a través de WhatsApp, email o nuestro chat de soporte. Nuestro equipo te proporcionará una solución o reemplazo en el menor tiempo posible.'
      },
      {
        question: '¿Cuántos dispositivos puedo usar?',
        answer: 'El número de dispositivos depende del plan específico que hayas adquirido y de las políticas de la plataforma de streaming. Esta información está detallada en la descripción de cada producto en nuestro catálogo.'
      }
    ]
  },
  {
    category: 'Renovaciones y Suscripciones',
    questions: [
      {
        question: '¿Cómo renuevo mi suscripción?',
        answer: 'Puedes renovar tu suscripción directamente desde tu dashboard antes de que expire. También ofrecemos la opción de renovación automática que puedes activar en la configuración de tu cuenta.'
      },
      {
        question: '¿Qué pasa cuando expira mi suscripción?',
        answer: 'Cuando tu suscripción expire, perderás acceso a las credenciales. Te enviaremos recordatorios por email antes del vencimiento. Puedes renovar en cualquier momento antes o después de la expiración, pero no se garantiza que obtengas las mismas credenciales.'
      },
      {
        question: '¿Puedo cancelar mi suscripción en cualquier momento?',
        answer: 'Sí, no hay compromisos a largo plazo. Puedes decidir no renovar tu suscripción cuando expire. Si deseas cancelar una suscripción con renovación automática, puedes hacerlo desde tu dashboard.'
      }
    ]
  },
  {
    category: 'Soporte Técnico',
    questions: [
      {
        question: '¿Cómo puedo contactar al soporte?',
        answer: 'Ofrecemos múltiples canales de soporte: WhatsApp (respuesta más rápida), email, chat en vivo en nuestro sitio web, y soporte por teléfono. Nuestros horarios de atención son de lunes a domingo de 9:00 AM a 10:00 PM.'
      },
      {
        question: '¿Cuál es el tiempo de respuesta del soporte?',
        answer: 'Nos esforzamos por responder todas las consultas en menos de 2 horas durante nuestro horario de atención. Para urgencias, WhatsApp es el canal más rápido con respuestas típicamente en menos de 30 minutos.'
      },
      {
        question: '¿Ofrecen soporte en otros idiomas?',
        answer: 'Actualmente nuestro soporte está disponible principalmente en español. Para consultas en otros idiomas, haremos nuestro mejor esfuerzo para asistirte o dirigirte con el recurso apropiado.'
      }
    ]
  }
]

const contactMethods = [
  {
    icon: MessageCircle,
    title: 'WhatsApp',
    description: 'La forma más rápida de contactarnos',
    detail: 'Respuesta promedio: < 30 minutos',
    action: 'Iniciar Chat',
    color: 'from-green-500 to-emerald-500',
    link: 'https://wa.me/message/IOR2WUU66JVMM1'
  },
  {
    icon: Mail,
    title: 'Email',
    description: 'Para consultas detalladas',
    detail: 'soporte@cuenty.com',
    action: 'Enviar Email',
    color: 'from-blue-500 to-cyan-500',
    link: 'mailto:soporte@cuenty.com'
  },
  {
    icon: MessageSquare,
    title: 'Chat en Vivo',
    description: 'Habla con un agente en tiempo real',
    detail: 'Disponible en nuestro sitio web',
    action: 'Abrir Chat',
    color: 'from-purple-500 to-violet-500',
    link: '#'
  }
]

const supportFeatures = [
  {
    icon: Clock,
    title: 'Atención Extendida',
    description: 'Lunes a Domingo de 9:00 AM a 10:00 PM'
  },
  {
    icon: Zap,
    title: 'Respuesta Rápida',
    description: 'Tiempo promedio de respuesta: menos de 2 horas'
  },
  {
    icon: Users,
    title: 'Equipo Experto',
    description: 'Personal capacitado para resolver cualquier problema'
  },
  {
    icon: Shield,
    title: 'Soporte Garantizado',
    description: 'Asistencia incluida durante toda tu suscripción'
  }
]

export default function SoportePage() {
  const [openFaq, setOpenFaq] = useState<string | null>(null)
  const [openCategory, setOpenCategory] = useState<string | null>(faqs[0].category)

  const toggleFaq = (question: string) => {
    setOpenFaq(openFaq === question ? null : question)
  }

  const toggleCategory = (category: string) => {
    setOpenCategory(openCategory === category ? null : category)
  }

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
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-green-600/20 to-blue-600/20 border border-green-500/30 rounded-full px-4 py-2 mb-6">
            <HelpCircle className="w-4 h-4 text-green-400" />
            <span className="text-green-400 text-sm font-medium">Estamos aquí para ayudarte</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
            Centro de{' '}
            <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Soporte
            </span>
          </h1>
          
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-12">
            ¿Tienes preguntas? Estamos aquí para ayudarte. Encuentra respuestas rápidas 
            en nuestras FAQs o contáctanos directamente.
          </p>
        </div>
      </section>

      {/* Contact Methods */}
      <section className="py-16 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              ¿Cómo Podemos{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Ayudarte?
              </span>
            </h2>
            <p className="text-slate-300 max-w-2xl mx-auto">
              Elige el canal que más te convenga para contactarnos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {contactMethods.map((method) => (
              <div
                key={method.title}
                className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-8 text-center hover:border-slate-600 transition-all duration-300 hover:scale-105"
              >
                <div className={`inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r ${method.color} rounded-full mb-6 shadow-lg`}>
                  <method.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">{method.title}</h3>
                <p className="text-slate-300 mb-4">{method.description}</p>
                <p className="text-sm text-slate-400 mb-6">{method.detail}</p>
                <a
                  href={method.link}
                  target={method.link.startsWith('http') ? '_blank' : '_self'}
                  rel={method.link.startsWith('http') ? 'noopener noreferrer' : ''}
                  className={`inline-flex items-center space-x-2 bg-gradient-to-r ${method.color} text-white px-6 py-3 rounded-lg hover:opacity-90 transition-opacity font-medium`}
                >
                  <span>{method.action}</span>
                  <Send className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Support Features */}
      <section className="py-16 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {supportFeatures.map((feature) => (
              <div
                key={feature.title}
                className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6 text-center"
              >
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-slate-800 mb-4">
                  <feature.icon className="w-6 h-6 text-blue-400" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">{feature.title}</h3>
                <p className="text-sm text-slate-300">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-slate-950">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Preguntas{' '}
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Frecuentes
              </span>
            </h2>
            <p className="text-xl text-slate-300">
              Encuentra respuestas a las preguntas más comunes
            </p>
          </div>

          <div className="space-y-6">
            {faqs.map((category) => (
              <div key={category.category} className="bg-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
                <button
                  onClick={() => toggleCategory(category.category)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/30 transition-colors"
                >
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-blue-400" />
                    <span className="text-xl font-bold text-white">{category.category}</span>
                  </div>
                  {openCategory === category.category ? (
                    <ChevronUp className="w-5 h-5 text-slate-400" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-slate-400" />
                  )}
                </button>

                {openCategory === category.category && (
                  <div className="px-6 pb-6 space-y-4">
                    {category.questions.map((faq) => (
                      <div
                        key={faq.question}
                        className="border border-slate-700/50 rounded-lg overflow-hidden"
                      >
                        <button
                          onClick={() => toggleFaq(faq.question)}
                          className="w-full flex items-start justify-between p-4 text-left hover:bg-slate-800/30 transition-colors"
                        >
                          <div className="flex items-start space-x-3 flex-1">
                            <HelpCircle className="w-5 h-5 text-blue-400 mt-1 flex-shrink-0" />
                            <span className="font-medium text-white">{faq.question}</span>
                          </div>
                          {openFaq === faq.question ? (
                            <ChevronUp className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0" />
                          ) : (
                            <ChevronDown className="w-5 h-5 text-slate-400 ml-2 flex-shrink-0" />
                          )}
                        </button>

                        {openFaq === faq.question && (
                          <div className="px-4 pb-4 pl-12">
                            <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Additional Help Section */}
      <section className="py-16 bg-gradient-to-b from-slate-950 to-slate-900 relative overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute bottom-0 left-1/3 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
        </div>

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 md:p-12 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 mb-6">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>

            <h3 className="text-3xl font-bold text-white mb-4">
              ¿No Encontraste lo que Buscabas?
            </h3>
            <p className="text-slate-300 mb-8 max-w-2xl mx-auto">
              Nuestro equipo de soporte está listo para ayudarte con cualquier pregunta 
              o problema que puedas tener. No dudes en contactarnos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://wa.me/message/IOR2WUU66JVMM1"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center space-x-2 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-8 py-4 rounded-lg hover:from-green-700 hover:to-emerald-700 transition-colors font-semibold"
              >
                <MessageCircle className="w-5 h-5" />
                <span>Contactar por WhatsApp</span>
              </a>
              
              <a
                href="mailto:soporte@cuenty.com"
                className="inline-flex items-center justify-center space-x-2 text-white border border-white/20 px-8 py-4 rounded-lg hover:bg-white/10 transition-colors font-medium"
              >
                <Mail className="w-5 h-5" />
                <span>Enviar Email</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Policies Section */}
      <section className="py-16 bg-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Políticas de{' '}
              <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
                Soporte
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Tiempo de Respuesta</h3>
                  <p className="text-slate-300 text-sm">
                    Nos comprometemos a responder todas las consultas en un máximo de 24 horas. 
                    La mayoría de consultas son atendidas en menos de 2 horas durante nuestro horario de atención.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Soporte Incluido</h3>
                  <p className="text-slate-300 text-sm">
                    Todo plan incluye soporte técnico completo durante toda la vigencia de tu suscripción. 
                    Sin costos adicionales, sin letra pequeña.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Reemplazo de Cuentas</h3>
                  <p className="text-slate-300 text-sm">
                    Si experimentas problemas con tu cuenta, te proporcionaremos un reemplazo 
                    o solución en el menor tiempo posible, generalmente en menos de 12 horas.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-slate-800/30 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white mb-2">Satisfacción Garantizada</h3>
                  <p className="text-slate-300 text-sm">
                    Tu satisfacción es nuestra prioridad. Si no estás conforme con el servicio, 
                    trabajaremos contigo para encontrar una solución satisfactoria.
                  </p>
                </div>
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

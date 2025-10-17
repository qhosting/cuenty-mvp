
'use client'

import { useState } from 'react'
import { ChevronDown, MessageSquare } from 'lucide-react'

export function FAQSection() {
  const [openItems, setOpenItems] = useState<number[]>([0])

  const faqs = [
    {
      question: '¿Cómo funciona el servicio de CUENTY?',
      answer: 'CUENTY te proporciona acceso a cuentas premium verificadas de las principales plataformas de streaming. Una vez realices tu compra, recibirás las credenciales por WhatsApp para acceder inmediatamente a tu servicio elegido.'
    },
    {
      question: '¿Las cuentas son seguras y legales?',
      answer: 'Sí, todas nuestras cuentas son completamente legales y seguras. Trabajamos directamente con proveedores autorizados y todas las cuentas están verificadas antes de ser entregadas a nuestros clientes.'
    },
    {
      question: '¿Cuánto tiempo tarda la entrega?',
      answer: 'La entrega es inmediata. Una vez confirmes tu pago, recibirás las credenciales por WhatsApp en cuestión de minutos. Nuestro sistema automatizado procesa las órdenes las 24 horas del día.'
    },
    {
      question: '¿Qué pasa si la cuenta deja de funcionar?',
      answer: 'Ofrecemos garantía total en todas nuestras cuentas. Si experimentas algún problema, contáctanos inmediatamente y te proporcionaremos una cuenta de reemplazo o te devolveremos tu dinero.'
    },
    {
      question: '¿Qué métodos de pago aceptan?',
      answer: 'Aceptamos transferencias bancarias, SPEI, Oxxo Pay, y otros métodos de pago locales. El proceso es completamente seguro y encriptado para proteger tu información.'
    },
    {
      question: '¿Hay soporte técnico disponible?',
      answer: 'Sí, ofrecemos soporte técnico 24/7 a través de WhatsApp. Nuestro equipo está siempre listo para ayudarte con cualquier duda o problema que puedas tener.'
    },
  ]

  const toggleItem = (index: number) => {
    setOpenItems(prev =>
      prev.includes(index)
        ? prev.filter(i => i !== index)
        : [...prev, index]
    )
  }

  return (
    <section id="faq" className="py-24 bg-slate-800/30">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Preguntas <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Frecuentes</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Resolvemos las dudas más comunes sobre nuestro servicio. Si tienes otra pregunta, no dudes en contactarnos.
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4 mb-16">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-slate-700/30 transition-colors"
              >
                <h3 className="text-lg font-semibold text-white pr-4">{faq.question}</h3>
                <ChevronDown
                  className={`w-5 h-5 text-slate-400 flex-shrink-0 transition-transform duration-200 ${
                    openItems.includes(index) ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openItems.includes(index) && (
                <div className="px-6 pb-4">
                  <div className="border-t border-slate-700 pt-4">
                    <p className="text-slate-300 leading-relaxed">{faq.answer}</p>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">¿Tienes más preguntas?</h3>
            <p className="text-slate-300 mb-6">
              Nuestro equipo de soporte está listo para ayudarte con cualquier duda.
            </p>
            <button
              onClick={() => {
                const message = encodeURIComponent('¡Hola! Tengo algunas preguntas sobre CUENTY. ¿Podrían ayudarme? 🤔')
                const whatsappUrl = `https://wa.me/message/IOR2WUU66JVMM1?text=${message}`
                window.open(whatsappUrl, '_blank')
              }}
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
            >
              <MessageSquare className="w-4 h-4" />
              <span>Contactar Soporte</span>
            </button>
          </div>
        </div>
      </div>
    </section>
  )
}

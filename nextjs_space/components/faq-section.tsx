
'use client'

import { motion } from 'framer-motion'
import { ChevronDown, ChevronUp } from 'lucide-react'
import { useState } from 'react'

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
    question: '¿Puedo cambiar la contraseña de la cuenta?',
    answer: 'Recomendamos no cambiar las credenciales de las cuentas compartidas para mantener su funcionamiento. Si necesitas una cuenta personal, ofrecemos opciones premium con acceso completo.'
  },
  {
    question: '¿Qué métodos de pago aceptan?',
    answer: 'Aceptamos transferencias bancarias, SPEI, Oxxo Pay, y otros métodos de pago locales. El proceso es completamente seguro y encriptado para proteger tu información.'
  },
  {
    question: '¿Hay soporte técnico disponible?',
    answer: 'Sí, ofrecemos soporte técnico 24/7 a través de WhatsApp. Nuestro equipo está siempre listo para ayudarte con cualquier duda o problema que puedas tener.'
  },
  {
    question: '¿Puedo compartir la cuenta con otros?',
    answer: 'Las cuentas tienen un número limitado de pantallas simultáneas según el servicio. Recomendamos respetar estos límites para mantener el buen funcionamiento de la cuenta.'
  }
]

export function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null)

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index)
  }

  return (
    <section id="faq" className="py-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Preguntas <span className="text-gradient">Frecuentes</span>
          </h2>
          <p className="text-xl text-white/70 max-w-3xl mx-auto">
            Resolvemos las dudas más comunes sobre nuestro servicio.
            Si tienes otra pregunta, no dudes en contactarnos.
          </p>
        </motion.div>

        <div className="space-y-4">
          {faqs?.map((faq, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
            >
              <div className="card card-hover">
                <button
                  onClick={() => toggleFAQ(index)}
                  className="w-full text-left flex items-center justify-between"
                >
                  <h3 className="text-lg font-semibold text-white pr-8">
                    {faq?.question}
                  </h3>
                  <div className="flex-shrink-0">
                    {openIndex === index ? (
                      <ChevronUp className="w-6 h-6 text-white/60" />
                    ) : (
                      <ChevronDown className="w-6 h-6 text-white/60" />
                    )}
                  </div>
                </button>

                <motion.div
                  initial={false}
                  animate={{
                    height: openIndex === index ? 'auto' : 0,
                    opacity: openIndex === index ? 1 : 0,
                  }}
                  transition={{ duration: 0.3 }}
                  className="overflow-hidden"
                >
                  <div className="pt-4 border-t border-white/10 mt-4">
                    <p className="text-white/70 leading-relaxed">{faq?.answer}</p>
                  </div>
                </motion.div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Contact CTA */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 text-center"
        >
          <div className="card max-w-xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">¿Tienes más preguntas?</h3>
            <p className="text-white/70 mb-6">
              Nuestro equipo de soporte está listo para ayudarte con cualquier duda.
            </p>
            <button className="btn-primary">
              Contactar Soporte
            </button>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

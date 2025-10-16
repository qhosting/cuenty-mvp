
'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { Mail, Phone, MapPin, Clock } from 'lucide-react'

export function Footer() {
  return (
    <footer id="contacto" className="bg-black/40 border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-2"
          >
            <Link href="/" className="inline-block mb-6">
              <div className="relative w-40 h-10">
                <Image
                  src="/images/CUENTY.png"
                  alt="CUENTY Logo"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            
            <p className="text-white/70 mb-6 max-w-md leading-relaxed">
              La plataforma más confiable de México para obtener cuentas premium 
              de streaming y entretenimiento. Acceso inmediato, precios justos, 
              soporte 24/7.
            </p>

            <div className="flex flex-col space-y-3">
              <div className="flex items-center space-x-3 text-white/60">
                <Mail className="w-5 h-5 text-cyan-400" />
                <span>soporte@cuenty.com</span>
              </div>
              <div className="flex items-center space-x-3 text-white/60">
                <Phone className="w-5 h-5 text-cyan-400" />
                <span>WhatsApp: +52 55 1234 5678</span>
              </div>
              <div className="flex items-center space-x-3 text-white/60">
                <MapPin className="w-5 h-5 text-cyan-400" />
                <span>Ciudad de México, México</span>
              </div>
              <div className="flex items-center space-x-3 text-white/60">
                <Clock className="w-5 h-5 text-cyan-400" />
                <span>Atención 24/7</span>
              </div>
            </div>
          </motion.div>

          {/* Services */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <h3 className="text-lg font-semibold text-white mb-6">Servicios</h3>
            <ul className="space-y-3">
              {[
                'Netflix Premium',
                'Disney+ Premium',
                'HBO Max',
                'Prime Video',
                'Spotify Premium',
                'YouTube Premium',
                'Apple TV+',
                'Crunchyroll'
              ].map((service, index) => (
                <li key={index}>
                  <Link 
                    href="#productos" 
                    className="text-white/60 hover:text-white/80 transition-colors duration-300 text-sm"
                  >
                    {service}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>

          {/* Support */}
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.3 }}
          >
            <h3 className="text-lg font-semibold text-white mb-6">Soporte</h3>
            <ul className="space-y-3">
              {[
                { name: 'Centro de Ayuda', href: '#faq' },
                { name: 'Cómo Funciona', href: '#como-funciona' },
                { name: 'Garantías', href: '#caracteristicas' },
                { name: 'Contacto', href: '#contacto' }
              ].map((item, index) => (
                <li key={index}>
                  <Link 
                    href={item?.href || '#'} 
                    className="text-white/60 hover:text-white/80 transition-colors duration-300 text-sm"
                  >
                    {item?.name}
                  </Link>
                </li>
              ))}
            </ul>
          </motion.div>
        </div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16"
        >
          <div className="card max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">¿Necesitas ayuda?</h3>
            <form className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Tu nombre"
                  className="input-field"
                  required
                />
                <input
                  type="email"
                  placeholder="Tu email"
                  className="input-field"
                  required
                />
              </div>
              <input
                type="text"
                placeholder="Asunto"
                className="input-field"
                required
              />
              <textarea
                placeholder="Tu mensaje..."
                rows={4}
                className="input-field resize-none"
                required
              ></textarea>
              <button type="submit" className="w-full btn-primary">
                Enviar Mensaje
              </button>
            </form>
          </div>
        </motion.div>

        {/* Bottom Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row items-center justify-between"
        >
          <div className="text-white/60 text-sm mb-4 md:mb-0">
            © 2025 CUENTY. Todos los derechos reservados.
          </div>
          <div className="flex space-x-6">
            <Link href="#" className="text-white/60 hover:text-white/80 transition-colors duration-300 text-sm">
              Términos de Servicio
            </Link>
            <Link href="#" className="text-white/60 hover:text-white/80 transition-colors duration-300 text-sm">
              Política de Privacidad
            </Link>
          </div>
        </motion.div>
      </div>
    </footer>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { Mail, Phone, MapPin, Clock, Send, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export function Footer() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [apiVersion, setApiVersion] = useState<string | null>(null)

  // Obtener versión de la API
  useEffect(() => {
    const fetchApiVersion = async () => {
      try {
        const response = await fetch('/api/version')
        if (response.ok) {
          const data = await response.json()
          setApiVersion(data.version)
        }
      } catch (error) {
        console.error('Error al obtener versión de API:', error)
      }
    }
    fetchApiVersion()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        alert('Mensaje enviado correctamente. Te contactaremos pronto.')
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        alert('Error al enviar el mensaje. Intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error al enviar el mensaje. Intenta de nuevo.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const services = [
    'Netflix Premium',
    'Disney+ Premium', 
    'HBO Max',
    'Prime Video',
    'Spotify Premium',
    'YouTube Premium',
    'Apple TV+',
    'Crunchyroll'
  ]

  const supportLinks = [
    { name: 'Centro de Ayuda', href: '#faq' },
    { name: 'Cómo Funciona', href: '#como-funciona' },
    { name: 'Garantías', href: '#caracteristicas' },
    { name: 'Contacto', href: '#contacto' }
  ]

  return (
    <footer id="contacto" className="bg-slate-900 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main footer content */}
        <div className="py-16 grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Brand section */}
          <div className="lg:col-span-1">
            <Link href="/" className="inline-block mb-6">
              <div className="relative w-40 h-10">
                <Image
                  src="/images/CUENTY.png"
                  alt="CUENTY"
                  fill
                  className="object-contain"
                />
              </div>
            </Link>
            
            <p className="text-slate-300 mb-6 leading-relaxed">
              La plataforma más confiable de México para obtener cuentas premium de streaming y entretenimiento. 
              Acceso inmediato, precios justos, soporte 24/7.
            </p>

            <div className="space-y-3">
              {[
                { icon: Mail, text: 'soporte@cuenty.com' },
                { icon: Phone, text: 'WhatsApp: +52 55 1234 5678' },
                { icon: MapPin, text: 'Ciudad de México, México' },
                { icon: Clock, text: 'Atención 24/7' },
              ].map((item, index) => (
                <div key={index} className="flex items-center space-x-3 text-slate-300">
                  <item.icon className="w-4 h-4 text-blue-400" />
                  <span className="text-sm">{item.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Services and Support */}
          <div className="lg:col-span-1 grid grid-cols-1 sm:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Servicios</h3>
              <ul className="space-y-2">
                {services.map((service) => (
                  <li key={service}>
                    <Link
                      href="/catalogo"
                      className="text-slate-300 hover:text-white transition-colors text-sm"
                    >
                      {service}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Soporte</h3>
              <ul className="space-y-2">
                {supportLinks.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-slate-300 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Contact form */}
          <div className="lg:col-span-1">
            <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
              <h3 className="text-lg font-semibold text-white mb-4">¿Necesitas ayuda?</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <input
                    type="text"
                    name="name"
                    placeholder="Tu nombre"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                  />
                  <input
                    type="email"
                    name="email"
                    placeholder="Tu email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                  />
                </div>
                <input
                  type="text"
                  name="subject"
                  placeholder="Asunto"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none text-sm"
                />
                <textarea
                  name="message"
                  placeholder="Tu mensaje..."
                  rows={3}
                  value={formData.message}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none resize-none text-sm"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium disabled:opacity-50 text-sm"
                >
                  <Send className="w-4 h-4" />
                  <span>{isSubmitting ? 'Enviando...' : 'Enviar Mensaje'}</span>
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom footer */}
        <div className="py-6 border-t border-slate-800">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
            <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-4">
              <div className="text-slate-400 text-sm">
                &copy; 2025 CUENTY. Todos los derechos reservados.
              </div>
              {apiVersion && (
                <div className="text-slate-500 text-xs px-3 py-1 bg-slate-800/50 rounded-full border border-slate-700">
                  API v{apiVersion}
                </div>
              )}
            </div>
            <div className="flex space-x-6">
              <Link href="/terminos" className="text-slate-400 hover:text-white transition-colors text-sm">
                Términos de Servicio
              </Link>
              <Link href="/privacidad" className="text-slate-400 hover:text-white transition-colors text-sm">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

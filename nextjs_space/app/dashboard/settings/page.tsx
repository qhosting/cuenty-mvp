
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Phone, Mail, Save, ArrowLeft, Shield, Bell, MessageSquare } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function SettingsPage() {
  const sessionData = useSession() || {}; const session = sessionData.data || null; const status = sessionData.status || "loading"
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    deliveryPreference: 'whatsapp'
  })
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }

    // Inicializar formulario con datos del usuario
    setFormData({
      name: session.user?.name || '',
      email: session.user?.email || '',
      phone: session.user?.phone || '',
      deliveryPreference: 'whatsapp'
    })
  }, [session, status, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
    if (message) setMessage('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')

    try {
      // Simular guardado (en un entorno real, esto sería una llamada a la API)
      await new Promise(resolve => setTimeout(resolve, 1000))
      setMessage('Configuración guardada exitosamente')
    } catch (error) {
      console.error('Error saving settings:', error)
      setMessage('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  if (status === 'loading') {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-slate-700 rounded w-1/4"></div>
              <div className="h-96 bg-slate-800/50 rounded-xl"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!session) {
    return null
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Dashboard</span>
            </Link>
            
            <h1 className="text-4xl font-bold text-white mb-2">Configuración</h1>
            <p className="text-xl text-slate-300">
              Administra tu información personal y preferencias de entrega
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Settings Form */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8">
                <h2 className="text-2xl font-semibold text-white mb-6">Información Personal</h2>

                {message && (
                  <div className={`mb-6 px-4 py-3 rounded-lg text-sm ${
                    message.includes('exitosamente') 
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400'
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}>
                    {message}
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-slate-300 mb-2">
                        Nombre completo
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          id="name"
                          name="name"
                          type="text"
                          required
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="Tu nombre completo"
                        />
                      </div>
                    </div>

                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                        Email
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                          id="email"
                          name="email"
                          type="email"
                          required
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          placeholder="tu@email.com"
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-slate-300 mb-2">
                      Teléfono
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Phone className="h-5 w-5 text-slate-400" />
                      </div>
                      <input
                        id="phone"
                        name="phone"
                        type="tel"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        placeholder="+52 55 1234 5678"
                      />
                    </div>
                    <p className="mt-1 text-sm text-slate-400">
                      Este será tu método principal de contacto para recibir credenciales
                    </p>
                  </div>

                  <div>
                    <label htmlFor="deliveryPreference" className="block text-sm font-medium text-slate-300 mb-2">
                      Preferencia de entrega
                    </label>
                    <select
                      id="deliveryPreference"
                      name="deliveryPreference"
                      value={formData.deliveryPreference}
                      onChange={handleChange}
                      className="w-full px-3 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    >
                      <option value="whatsapp">WhatsApp (Recomendado)</option>
                      <option value="email">Email</option>
                      <option value="both">Ambos métodos</option>
                    </select>
                    <p className="mt-1 text-sm text-slate-400">
                      Cómo prefieres recibir las credenciales de acceso
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={saving}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                  >
                    <Save className="w-5 h-5" />
                    <span>{saving ? 'Guardando...' : 'Guardar Cambios'}</span>
                  </button>
                </form>
              </div>
            </div>

            {/* Settings Info */}
            <div className="space-y-6">
              {/* Security Info */}
              <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-green-500/20 rounded-lg">
                    <Shield className="w-5 h-5 text-green-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Seguridad</h3>
                </div>
                <div className="space-y-3 text-sm text-slate-300">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Tu información está protegida con encriptación</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Nunca compartimos datos con terceros</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                    <span>Comunicación solo por WhatsApp oficial</span>
                  </div>
                </div>
              </div>

              {/* Delivery Options */}
              <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-blue-500/20 rounded-lg">
                    <Bell className="w-5 h-5 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-semibold text-white">Métodos de Entrega</h3>
                </div>
                <div className="space-y-4 text-sm">
                  <div className="flex items-start space-x-3">
                    <MessageSquare className="w-5 h-5 text-green-400 mt-0.5" />
                    <div>
                      <div className="text-white font-medium">WhatsApp</div>
                      <div className="text-slate-400">Entrega inmediata y soporte directo</div>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <Mail className="w-5 h-5 text-blue-400 mt-0.5" />
                    <div>
                      <div className="text-white font-medium">Email</div>
                      <div className="text-slate-400">Credenciales organizadas en tu bandeja</div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Support */}
              <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">¿Necesitas ayuda?</h3>
                <p className="text-slate-300 text-sm mb-4">
                  Nuestro equipo está disponible 24/7 para resolver cualquier duda sobre tu cuenta.
                </p>
                <button
                  onClick={() => {
                    const message = encodeURIComponent('¡Hola! Tengo una consulta sobre la configuración de mi cuenta en CUENTY. ¿Podrían ayudarme? 🛠️')
                    const whatsappUrl = `https://wa.me/message/IOR2WUU66JVMM1?text=${message}`
                    window.open(whatsappUrl, '_blank')
                  }}
                  className="w-full bg-green-500/20 hover:bg-green-500/30 text-green-400 py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                >
                  Contactar Soporte
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}


'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Phone, Mail, Lock, Eye, EyeOff, ArrowRight, Loader2, Check } from 'lucide-react'
import Link from 'next/link'
import { AuthPageLogo } from '@/components/dynamic-logo'

export default function RegisterPage() {
  const router = useRouter()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    acceptTerms: false
  })
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, type, checked, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
    if (error) setError('')
  }

  const validateForm = () => {
    if (!formData.name.trim()) {
      setError('El nombre es obligatorio')
      return false
    }
    if (!formData.email.includes('@')) {
      setError('El email no es válido')
      return false
    }
    if (!formData.phone.trim()) {
      setError('El teléfono es obligatorio')
      return false
    }
    if (formData.password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres')
      return false
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden')
      return false
    }
    if (!formData.acceptTerms) {
      setError('Debes aceptar los términos y condiciones')
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsLoading(true)
    setError('')

    try {
      // Crear usuario
      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Error al crear la cuenta')
        return
      }

      // Auto-login después del registro
      const result = await signIn('credentials', {
        phone: formData.phone,
        password: formData.password,
        redirect: false
      })

      if (result?.error) {
        // Si falla el auto-login, redirigir a login
        router.push('/auth/login?message=Cuenta creada exitosamente. Inicia sesión.')
      } else {
        router.push('/dashboard')
        router.refresh()
      }
    } catch (error) {
      console.error('Registration error:', error)
      setError('Error al crear la cuenta. Intenta de nuevo.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="mb-6">
            <AuthPageLogo />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">Crear Cuenta</h1>
          <p className="text-slate-300">Únete a CUENTY y disfruta de streaming premium</p>
        </div>

        {/* Form */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

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
                  placeholder="Tu nombre completo"
                  className="w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
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
                  placeholder="tu@email.com"
                  className="w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
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
                  placeholder="+52 55 1234 5678"
                  className="w-full pl-10 pr-3 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                Confirmar contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirma tu contraseña"
                  className="w-full pl-10 pr-12 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                  ) : (
                    <Eye className="h-5 w-5 text-slate-400 hover:text-white transition-colors" />
                  )}
                </button>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="relative">
                <input
                  id="acceptTerms"
                  name="acceptTerms"
                  type="checkbox"
                  required
                  checked={formData.acceptTerms}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div
                  onClick={() => setFormData(prev => ({ ...prev, acceptTerms: !prev.acceptTerms }))}
                  className={`w-5 h-5 rounded border-2 flex items-center justify-center cursor-pointer transition-colors ${
                    formData.acceptTerms
                      ? 'bg-blue-500 border-blue-500'
                      : 'bg-slate-900/50 border-slate-600 hover:border-slate-500'
                  }`}
                >
                  {formData.acceptTerms && <Check className="w-3 h-3 text-white" />}
                </div>
              </div>
              <label htmlFor="acceptTerms" className="text-sm text-slate-300 leading-5">
                Acepto los{' '}
                <Link href="/terminos" className="text-blue-400 hover:text-blue-300 transition-colors">
                  términos y condiciones
                </Link>
                {' '}y la{' '}
                <Link href="/privacidad" className="text-blue-400 hover:text-blue-300 transition-colors">
                  política de privacidad
                </Link>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-4 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
            >
              {isLoading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                <>
                  <span>Crear Cuenta</span>
                  <ArrowRight className="h-5 w-5" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-slate-300">
              ¿Ya tienes cuenta?{' '}
              <Link href="/auth/login" className="text-blue-400 hover:text-blue-300 transition-colors font-medium">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </div>

        {/* Back to home */}
        <div className="mt-8 text-center">
          <Link href="/" className="text-slate-400 hover:text-white transition-colors">
            ← Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}

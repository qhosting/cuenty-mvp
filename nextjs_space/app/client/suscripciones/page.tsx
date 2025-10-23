'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  RefreshCw,
  Settings,
  CreditCard,
  Play,
  Pause,
  AlertTriangle
} from 'lucide-react'
import { clientApi } from '@/lib/client-api'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Suscripcion {
  id: number
  estado: 'activa' | 'pausada' | 'cancelada' | 'vencida'
  fechaProximaRenovacion: string
  diasRestantes: number
  renovacionAutomatica: boolean
  servicio: {
    idServicio: number
    nombre: string
    logoUrl?: string
  }
  plan: {
    idPlan: number
    nombrePlan: string
    precioVenta?: number
  }
  cuenta?: {
    idCuenta: number
    perfil?: string
  }
}

export default function MisSuscripcionesPage() {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([])
  const [loading, setLoading] = useState(true)
  const [renovando, setRenovando] = useState<number | null>(null)

  useEffect(() => {
    cargarSuscripciones()
  }, [])

  const cargarSuscripciones = async () => {
    try {
      setLoading(true)
      const response = await clientApi.getSuscripciones()
      setSuscripciones(response.data || [])
    } catch (error: any) {
      console.error('Error al cargar suscripciones:', error)
      toast.error('Error al cargar tus suscripciones')
    } finally {
      setLoading(false)
    }
  }

  const renovarSuscripcion = async (id: number) => {
    if (!confirm('¿Deseas renovar esta suscripción ahora?')) return

    try {
      setRenovando(id)
      await clientApi.renovarSuscripcion(id)
      toast.success('Suscripción renovada correctamente')
      cargarSuscripciones()
    } catch (error: any) {
      toast.error('Error al renovar la suscripción')
    } finally {
      setRenovando(null)
    }
  }

  const toggleRenovacionAutomatica = async (id: number, actual: boolean) => {
    try {
      await clientApi.actualizarConfigSuscripcion(id, { renovacionAutomatica: !actual })
      toast.success(`Renovación automática ${!actual ? 'activada' : 'desactivada'}`)
      cargarSuscripciones()
    } catch (error: any) {
      toast.error('Error al actualizar la configuración')
    }
  }

  const cancelarSuscripcion = async (id: number) => {
    if (!confirm('¿Estás seguro de que deseas cancelar esta suscripción?')) return

    try {
      await clientApi.cancelarSuscripcion(id, 'Cancelada por el cliente')
      toast.success('Suscripción cancelada')
      cargarSuscripciones()
    } catch (error: any) {
      toast.error('Error al cancelar la suscripción')
    }
  }

  const getUrgenciaConfig = (diasRestantes: number) => {
    if (diasRestantes <= 0) {
      return {
        color: 'border-gray-300 bg-gray-50',
        badge: 'bg-gray-100 text-gray-800',
        message: 'Vencida',
        icon: XCircle,
        iconColor: 'text-gray-600'
      }
    }
    if (diasRestantes <= 1) {
      return {
        color: 'border-red-300 bg-red-50',
        badge: 'bg-red-100 text-red-800',
        message: 'Vence mañana',
        icon: AlertTriangle,
        iconColor: 'text-red-600'
      }
    }
    if (diasRestantes <= 3) {
      return {
        color: 'border-orange-300 bg-orange-50',
        badge: 'bg-orange-100 text-orange-800',
        message: `Vence en ${diasRestantes} días`,
        icon: AlertCircle,
        iconColor: 'text-orange-600'
      }
    }
    if (diasRestantes <= 7) {
      return {
        color: 'border-yellow-300 bg-yellow-50',
        badge: 'bg-yellow-100 text-yellow-800',
        message: `Vence en ${diasRestantes} días`,
        icon: Clock,
        iconColor: 'text-yellow-600'
      }
    }
    return {
      color: 'border-green-300 bg-green-50',
      badge: 'bg-green-100 text-green-800',
      message: `${diasRestantes} días restantes`,
      icon: CheckCircle,
      iconColor: 'text-green-600'
    }
  }

  const suscripcionesActivas = suscripciones.filter(s => s.estado === 'activa')
  const suscripcionesInactivas = suscripciones.filter(s => s.estado !== 'activa')

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Mis Suscripciones</h1>
        <p className="text-gray-500 mt-1">Gestiona y renueva tus suscripciones activas</p>
      </div>

      {/* Resumen */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Activas</p>
              <p className="text-3xl font-bold text-green-600 mt-1">{suscripcionesActivas.length}</p>
            </div>
            <CheckCircle className="w-10 h-10 text-green-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Por vencer (7 días)</p>
              <p className="text-3xl font-bold text-yellow-600 mt-1">
                {suscripcionesActivas.filter(s => s.diasRestantes <= 7 && s.diasRestantes > 0).length}
              </p>
            </div>
            <AlertCircle className="w-10 h-10 text-yellow-500" />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Urgentes (3 días)</p>
              <p className="text-3xl font-bold text-red-600 mt-1">
                {suscripcionesActivas.filter(s => s.diasRestantes <= 3 && s.diasRestantes > 0).length}
              </p>
            </div>
            <AlertTriangle className="w-10 h-10 text-red-500" />
          </div>
        </div>
      </div>

      {/* Suscripciones activas */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900">Suscripciones Activas</h2>
        
        {suscripcionesActivas.length === 0 ? (
          <div className="bg-white rounded-xl shadow-sm p-12 text-center">
            <CheckCircle className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No tienes suscripciones activas</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suscripcionesActivas.map((sub) => {
              const urgencia = getUrgenciaConfig(sub.diasRestantes)
              const UrgenciaIcon = urgencia.icon

              return (
                <motion.div
                  key={sub.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`bg-white rounded-xl shadow-sm border-2 ${urgencia.color} overflow-hidden`}
                >
                  {/* Header de la tarjeta */}
                  <div className="p-6 space-y-4">
                    {/* Servicio */}
                    <div className="flex items-center gap-3">
                      {sub.servicio.logoUrl && (
                        <img src={sub.servicio.logoUrl} alt="" className="w-12 h-12 rounded-lg" />
                      )}
                      <div className="flex-1">
                        <h3 className="font-semibold text-gray-900">{sub.servicio.nombre}</h3>
                        <p className="text-sm text-gray-600">{sub.plan.nombrePlan}</p>
                      </div>
                    </div>

                    {/* Urgencia */}
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${urgencia.badge}`}>
                      <UrgenciaIcon className={`w-5 h-5 ${urgencia.iconColor}`} />
                      <span className="font-medium text-sm">{urgencia.message}</span>
                    </div>

                    {/* Fecha de renovación */}
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <Calendar className="w-4 h-4" />
                      <span>
                        Próxima renovación: {format(new Date(sub.fechaProximaRenovacion), 'd MMM yyyy', { locale: es })}
                      </span>
                    </div>

                    {/* Renovación automática */}
                    <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                      <span className="text-sm text-gray-600">Renovación automática</span>
                      <button
                        onClick={() => toggleRenovacionAutomatica(sub.id, sub.renovacionAutomatica)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          sub.renovacionAutomatica ? 'bg-green-600' : 'bg-gray-200'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            sub.renovacionAutomatica ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Acciones */}
                  <div className="bg-gray-50 px-6 py-4 flex gap-2">
                    <button
                      onClick={() => renovarSuscripcion(sub.id)}
                      disabled={renovando === sub.id}
                      className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                      {renovando === sub.id ? (
                        <RefreshCw className="w-4 h-4 animate-spin" />
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4" />
                          <span>Renovar Ahora</span>
                        </>
                      )}
                    </button>
                    <button
                      onClick={() => cancelarSuscripcion(sub.id)}
                      className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                      title="Cancelar suscripción"
                    >
                      <XCircle className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </div>

      {/* Suscripciones inactivas */}
      {suscripcionesInactivas.length > 0 && (
        <div className="space-y-6 mt-12">
          <h2 className="text-xl font-bold text-gray-900">Suscripciones Inactivas</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {suscripcionesInactivas.map((sub) => (
              <div
                key={sub.id}
                className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 opacity-60"
              >
                <div className="flex items-center gap-3 mb-4">
                  {sub.servicio.logoUrl && (
                    <img src={sub.servicio.logoUrl} alt="" className="w-12 h-12 rounded-lg grayscale" />
                  )}
                  <div>
                    <h3 className="font-semibold text-gray-900">{sub.servicio.nombre}</h3>
                    <p className="text-sm text-gray-600">{sub.plan.nombrePlan}</p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                  <XCircle className="w-3 h-3" />
                  {sub.estado.charAt(0).toUpperCase() + sub.estado.slice(1)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

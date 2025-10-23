'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  Calendar,
  PlayCircle,
  PauseCircle,
  XCircle,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Bell,
  Eye,
  BarChart3
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { adminApiService } from '@/lib/admin-auth'
import { toast } from 'react-hot-toast'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

interface Suscripcion {
  id: number
  estado: 'activa' | 'pausada' | 'cancelada' | 'vencida'
  fechaProximaRenovacion: string
  diasRestantes: number
  renovacionAutomatica: boolean
  cliente: {
    id: number
    nombre: string
    apellido: string
    email: string
    whatsapp?: string
  }
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
}

interface Estadisticas {
  total: number
  activas: number
  pausadas: number
  canceladas: number
  vencidas: number
  renovaciones: {
    renovacionesMes: number
    vencenMes: number
    proximasVencer7dias: number
    proximasVencer3dias: number
    proximasVencer1dia: number
  }
}

const estadoConfig = {
  activa: {
    label: 'Activa',
    color: 'bg-green-100 text-green-800 border-green-200',
    icon: CheckCircle
  },
  pausada: {
    label: 'Pausada',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    icon: PauseCircle
  },
  cancelada: {
    label: 'Cancelada',
    color: 'bg-red-100 text-red-800 border-red-200',
    icon: XCircle
  },
  vencida: {
    label: 'Vencida',
    color: 'bg-gray-100 text-gray-800 border-gray-200',
    icon: AlertCircle
  }
}

export default function SuscripcionesAdminPage() {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([])
  const [estadisticas, setEstadisticas] = useState<Estadisticas | null>(null)
  const [loading, setLoading] = useState(true)
  const [filtroEstado, setFiltroEstado] = useState<string>('')
  const [busqueda, setBusqueda] = useState('')
  const [verificandoVencimientos, setVerificandoVencimientos] = useState(false)

  useEffect(() => {
    cargarDatos()
  }, [filtroEstado])

  const cargarDatos = async () => {
    try {
      setLoading(true)
      
      // Cargar suscripciones
      const params = new URLSearchParams()
      if (filtroEstado) params.append('estado', filtroEstado)
      
      const response = await adminApiService.get(`/api/suscripciones/admin?${params}`)
      setSuscripciones(response.data || [])

      // Cargar estadísticas
      const statsResponse = await adminApiService.get('/api/suscripciones/admin/estadisticas')
      setEstadisticas(statsResponse.data)

    } catch (error: any) {
      console.error('Error al cargar suscripciones:', error)
      toast.error('Error al cargar las suscripciones')
    } finally {
      setLoading(false)
    }
  }

  const pausarSuscripcion = async (id: number) => {
    try {
      await adminApiService.post(`/api/suscripciones/admin/${id}/pausar`, {})
      toast.success('Suscripción pausada correctamente')
      cargarDatos()
    } catch (error: any) {
      toast.error('Error al pausar la suscripción')
    }
  }

  const reanudarSuscripcion = async (id: number) => {
    try {
      await adminApiService.post(`/api/suscripciones/admin/${id}/reanudar`, {})
      toast.success('Suscripción reanudada correctamente')
      cargarDatos()
    } catch (error: any) {
      toast.error('Error al reanudar la suscripción')
    }
  }

  const cancelarSuscripcion = async (id: number) => {
    if (!confirm('¿Estás seguro de cancelar esta suscripción?')) return

    try {
      await adminApiService.post(`/api/suscripciones/admin/${id}/cancelar`, {
        motivoCancelacion: 'Cancelada por administrador'
      })
      toast.success('Suscripción cancelada correctamente')
      cargarDatos()
    } catch (error: any) {
      toast.error('Error al cancelar la suscripción')
    }
  }

  const renovarSuscripcion = async (id: number) => {
    if (!confirm('¿Renovar esta suscripción manualmente?')) return

    try {
      await adminApiService.post(`/api/suscripciones/admin/${id}/renovar`, {})
      toast.success('Suscripción renovada correctamente')
      cargarDatos()
    } catch (error: any) {
      toast.error('Error al renovar la suscripción')
    }
  }

  const verificarVencimientos = async () => {
    if (!confirm('¿Ejecutar verificación de vencimientos ahora?')) return

    try {
      setVerificandoVencimientos(true)
      const response = await adminApiService.post('/api/suscripciones/admin/verificar-vencimientos', {})
      
      const data = response.data
      toast.success(
        `Verificación completada: ${data.notificaciones7dias + data.notificaciones3dias + data.notificaciones1dia} notificaciones enviadas`
      )
      cargarDatos()
    } catch (error: any) {
      toast.error('Error al verificar vencimientos')
    } finally {
      setVerificandoVencimientos(false)
    }
  }

  const suscripcionesFiltradas = suscripciones.filter(sub => {
    const busquedaLower = busqueda.toLowerCase()
    return (
      sub.cliente.nombre.toLowerCase().includes(busquedaLower) ||
      sub.cliente.apellido.toLowerCase().includes(busquedaLower) ||
      sub.cliente.email.toLowerCase().includes(busquedaLower) ||
      sub.servicio.nombre.toLowerCase().includes(busquedaLower)
    )
  })

  const getUrgenciaColor = (diasRestantes: number) => {
    if (diasRestantes <= 0) return 'text-gray-600'
    if (diasRestantes <= 1) return 'text-red-600'
    if (diasRestantes <= 3) return 'text-orange-600'
    if (diasRestantes <= 7) return 'text-yellow-600'
    return 'text-green-600'
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Gestión de Suscripciones</h1>
            <p className="text-gray-500 mt-1">Administra y monitorea todas las suscripciones activas</p>
          </div>
          
          <button
            onClick={verificarVencimientos}
            disabled={verificandoVencimientos}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Bell className="w-4 h-4" />
            {verificandoVencimientos ? 'Verificando...' : 'Verificar Vencimientos'}
          </button>
        </div>

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <StatCard
              title="Total"
              value={estadisticas.total}
              icon={BarChart3}
              color="bg-blue-500"
            />
            <StatCard
              title="Activas"
              value={estadisticas.activas}
              icon={CheckCircle}
              color="bg-green-500"
            />
            <StatCard
              title="Próximas 7 días"
              value={estadisticas.renovaciones.proximasVencer7dias}
              icon={Calendar}
              color="bg-yellow-500"
            />
            <StatCard
              title="Próximas 3 días"
              value={estadisticas.renovaciones.proximasVencer3dias}
              icon={AlertCircle}
              color="bg-orange-500"
            />
            <StatCard
              title="Próximas 1 día"
              value={estadisticas.renovaciones.proximasVencer1dia}
              icon={AlertCircle}
              color="bg-red-500"
            />
          </div>
        )}

        {/* Filtros y búsqueda */}
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por cliente o servicio..."
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Todos los estados</option>
              <option value="activa">Activas</option>
              <option value="pausada">Pausadas</option>
              <option value="cancelada">Canceladas</option>
              <option value="vencida">Vencidas</option>
            </select>
          </div>
        </div>

        {/* Lista de suscripciones */}
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <RefreshCw className="w-8 h-8 animate-spin text-blue-600" />
            </div>
          ) : suscripcionesFiltradas.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500">No se encontraron suscripciones</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Cliente</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Servicio</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Plan</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Renovación</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Días</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {suscripcionesFiltradas.map((sub) => {
                    const EstadoIcon = estadoConfig[sub.estado].icon
                    
                    return (
                      <motion.tr
                        key={sub.id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="hover:bg-gray-50"
                      >
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-medium text-gray-900">
                              {sub.cliente.nombre} {sub.cliente.apellido}
                            </p>
                            <p className="text-sm text-gray-500">{sub.cliente.email}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            {sub.servicio.logoUrl && (
                              <img src={sub.servicio.logoUrl} alt="" className="w-6 h-6 rounded" />
                            )}
                            <span className="text-gray-900">{sub.servicio.nombre}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-gray-600">{sub.plan.nombrePlan}</td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium border ${estadoConfig[sub.estado].color}`}>
                            <EstadoIcon className="w-3 h-3" />
                            {estadoConfig[sub.estado].label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {format(new Date(sub.fechaProximaRenovacion), 'd MMM yyyy', { locale: es })}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`font-semibold ${getUrgenciaColor(sub.diasRestantes)}`}>
                            {sub.diasRestantes > 0 ? `${sub.diasRestantes} días` : 'Vencida'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            {sub.estado === 'activa' && (
                              <>
                                <button
                                  onClick={() => pausarSuscripcion(sub.id)}
                                  className="p-1.5 text-yellow-600 hover:bg-yellow-50 rounded"
                                  title="Pausar"
                                >
                                  <PauseCircle className="w-5 h-5" />
                                </button>
                                <button
                                  onClick={() => renovarSuscripcion(sub.id)}
                                  className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                  title="Renovar"
                                >
                                  <RefreshCw className="w-5 h-5" />
                                </button>
                              </>
                            )}
                            {sub.estado === 'pausada' && (
                              <button
                                onClick={() => reanudarSuscripcion(sub.id)}
                                className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                                title="Reanudar"
                              >
                                <PlayCircle className="w-5 h-5" />
                              </button>
                            )}
                            <button
                              onClick={() => cancelarSuscripcion(sub.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Cancelar"
                            >
                              <XCircle className="w-5 h-5" />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  )
}

function StatCard({ title, value, icon: Icon, color }: {
  title: string
  value: number
  icon: any
  color: string
}) {
  return (
    <div className="bg-white rounded-xl shadow-sm p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`${color} p-3 rounded-lg`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </div>
  )
}

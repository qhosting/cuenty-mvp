
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CreditCard,
  Filter,
  Calendar,
  DollarSign
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { adminApiService } from '@/lib/admin-auth'
import { toast } from 'react-hot-toast'

interface Plan {
  id: string
  servicio_id: string
  servicio_nombre?: string
  nombre: string
  duracion_meses: number
  precio: number
  slots_disponibles: number
  activo: boolean
  created_at: string
}

interface Service {
  id: string
  nombre: string
}

export default function AdminPlansPage() {
  const [plans, setPlans] = useState<Plan[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [plansResult, servicesResult] = await Promise.all([
        adminApiService.getPlans(),
        adminApiService.getServices()
      ])
      
      if (plansResult.success) {
        setPlans(plansResult.data)
      } else {
        // Mock data for demo
        setPlans([
          {
            id: '1',
            servicio_id: '1',
            servicio_nombre: 'Netflix',
            nombre: 'Plan Premium',
            duracion_meses: 1,
            precio: 15990,
            slots_disponibles: 4,
            activo: true,
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            servicio_id: '1',
            servicio_nombre: 'Netflix',
            nombre: 'Plan Premium - 3 meses',
            duracion_meses: 3,
            precio: 42990,
            slots_disponibles: 4,
            activo: true,
            created_at: '2024-01-14T09:15:00Z'
          },
          {
            id: '3',
            servicio_id: '2',
            servicio_nombre: 'Disney+',
            nombre: 'Plan Familiar',
            duracion_meses: 1,
            precio: 12990,
            slots_disponibles: 7,
            activo: true,
            created_at: '2024-01-13T14:45:00Z'
          }
        ])
      }
      
      if (servicesResult.success) {
        setServices(servicesResult.data)
      } else {
        setServices([
          { id: '1', nombre: 'Netflix' },
          { id: '2', nombre: 'Disney+' },
          { id: '3', nombre: 'HBO Max' }
        ])
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await adminApiService.deletePlan(id)
      
      if (result.success) {
        setPlans(plans.filter(p => p.id !== id))
        toast.success('Plan eliminado correctamente')
      } else {
        toast.error(result.message || 'Error al eliminar plan')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setDeleteConfirm(null)
    }
  }

  const filteredPlans = plans.filter(plan => {
    const matchesSearch = 
      plan.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (plan.servicio_nombre || '').toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesService = !serviceFilter || plan.servicio_id === serviceFilter
    
    return matchesSearch && matchesService
  })

  return (
    <AdminLayout currentPath="/admin/plans">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestión de Planes</h1>
            <p className="text-slate-400">
              Administra los planes de suscripción de cada servicio
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingPlan(null)
              setShowModal(true)
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Plan</span>
          </motion.button>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar planes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div className="relative md:w-64">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">Todos los servicios</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.nombre}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Plans Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50 border-b border-slate-600">
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Plan</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Servicio</th>
                  <th className="text-center py-4 px-6 text-slate-300 font-medium">Duración</th>
                  <th className="text-right py-4 px-6 text-slate-300 font-medium">Precio</th>
                  <th className="text-center py-4 px-6 text-slate-300 font-medium">Slots</th>
                  <th className="text-center py-4 px-6 text-slate-300 font-medium">Estado</th>
                  <th className="text-center py-4 px-6 text-slate-300 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlans.map((plan, index) => (
                  <motion.tr
                    key={plan.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg">
                          <CreditCard className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{plan.nombre}</h3>
                          <p className="text-slate-400 text-sm">
                            ID: {plan.id}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-white">{plan.servicio_nombre || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-1 text-slate-300">
                        <Calendar className="w-4 h-4" />
                        <span>{plan.duracion_meses} {plan.duracion_meses === 1 ? 'mes' : 'meses'}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-1 text-green-400 font-medium">
                        <DollarSign className="w-4 h-4" />
                        <span>{plan.precio.toLocaleString('es-CL')}</span>
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className="bg-blue-500/20 text-blue-400 px-2 py-1 rounded-full text-sm">
                        {plan.slots_disponibles} slots
                      </span>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center">
                        <div className={`w-2 h-2 rounded-full ${
                          plan.activo ? 'bg-green-400' : 'bg-red-400'
                        }`} />
                        <span className={`ml-2 text-sm ${
                          plan.activo ? 'text-green-400' : 'text-red-400'
                        }`}>
                          {plan.activo ? 'Activo' : 'Inactivo'}
                        </span>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingPlan(plan)
                            setShowModal(true)
                          }}
                          className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(plan.id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredPlans.length === 0 && !loading && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              {searchTerm || serviceFilter ? 'No se encontraron planes' : 'No hay planes registrados'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || serviceFilter
                ? 'Intenta con otros filtros de búsqueda'
                : 'Comienza agregando tu primer plan de suscripción'
              }
            </p>
            {!searchTerm && !serviceFilter && (
              <button
                onClick={() => {
                  setEditingPlan(null)
                  setShowModal(true)
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Crear Primer Plan
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Cargando planes...</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700 max-w-md w-full"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Confirmar Eliminación</h3>
            <p className="text-slate-400 mb-6">
              ¿Estás seguro de que deseas eliminar este plan? Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Plan Modal (Create/Edit) */}
      {showModal && (
        <PlanModal
          plan={editingPlan}
          services={services}
          onClose={() => setShowModal(false)}
          onSuccess={fetchData}
        />
      )}
    </AdminLayout>
  )
}

interface PlanModalProps {
  plan: Plan | null
  services: Service[]
  onClose: () => void
  onSuccess: () => void
}

function PlanModal({ plan, services, onClose, onSuccess }: PlanModalProps) {
  const [formData, setFormData] = useState({
    servicio_id: plan?.servicio_id || '',
    nombre: plan?.nombre || '',
    duracion_meses: plan?.duracion_meses || 1,
    precio: plan?.precio || 0,
    slots_disponibles: plan?.slots_disponibles || 1,
    activo: plan?.activo ?? true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Limpiar errores previos
    setErrors({})

    // Validaciones
    const newErrors: Record<string, string> = {}

    if (!formData.servicio_id) {
      newErrors.servicio_id = 'Debe seleccionar un servicio'
    }

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Nombre del plan es requerido'
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'Nombre debe tener al menos 3 caracteres'
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'Nombre no puede exceder 100 caracteres'
    }

    if (formData.duracion_meses < 1 || formData.duracion_meses > 36) {
      newErrors.duracion_meses = 'Duración debe estar entre 1 y 36 meses'
    }

    if (formData.precio <= 0) {
      newErrors.precio = 'Precio debe ser mayor a 0'
    }

    if (formData.slots_disponibles < 1 || formData.slots_disponibles > 10) {
      newErrors.slots_disponibles = 'Slots debe estar entre 1 y 10'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    setLoading(true)

    try {
      const result = plan
        ? await adminApiService.updatePlan(plan.id, formData)
        : await adminApiService.createPlan(formData)
      
      if (result.success) {
        toast.success(`Plan ${plan ? 'actualizado' : 'creado'} correctamente`)
        onSuccess()
        onClose()
      } else {
        if (result.errors && Array.isArray(result.errors)) {
          result.errors.forEach((error: string) => toast.error(error))
        } else {
          toast.error(result.message || `Error al ${plan ? 'actualizar' : 'crear'} plan`)
        }
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl p-6 border border-slate-700 max-w-lg w-full"
      >
        <h3 className="text-xl font-semibold text-white mb-6">
          {plan ? 'Editar Plan' : 'Nuevo Plan'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Servicio *
              </label>
              <select
                value={formData.servicio_id}
                onChange={(e) => setFormData({ ...formData, servicio_id: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              >
                <option value="">Seleccionar servicio</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.nombre}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Duración (meses) *
              </label>
              <input
                type="number"
                min="1"
                max="12"
                value={formData.duracion_meses}
                onChange={(e) => setFormData({ ...formData, duracion_meses: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nombre del Plan *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="Ej: Plan Premium"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Precio (CLP) *
              </label>
              <input
                type="number"
                min="0"
                step="100"
                value={formData.precio}
                onChange={(e) => setFormData({ ...formData, precio: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Slots Disponibles *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.slots_disponibles}
                onChange={(e) => setFormData({ ...formData, slots_disponibles: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="activo" className="text-sm font-medium text-slate-300">
              Plan activo
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (plan ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}


'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  MoreVertical,
  Eye,
  EyeOff
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { adminApiService } from '@/lib/admin-auth'
import { toast } from 'react-hot-toast'

interface Service {
  id: string
  nombre: string
  descripcion: string
  logo_url: string
  activo: boolean
  created_at: string
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchServices()
  }, [])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const result = await adminApiService.getServices()
      
      if (result.success) {
        setServices(result.data)
      } else {
        // Mock data for demo
        setServices([
          {
            id: '1',
            nombre: 'Netflix',
            descripcion: 'Plataforma de streaming de películas y series',
            logo_url: '/images/netflix-logo.png',
            activo: true,
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            nombre: 'Disney+',
            descripcion: 'Contenido familiar y de Disney',
            logo_url: '/images/disney-logo.png',
            activo: true,
            created_at: '2024-01-14T09:15:00Z'
          },
          {
            id: '3',
            nombre: 'HBO Max',
            descripcion: 'Series y películas premium',
            logo_url: '/images/hbo-logo.png',
            activo: true,
            created_at: '2024-01-13T14:45:00Z'
          },
          {
            id: '4',
            nombre: 'Spotify',
            descripcion: 'Música en streaming',
            logo_url: '/images/spotify-logo.png',
            activo: false,
            created_at: '2024-01-12T16:20:00Z'
          }
        ])
        toast.error(result.message || 'Error al cargar servicios')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await adminApiService.deleteService(id)
      
      if (result.success) {
        setServices(services.filter(s => s.id !== id))
        toast.success('Servicio eliminado correctamente')
      } else {
        toast.error(result.message || 'Error al eliminar servicio')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleToggleStatus = async (service: Service) => {
    try {
      const result = await adminApiService.updateService(service.id, {
        ...service,
        activo: !service.activo
      })
      
      if (result.success) {
        setServices(services.map(s => 
          s.id === service.id ? { ...s, activo: !s.activo } : s
        ))
        toast.success(`Servicio ${!service.activo ? 'activado' : 'desactivado'} correctamente`)
      } else {
        toast.error(result.message || 'Error al actualizar servicio')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const filteredServices = services.filter(service =>
    service.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    service.descripcion.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <AdminLayout currentPath="/admin/services">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestión de Servicios</h1>
            <p className="text-slate-400">
              Administra los servicios de streaming disponibles
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingService(null)
              setShowModal(true)
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Servicio</span>
          </motion.button>
        </div>

        {/* Search */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Buscar servicios..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
            />
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredServices.map((service, index) => (
            <motion.div
              key={service.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 hover:bg-slate-800/70 transition-all duration-200 group"
            >
              {/* Service Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
                    <Package className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{service.nombre}</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full ${
                        service.activo ? 'bg-green-400' : 'bg-red-400'
                      }`} />
                      <span className={`text-sm ${
                        service.activo ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {service.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleToggleStatus(service)}
                    className="p-2 text-slate-400 hover:text-yellow-400 transition-colors"
                    title={service.activo ? 'Desactivar' : 'Activar'}
                  >
                    {service.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingService(service)
                      setShowModal(true)
                    }}
                    className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(service.id)}
                    className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Service Info */}
              <div className="space-y-3">
                <p className="text-slate-400 text-sm line-clamp-2">
                  {service.descripcion}
                </p>
                <div className="text-xs text-slate-500">
                  Creado: {new Date(service.created_at).toLocaleDateString('es-ES')}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredServices.length === 0 && !loading && (
          <div className="text-center py-12">
            <Package className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              {searchTerm ? 'No se encontraron servicios' : 'No hay servicios registrados'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando tu primer servicio de streaming'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setEditingService(null)
                  setShowModal(true)
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Crear Primer Servicio
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Cargando servicios...</p>
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
              ¿Estás seguro de que deseas eliminar este servicio? Esta acción no se puede deshacer.
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

      {/* Service Modal (Create/Edit) */}
      {showModal && (
        <ServiceModal
          service={editingService}
          onClose={() => setShowModal(false)}
          onSuccess={fetchServices}
        />
      )}
    </AdminLayout>
  )
}

interface ServiceModalProps {
  service: Service | null
  onClose: () => void
  onSuccess: () => void
}

function ServiceModal({ service, onClose, onSuccess }: ServiceModalProps) {
  const [formData, setFormData] = useState({
    nombre: service?.nombre || '',
    descripcion: service?.descripcion || '',
    logo_url: service?.logo_url || '',
    activo: service?.activo ?? true
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Limpiar errores previos
    setErrors({})

    // Validaciones
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Nombre del servicio es requerido'
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'Nombre debe tener al menos 3 caracteres'
    } else if (formData.nombre.trim().length > 100) {
      newErrors.nombre = 'Nombre no puede exceder 100 caracteres'
    }

    if (!formData.descripcion.trim()) {
      newErrors.descripcion = 'Descripción es requerida'
    } else if (formData.descripcion.trim().length > 500) {
      newErrors.descripcion = 'Descripción no puede exceder 500 caracteres'
    }

    if (formData.logo_url.trim()) {
      try {
        const url = new URL(formData.logo_url.trim())
        if (!['http:', 'https:'].includes(url.protocol)) {
          newErrors.logo_url = 'URL debe ser HTTP o HTTPS'
        }
      } catch {
        newErrors.logo_url = 'URL no es válida'
      }
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    setLoading(true)

    try {
      const result = service
        ? await adminApiService.updateService(service.id, formData)
        : await adminApiService.createService(formData)
      
      if (result.success) {
        toast.success(`Servicio ${service ? 'actualizado' : 'creado'} correctamente`)
        onSuccess()
        onClose()
      } else {
        toast.error(result.message || `Error al ${service ? 'actualizar' : 'crear'} servicio`)
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
          {service ? 'Editar Servicio' : 'Nuevo Servicio'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nombre del Servicio *
            </label>
            <input
              type="text"
              value={formData.nombre}
              onChange={(e) => {
                setFormData({ ...formData, nombre: e.target.value })
                if (errors.nombre) {
                  setErrors({ ...errors, nombre: '' })
                }
              }}
              className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none transition-colors ${
                errors.nombre 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-slate-600 focus:border-blue-500'
              }`}
              placeholder="Ej: Netflix"
            />
            {errors.nombre && (
              <p className="mt-1 text-sm text-red-400">{errors.nombre}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descripción *
            </label>
            <textarea
              value={formData.descripcion}
              onChange={(e) => {
                setFormData({ ...formData, descripcion: e.target.value })
                if (errors.descripcion) {
                  setErrors({ ...errors, descripcion: '' })
                }
              }}
              className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none h-24 resize-none transition-colors ${
                errors.descripcion 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-slate-600 focus:border-blue-500'
              }`}
              placeholder="Descripción del servicio..."
            />
            {errors.descripcion && (
              <p className="mt-1 text-sm text-red-400">{errors.descripcion}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              URL del Logo
            </label>
            <input
              type="url"
              value={formData.logo_url}
              onChange={(e) => {
                setFormData({ ...formData, logo_url: e.target.value })
                if (errors.logo_url) {
                  setErrors({ ...errors, logo_url: '' })
                }
              }}
              className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none transition-colors ${
                errors.logo_url 
                  ? 'border-red-500 focus:border-red-500' 
                  : 'border-slate-600 focus:border-blue-500'
              }`}
              placeholder="https://i.pinimg.com/736x/19/63/c8/1963c80b8983da5f3be640ca7473b098.jpg"
            />
            {errors.logo_url && (
              <p className="mt-1 text-sm text-red-400">{errors.logo_url}</p>
            )}
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
              Servicio activo
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
              {loading ? 'Guardando...' : (service ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

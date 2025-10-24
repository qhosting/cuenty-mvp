
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Package,
  Eye,
  EyeOff,
  DollarSign,
  Layers,
  X
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { adminApiService } from '@/lib/admin-auth'
import { toast } from 'react-hot-toast'

interface Combo {
  id_combo: string
  nombre: string
  descripcion: string
  precio_total: number
  costo_total: number
  imagen_url: string
  activo: boolean
  fecha_creacion: string
  planes?: any[]
  total_planes?: number
}

interface Plan {
  id_plan: string
  nombre_plan: string
  nombre_servicio: string
  precio_venta: number
  costo: number
}

export default function AdminCombosPage() {
  const [combos, setCombos] = useState<Combo[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingCombo, setEditingCombo] = useState<Combo | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchCombos()
  }, [])

  const fetchCombos = async () => {
    try {
      setLoading(true)
      const result = await adminApiService.getCombos()
      
      if (result.success) {
        setCombos(result.data)
      } else {
        toast.error(result.message || 'Error al cargar combos')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await adminApiService.deleteCombo(id)
      
      if (result.success) {
        setCombos(combos.filter(c => c.id_combo !== id))
        toast.success('Combo eliminado correctamente')
      } else {
        toast.error(result.message || 'Error al eliminar combo')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleToggleStatus = async (combo: Combo) => {
    try {
      const result = await adminApiService.updateCombo(combo.id_combo, {
        activo: !combo.activo
      })
      
      if (result.success) {
        setCombos(combos.map(c => 
          c.id_combo === combo.id_combo ? { ...c, activo: !c.activo } : c
        ))
        toast.success(`Combo ${!combo.activo ? 'activado' : 'desactivado'} correctamente`)
      } else {
        toast.error(result.message || 'Error al actualizar combo')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const filteredCombos = combos.filter(combo =>
    combo.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (combo.descripcion && combo.descripcion.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <AdminLayout currentPath="/admin/combos">
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-2">Gestión de Combos</h1>
            <p className="text-slate-400 text-sm lg:text-base">
              Administra los paquetes y combos de servicios
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingCombo(null)
              setShowModal(true)
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/25 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Nuevo Combo</span>
          </motion.button>
        </div>

        {/* Search */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 lg:p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar combos por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>
        </div>

        {/* Combos Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 lg:gap-6">
          {filteredCombos.map((combo, index) => (
            <motion.div
              key={combo.id_combo}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700 hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200 group hover:shadow-xl hover:shadow-blue-500/10"
            >
              {/* Combo Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Layers className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base lg:text-lg font-semibold text-white mb-1.5 truncate">{combo.nombre}</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        combo.activo ? 'bg-green-400 animate-pulse' : 'bg-red-400'
                      }`} />
                      <span className={`text-xs lg:text-sm font-medium ${
                        combo.activo ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {combo.activo ? 'Activo' : 'Inactivo'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2">
                  <button
                    onClick={() => handleToggleStatus(combo)}
                    className="p-2 text-slate-400 hover:text-yellow-400 hover:bg-yellow-400/10 rounded-lg transition-all duration-200"
                    title={combo.activo ? 'Desactivar' : 'Activar'}
                  >
                    {combo.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingCombo(combo)
                      setShowModal(true)
                    }}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all duration-200"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(combo.id_combo)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                    title="Eliminar"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Combo Info */}
              <div className="space-y-3 pt-3 border-t border-slate-700">
                <p className="text-slate-400 text-sm lg:text-base line-clamp-2">
                  {combo.descripcion || 'Sin descripción'}
                </p>
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <DollarSign className="w-4 h-4 text-green-400" />
                    <span className="text-green-400 font-semibold">${combo.precio_total.toFixed(2)}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Package className="w-4 h-4 text-blue-400" />
                    <span className="text-slate-400 text-sm">{combo.total_planes || (combo.planes?.length || 0)} servicios</span>
                  </div>
                </div>

                <div className="text-xs text-slate-500">
                  Margen: ${(combo.precio_total - combo.costo_total).toFixed(2)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCombos.length === 0 && !loading && (
          <div className="text-center py-12">
            <Layers className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              {searchTerm ? 'No se encontraron combos' : 'No hay combos registrados'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando tu primer combo de servicios'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setEditingCombo(null)
                  setShowModal(true)
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Crear Primer Combo
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Cargando combos...</p>
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
              ¿Estás seguro de que deseas eliminar este combo? Esta acción no se puede deshacer.
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

      {/* Combo Modal (Create/Edit) */}
      {showModal && (
        <ComboModal
          combo={editingCombo}
          onClose={() => setShowModal(false)}
          onSuccess={fetchCombos}
        />
      )}
    </AdminLayout>
  )
}

interface ComboModalProps {
  combo: Combo | null
  onClose: () => void
  onSuccess: () => void
}

function ComboModal({ combo, onClose, onSuccess }: ComboModalProps) {
  const [formData, setFormData] = useState({
    nombre: combo?.nombre || '',
    descripcion: combo?.descripcion || '',
    precio_total: combo?.precio_total || 0,
    costo_total: combo?.costo_total || 0,
    imagen_url: combo?.imagen_url || '',
    activo: combo?.activo ?? true
  })
  const [selectedPlans, setSelectedPlans] = useState<any[]>(combo?.planes || [])
  const [availablePlans, setAvailablePlans] = useState<Plan[]>([])
  const [loading, setLoading] = useState(false)
  const [loadingPlans, setLoadingPlans] = useState(false)
  const [autoCalculate, setAutoCalculate] = useState(true)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    fetchPlans()
  }, [])

  useEffect(() => {
    if (autoCalculate && selectedPlans.length > 0) {
      calculateTotals()
    }
  }, [selectedPlans, autoCalculate])

  const fetchPlans = async () => {
    try {
      setLoadingPlans(true)
      const result = await adminApiService.getPlans()
      if (result.success) {
        setAvailablePlans(result.data)
      }
    } catch (error) {
      console.error('Error loading plans:', error)
    } finally {
      setLoadingPlans(false)
    }
  }

  const calculateTotals = async () => {
    if (selectedPlans.length === 0) return

    try {
      const planesData = selectedPlans.map(p => ({
        id_plan: p.id_plan,
        cantidad: p.cantidad || 1
      }))

      const result = await adminApiService.calculateComboTotals(planesData)
      
      if (result.success) {
        setFormData(prev => ({
          ...prev,
          precio_total: result.data.precio_total,
          costo_total: result.data.costo_total
        }))
      }
    } catch (error) {
      console.error('Error calculating totals:', error)
    }
  }

  const addPlan = (plan: Plan) => {
    if (selectedPlans.find(p => p.id_plan === plan.id_plan)) {
      toast.error('Este plan ya está agregado al combo')
      return
    }

    setSelectedPlans([...selectedPlans, { ...plan, cantidad: 1 }])
  }

  const removePlan = (planId: string) => {
    setSelectedPlans(selectedPlans.filter(p => p.id_plan !== planId))
  }

  const updatePlanQuantity = (planId: string, cantidad: number) => {
    if (cantidad < 1) return
    setSelectedPlans(selectedPlans.map(p => 
      p.id_plan === planId ? { ...p, cantidad } : p
    ))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Limpiar errores previos
    setErrors({})

    // Validaciones
    const newErrors: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      newErrors.nombre = 'Nombre del combo es requerido'
    } else if (formData.nombre.trim().length < 3) {
      newErrors.nombre = 'Nombre debe tener al menos 3 caracteres'
    }

    if (selectedPlans.length === 0) {
      newErrors.planes = 'Debes agregar al menos un plan al combo'
    }

    if (formData.precio_total <= 0) {
      newErrors.precio_total = 'El precio total debe ser mayor a 0'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    setLoading(true)

    try {
      const planesData = selectedPlans.map(p => ({
        id_plan: p.id_plan,
        cantidad: p.cantidad || 1
      }))

      const comboData = {
        nombre: formData.nombre.trim(),
        descripcion: formData.descripcion.trim(),
        precio_total: formData.precio_total,
        costo_total: formData.costo_total,
        imagen_url: formData.imagen_url?.trim() || null,
        activo: formData.activo,
        planes: planesData
      }

      const result = combo
        ? await adminApiService.updateCombo(combo.id_combo, comboData)
        : await adminApiService.createCombo(comboData)
      
      if (result.success) {
        toast.success(`Combo ${combo ? 'actualizado' : 'creado'} correctamente`)
        onSuccess()
        onClose()
      } else {
        toast.error(result.message || `Error al ${combo ? 'actualizar' : 'crear'} combo`)
      }
    } catch (error) {
      toast.error('Error de conexión con el servidor')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl p-6 border border-slate-700 max-w-4xl w-full my-8"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">
            {combo ? 'Editar Combo' : 'Nuevo Combo'}
          </h3>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Nombre */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre del Combo *
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
                placeholder="Ej: Combo Premium 3 Servicios"
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-400">{errors.nombre}</p>
              )}
            </div>

            {/* Descripción */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Descripción
              </label>
              <textarea
                value={formData.descripcion}
                onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 h-24 resize-none transition-colors"
                placeholder="Descripción del combo..."
              />
            </div>

            {/* Imagen URL */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                URL de Imagen
              </label>
              <input
                type="url"
                value={formData.imagen_url}
                onChange={(e) => setFormData({ ...formData, imagen_url: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="https://upload.wikimedia.org/wikipedia/commons/thumb/1/1e/F-22_Raptor_edit1_%28cropped%29.jpg/330px-F-22_Raptor_edit1_%28cropped%29.jpg"
              />
            </div>

            {/* Planes del Combo */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Planes incluidos en el combo *
              </label>
              
              {/* Lista de planes seleccionados */}
              <div className="space-y-2 mb-3">
                {selectedPlans.map((plan) => (
                  <div key={plan.id_plan} className="flex items-center justify-between p-3 bg-slate-900 rounded-lg border border-slate-700">
                    <div className="flex-1">
                      <p className="text-white font-medium">{plan.nombre_plan}</p>
                      <p className="text-slate-400 text-sm">{plan.nombre_servicio}</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <button
                          type="button"
                          onClick={() => updatePlanQuantity(plan.id_plan, plan.cantidad - 1)}
                          className="w-6 h-6 bg-slate-700 text-white rounded hover:bg-slate-600"
                        >
                          -
                        </button>
                        <span className="text-white w-8 text-center">{plan.cantidad}</span>
                        <button
                          type="button"
                          onClick={() => updatePlanQuantity(plan.id_plan, plan.cantidad + 1)}
                          className="w-6 h-6 bg-slate-700 text-white rounded hover:bg-slate-600"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePlan(plan.id_plan)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {/* Selector de planes */}
              <select
                onChange={(e) => {
                  const plan = availablePlans.find(p => p.id_plan === e.target.value)
                  if (plan) {
                    addPlan(plan)
                    e.target.value = ''
                  }
                }}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                disabled={loadingPlans}
              >
                <option value="">Agregar plan...</option>
                {availablePlans.map((plan) => (
                  <option key={plan.id_plan} value={plan.id_plan}>
                    {plan.nombre_servicio} - {plan.nombre_plan} (${plan.precio_venta})
                  </option>
                ))}
              </select>
              {errors.planes && (
                <p className="mt-1 text-sm text-red-400">{errors.planes}</p>
              )}
            </div>

            {/* Auto-calcular totales */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="autoCalculate"
                  checked={autoCalculate}
                  onChange={(e) => setAutoCalculate(e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="autoCalculate" className="text-sm font-medium text-slate-300">
                  Calcular totales automáticamente
                </label>
              </div>
            </div>

            {/* Precio Total */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Precio Total *
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.precio_total}
                onChange={(e) => {
                  setFormData({ ...formData, precio_total: parseFloat(e.target.value) || 0 })
                  if (errors.precio_total) {
                    setErrors({ ...errors, precio_total: '' })
                  }
                }}
                disabled={autoCalculate}
                className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none transition-colors ${
                  errors.precio_total 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-slate-600 focus:border-blue-500'
                } ${autoCalculate ? 'opacity-50 cursor-not-allowed' : ''}`}
                placeholder="0.00"
              />
              {errors.precio_total && (
                <p className="mt-1 text-sm text-red-400">{errors.precio_total}</p>
              )}
            </div>

            {/* Costo Total */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Costo Total
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.costo_total}
                onChange={(e) => setFormData({ ...formData, costo_total: parseFloat(e.target.value) || 0 })}
                disabled={autoCalculate}
                className={`w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 ${
                  autoCalculate ? 'opacity-50 cursor-not-allowed' : ''
                }`}
                placeholder="0.00"
              />
            </div>

            {/* Margen */}
            <div className="md:col-span-2">
              <div className="p-3 bg-slate-900 rounded-lg border border-slate-700">
                <p className="text-slate-400 text-sm">
                  Margen de ganancia: <span className="text-green-400 font-semibold">${(formData.precio_total - formData.costo_total).toFixed(2)}</span>
                </p>
              </div>
            </div>

            {/* Activo */}
            <div className="md:col-span-2">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="activo"
                  checked={formData.activo}
                  onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
                  className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="activo" className="text-sm font-medium text-slate-300">
                  Combo activo
                </label>
              </div>
            </div>
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
              {loading ? 'Guardando...' : (combo ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

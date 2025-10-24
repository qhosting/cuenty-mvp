
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CreditCard,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Building2,
  User,
  Hash
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { adminApiService } from '@/lib/admin-auth'
import { toast } from 'react-hot-toast'

interface PaymentConfig {
  id: string
  banco: string
  titular: string
  numero_cuenta: string
  clabe: string
  concepto_referencia: string
  instrucciones_adicionales: string
  activo: boolean
  fecha_creacion: string
}

export default function AdminPaymentConfigPage() {
  const [configs, setConfigs] = useState<PaymentConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingConfig, setEditingConfig] = useState<PaymentConfig | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)

  useEffect(() => {
    fetchConfigs()
  }, [])

  const fetchConfigs = async () => {
    try {
      setLoading(true)
      const result = await adminApiService.getPaymentConfigs()
      
      if (result.success) {
        setConfigs(result.data)
      } else {
        toast.error(result.message || 'Error al cargar configuraciones')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await adminApiService.deletePaymentConfig(id)
      
      if (result.success) {
        setConfigs(configs.filter(c => c.id !== id))
        toast.success('Configuración eliminada correctamente')
      } else {
        toast.error(result.message || 'Error al eliminar configuración')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setDeleteConfirm(null)
    }
  }

  const handleToggleStatus = async (config: PaymentConfig) => {
    try {
      const result = await adminApiService.togglePaymentConfig(config.id, !config.activo)
      
      if (result.success) {
        // Si se activa una configuración, las demás se desactivan automáticamente
        if (!config.activo) {
          setConfigs(configs.map(c => ({
            ...c,
            activo: c.id === config.id
          })))
        } else {
          setConfigs(configs.map(c => 
            c.id === config.id ? { ...c, activo: false } : c
          ))
        }
        toast.success(`Configuración ${!config.activo ? 'activada' : 'desactivada'} correctamente`)
      } else {
        toast.error(result.message || 'Error al actualizar configuración')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const filteredConfigs = configs.filter(config =>
    config.banco.toLowerCase().includes(searchTerm.toLowerCase()) ||
    config.titular.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const activeConfig = configs.find(c => c.activo)

  return (
    <AdminLayout currentPath="/admin/payment-config">
      <div className="space-y-6 w-full">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-2">Configuración de Pagos</h1>
            <p className="text-slate-400 text-sm lg:text-base">
              Administra las cuentas bancarias para recibir pagos
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingConfig(null)
              setShowModal(true)
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center justify-center space-x-2 shadow-lg hover:shadow-blue-500/25 w-full sm:w-auto"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Configuración</span>
          </motion.button>
        </div>

        {/* Active Configuration Alert */}
        {activeConfig && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-green-500/10 border border-green-500/20 rounded-2xl p-5"
          >
            <div className="flex items-start space-x-3">
              <CheckCircle className="w-6 h-6 text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-green-400 font-medium mb-1">Configuración Activa</h3>
                <p className="text-green-200/80 text-sm">
                  Los pagos se están recibiendo en: <span className="font-semibold">{activeConfig.banco}</span> - {activeConfig.titular}
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {!activeConfig && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-5"
          >
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-yellow-400 font-medium mb-1">Sin Configuración Activa</h3>
                <p className="text-yellow-200/80 text-sm">
                  No hay ninguna cuenta bancaria activa para recibir pagos. Activa una configuración para continuar.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Search */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 lg:p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar por banco o titular..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors"
            />
          </div>
        </div>

        {/* Configs Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
          {filteredConfigs.map((config, index) => (
            <motion.div
              key={config.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className={`bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border transition-all duration-200 group hover:shadow-xl ${
                config.activo 
                  ? 'border-green-500/50 hover:border-green-500 shadow-green-500/10' 
                  : 'border-slate-700 hover:border-slate-600'
              }`}
            >
              {/* Config Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg ${
                    config.activo 
                      ? 'bg-gradient-to-r from-green-500 to-emerald-600' 
                      : 'bg-gradient-to-r from-blue-500 to-purple-600'
                  }`}>
                    <CreditCard className="w-6 h-6 lg:w-7 lg:h-7 text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base lg:text-lg font-semibold text-white mb-1.5 truncate">{config.banco}</h3>
                    <div className="flex items-center space-x-2">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${
                        config.activo ? 'bg-green-400 animate-pulse' : 'bg-slate-500'
                      }`} />
                      <span className={`text-xs lg:text-sm font-medium ${
                        config.activo ? 'text-green-400' : 'text-slate-500'
                      }`}>
                        {config.activo ? 'Activa' : 'Inactiva'}
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-1 opacity-0 group-hover:opacity-100 transition-all duration-200 ml-2">
                  <button
                    onClick={() => handleToggleStatus(config)}
                    className={`p-2 rounded-lg transition-all duration-200 ${
                      config.activo 
                        ? 'text-slate-400 hover:text-red-400 hover:bg-red-400/10' 
                        : 'text-slate-400 hover:text-green-400 hover:bg-green-400/10'
                    }`}
                    title={config.activo ? 'Desactivar' : 'Activar'}
                  >
                    {config.activo ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  <button
                    onClick={() => {
                      setEditingConfig(config)
                      setShowModal(true)
                    }}
                    className="p-2 text-slate-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-all duration-200"
                    title="Editar"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(config.id)}
                    className="p-2 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-all duration-200"
                    title="Eliminar"
                    disabled={config.activo}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Config Info */}
              <div className="space-y-3 pt-3 border-t border-slate-700">
                <div className="flex items-center space-x-2 text-sm">
                  <User className="w-4 h-4 text-slate-400" />
                  <span className="text-slate-300 font-medium">Titular:</span>
                  <span className="text-slate-400">{config.titular}</span>
                </div>
                
                {config.numero_cuenta && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Hash className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300 font-medium">Cuenta:</span>
                    <span className="text-slate-400 font-mono">{config.numero_cuenta}</span>
                  </div>
                )}
                
                {config.clabe && (
                  <div className="flex items-center space-x-2 text-sm">
                    <Hash className="w-4 h-4 text-slate-400" />
                    <span className="text-slate-300 font-medium">CLABE:</span>
                    <span className="text-slate-400 font-mono">{config.clabe}</span>
                  </div>
                )}

                {config.concepto_referencia && (
                  <div className="text-sm">
                    <span className="text-slate-300 font-medium">Concepto:</span>
                    <p className="text-slate-400 mt-1">{config.concepto_referencia}</p>
                  </div>
                )}

                <div className="text-xs text-slate-500 pt-2">
                  Creado: {new Date(config.fecha_creacion).toLocaleDateString('es-ES')}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredConfigs.length === 0 && !loading && (
          <div className="text-center py-12">
            <CreditCard className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              {searchTerm ? 'No se encontraron configuraciones' : 'No hay configuraciones de pago'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm 
                ? 'Intenta con otros términos de búsqueda'
                : 'Comienza agregando tu primera cuenta bancaria'
              }
            </p>
            {!searchTerm && (
              <button
                onClick={() => {
                  setEditingConfig(null)
                  setShowModal(true)
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Crear Primera Configuración
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Cargando configuraciones...</p>
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
              ¿Estás seguro de que deseas eliminar esta configuración de pago? Esta acción no se puede deshacer.
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

      {/* Config Modal (Create/Edit) */}
      {showModal && (
        <ConfigModal
          config={editingConfig}
          onClose={() => setShowModal(false)}
          onSuccess={fetchConfigs}
        />
      )}
    </AdminLayout>
  )
}

interface ConfigModalProps {
  config: PaymentConfig | null
  onClose: () => void
  onSuccess: () => void
}

function ConfigModal({ config, onClose, onSuccess }: ConfigModalProps) {
  const [formData, setFormData] = useState({
    banco: config?.banco || '',
    titular: config?.titular || '',
    numero_cuenta: config?.numero_cuenta || '',
    clabe: config?.clabe || '',
    concepto_referencia: config?.concepto_referencia || '',
    instrucciones_adicionales: config?.instrucciones_adicionales || '',
    activo: config?.activo ?? false
  })
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Limpiar errores previos
    setErrors({})

    // Validaciones
    const newErrors: Record<string, string> = {}

    if (!formData.banco.trim()) {
      newErrors.banco = 'Nombre del banco es requerido'
    }

    if (!formData.titular.trim()) {
      newErrors.titular = 'Titular de la cuenta es requerido'
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      toast.error('Por favor corrige los errores en el formulario')
      return
    }

    setLoading(true)

    try {
      const result = config
        ? await adminApiService.updatePaymentConfig(config.id, formData)
        : await adminApiService.createPaymentConfig(formData)
      
      if (result.success) {
        toast.success(`Configuración ${config ? 'actualizada' : 'creada'} correctamente`)
        onSuccess()
        onClose()
      } else {
        toast.error(result.message || `Error al ${config ? 'actualizar' : 'crear'} configuración`)
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
        className="bg-slate-800 rounded-2xl p-6 border border-slate-700 max-w-2xl w-full my-8"
      >
        <h3 className="text-xl font-semibold text-white mb-6">
          {config ? 'Editar Configuración' : 'Nueva Configuración de Pago'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Banco */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Nombre del Banco *
              </label>
              <input
                type="text"
                value={formData.banco}
                onChange={(e) => {
                  setFormData({ ...formData, banco: e.target.value })
                  if (errors.banco) {
                    setErrors({ ...errors, banco: '' })
                  }
                }}
                className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none transition-colors ${
                  errors.banco 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-slate-600 focus:border-blue-500'
                }`}
                placeholder="Ej: BBVA Bancomer"
              />
              {errors.banco && (
                <p className="mt-1 text-sm text-red-400">{errors.banco}</p>
              )}
            </div>

            {/* Titular */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Titular de la Cuenta *
              </label>
              <input
                type="text"
                value={formData.titular}
                onChange={(e) => {
                  setFormData({ ...formData, titular: e.target.value })
                  if (errors.titular) {
                    setErrors({ ...errors, titular: '' })
                  }
                }}
                className={`w-full px-3 py-2 bg-slate-900 border rounded-lg text-white placeholder-slate-400 focus:outline-none transition-colors ${
                  errors.titular 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-slate-600 focus:border-blue-500'
                }`}
                placeholder="Nombre del titular"
              />
              {errors.titular && (
                <p className="mt-1 text-sm text-red-400">{errors.titular}</p>
              )}
            </div>

            {/* Número de Cuenta */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Número de Cuenta
              </label>
              <input
                type="text"
                value={formData.numero_cuenta}
                onChange={(e) => setFormData({ ...formData, numero_cuenta: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="0123456789"
              />
            </div>

            {/* CLABE */}
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                CLABE Interbancaria
              </label>
              <input
                type="text"
                maxLength={18}
                value={formData.clabe}
                onChange={(e) => setFormData({ ...formData, clabe: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="012345678901234567"
              />
              <p className="text-slate-500 text-xs mt-1">18 dígitos</p>
            </div>

            {/* Concepto/Referencia */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Concepto o Referencia
              </label>
              <input
                type="text"
                value={formData.concepto_referencia}
                onChange={(e) => setFormData({ ...formData, concepto_referencia: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="Ej: CUENTY - Servicios Streaming"
              />
            </div>

            {/* Instrucciones Adicionales */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Instrucciones Adicionales
              </label>
              <textarea
                value={formData.instrucciones_adicionales}
                onChange={(e) => setFormData({ ...formData, instrucciones_adicionales: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 h-24 resize-none transition-colors"
                placeholder="Instrucciones adicionales para el cliente al realizar el pago..."
              />
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
                  Configuración activa (solo una puede estar activa a la vez)
                </label>
              </div>
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
              <div className="text-sm text-blue-200/80">
                <p className="font-medium text-blue-400 mb-1">Importante:</p>
                <p>Al activar esta configuración, cualquier otra configuración activa será desactivada automáticamente.</p>
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
              {loading ? 'Guardando...' : (config ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

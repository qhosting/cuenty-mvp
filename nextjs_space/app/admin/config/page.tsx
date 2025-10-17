
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Settings,
  Save,
  CheckCircle,
  AlertCircle,
  Globe,
  Key,
  Smartphone,
  RefreshCw
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { adminApiService } from '@/lib/admin-auth'
import { toast } from 'react-hot-toast'

interface EvolutionConfig {
  api_url: string
  api_key: string
  instance_name: string
}

export default function AdminConfigPage() {
  const [config, setConfig] = useState<EvolutionConfig>({
    api_url: '',
    api_key: '',
    instance_name: ''
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [configStatus, setConfigStatus] = useState<'loading' | 'success' | 'error' | null>(null)

  useEffect(() => {
    fetchConfig()
  }, [])

  const fetchConfig = async () => {
    try {
      setLoading(true)
      setConfigStatus('loading')
      
      const result = await adminApiService.getEvolutionConfig()
      
      if (result.success) {
        setConfig(result.data || {
          api_url: '',
          api_key: '',
          instance_name: ''
        })
        setConfigStatus('success')
      } else {
        setConfigStatus('error')
        toast.error(result.message || 'Error al cargar configuración')
      }
    } catch (error) {
      setConfigStatus('error')
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!config.api_url || !config.api_key || !config.instance_name) {
      toast.error('Por favor completa todos los campos')
      return
    }

    // Basic URL validation
    try {
      new URL(config.api_url)
    } catch {
      toast.error('Por favor ingresa una URL válida')
      return
    }

    setSaving(true)

    try {
      const result = await adminApiService.saveEvolutionConfig(config)
      
      if (result.success) {
        toast.success('Configuración guardada correctamente')
        setConfigStatus('success')
      } else {
        toast.error(result.message || 'Error al guardar configuración')
        setConfigStatus('error')
      }
    } catch (error) {
      toast.error('Error de conexión')
      setConfigStatus('error')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof EvolutionConfig, value: string) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }))
    
    // Reset status when user starts typing
    if (configStatus !== 'loading') {
      setConfigStatus(null)
    }
  }

  return (
    <AdminLayout currentPath="/admin/config">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Configuración del Sistema</h1>
          <p className="text-slate-400">
            Configura la integración con Evolution API para el envío automático de credenciales
          </p>
        </div>

        {/* Status Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl">
                <Settings className="w-6 h-6 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">Estado de la API</h3>
                <p className="text-slate-400 text-sm">
                  Estado actual de la conexión con Evolution API
                </p>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              {configStatus === 'loading' && (
                <>
                  <RefreshCw className="w-5 h-5 text-blue-400 animate-spin" />
                  <span className="text-blue-400">Verificando...</span>
                </>
              )}
              {configStatus === 'success' && (
                <>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                  <span className="text-green-400">Configurado</span>
                </>
              )}
              {configStatus === 'error' && (
                <>
                  <AlertCircle className="w-5 h-5 text-red-400" />
                  <span className="text-red-400">Error de configuración</span>
                </>
              )}
              {configStatus === null && (
                <>
                  <AlertCircle className="w-5 h-5 text-yellow-400" />
                  <span className="text-yellow-400">Sin configurar</span>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Configuration Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700"
        >
          <div className="mb-6">
            <h2 className="text-xl font-semibold text-white mb-2">Configuración de Evolution API</h2>
            <p className="text-slate-400">
              Ingresa los datos de conexión para tu instancia de Evolution API
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* API URL */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-3">
                <Globe className="w-4 h-4" />
                <span>URL de la API *</span>
              </label>
              <input
                type="url"
                value={config.api_url}
                onChange={(e) => handleInputChange('api_url', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="https://api.evolution.com"
                required
                disabled={loading || saving}
              />
              <p className="text-slate-500 text-xs mt-2">
                URL completa de tu servidor Evolution API (incluye http:// o https://)
              </p>
            </div>

            {/* API Key */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-3">
                <Key className="w-4 h-4" />
                <span>Clave de API *</span>
              </label>
              <input
                type="password"
                value={config.api_key}
                onChange={(e) => handleInputChange('api_key', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="Tu API Key de Evolution"
                required
                disabled={loading || saving}
              />
              <p className="text-slate-500 text-xs mt-2">
                Clave de autenticación para acceder a la API de Evolution
              </p>
            </div>

            {/* Instance Name */}
            <div>
              <label className="flex items-center space-x-2 text-sm font-medium text-slate-300 mb-3">
                <Smartphone className="w-4 h-4" />
                <span>Nombre de la Instancia *</span>
              </label>
              <input
                type="text"
                value={config.instance_name}
                onChange={(e) => handleInputChange('instance_name', e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
                placeholder="cuenty-instance"
                required
                disabled={loading || saving}
              />
              <p className="text-slate-500 text-xs mt-2">
                Nombre único de tu instancia de WhatsApp en Evolution API
              </p>
            </div>

            {/* Submit Button */}
            <div className="flex items-center space-x-4 pt-6">
              <motion.button
                type="submit"
                disabled={loading || saving}
                whileHover={{ scale: saving ? 1 : 1.02 }}
                whileTap={{ scale: saving ? 1 : 0.98 }}
                className="flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {saving ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Guardando...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Guardar Configuración</span>
                  </>
                )}
              </motion.button>

              <button
                type="button"
                onClick={fetchConfig}
                disabled={loading || saving}
                className="flex items-center space-x-2 bg-slate-700 text-slate-300 px-6 py-3 rounded-xl font-medium hover:bg-slate-600 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
                <span>Recargar</span>
              </button>
            </div>
          </form>
        </motion.div>

        {/* Information Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* What is Evolution API */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Smartphone className="w-5 h-5 text-blue-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">¿Qué es Evolution API?</h3>
            </div>
            <div className="space-y-3 text-slate-400 text-sm">
              <p>
                Evolution API es una solución que permite integrar WhatsApp con aplicaciones web
                para el envío automatizado de mensajes.
              </p>
              <p>
                Una vez configurada, CUENTY podrá enviar automáticamente las credenciales
                de acceso a los clientes vía WhatsApp cuando sus pedidos sean marcados como "entregados".
              </p>
            </div>
          </motion.div>

          {/* Setup Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Settings className="w-5 h-5 text-purple-400" />
              </div>
              <h3 className="text-lg font-semibold text-white">Instrucciones de Configuración</h3>
            </div>
            <div className="space-y-3 text-slate-400 text-sm">
              <div className="flex items-start space-x-2">
                <span className="text-blue-400 font-medium">1.</span>
                <p>Instala y configura tu servidor Evolution API</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-400 font-medium">2.</span>
                <p>Crea una instancia de WhatsApp en tu panel</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-400 font-medium">3.</span>
                <p>Obtén la URL base y tu API Key del servidor</p>
              </div>
              <div className="flex items-start space-x-2">
                <span className="text-blue-400 font-medium">4.</span>
                <p>Ingresa los datos en este formulario y guarda</p>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Warning Note */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-yellow-500/10 border border-yellow-500/20 rounded-2xl p-6"
        >
          <div className="flex items-start space-x-3">
            <AlertCircle className="w-6 h-6 text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="text-yellow-400 font-medium mb-2">Importante</h3>
              <div className="text-yellow-200/80 text-sm space-y-2">
                <p>
                  • Asegúrate de que tu servidor Evolution API esté funcionando correctamente antes de configurar
                </p>
                <p>
                  • La instancia de WhatsApp debe estar conectada y verificada
                </p>
                <p>
                  • Guarda estos datos de forma segura, son necesarios para el funcionamiento del sistema
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}

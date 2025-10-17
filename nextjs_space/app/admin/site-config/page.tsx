
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Upload,
  Save,
  RotateCcw,
  Eye,
  Image as ImageIcon,
  Type,
  BarChart3,
  Settings,
  Smartphone,
  Globe,
  CheckCircle,
  AlertCircle
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { toast } from 'react-hot-toast'
import Image from 'next/image'

interface SiteConfig {
  id?: string
  logoUrl?: string
  logoSize: 'small' | 'medium' | 'large'
  footerLogoUrl?: string
  faviconUrl?: string
  heroTitle: string
  heroSubtitle: string
  heroBadgeText: string
  heroCtaPrimary: string
  heroCTASecondary: string
  stat1Value: string
  stat1Label: string
  stat2Value: string
  stat2Label: string
  stat3Value: string
  stat3Label: string
  stat4Value: string
  stat4Label: string
  featuresTitle: string
  featuresSubtitle: string
  howItWorksTitle: string
  howItWorksSubtitle: string
  whatsappNumber: string
  supportEmail: string
  metaTitle: string
  metaDescription: string
  metaKeywords: string
}

const defaultConfig: SiteConfig = {
  logoSize: 'medium',
  heroTitle: 'Accede a tus\nPlataformas Favoritas',
  heroSubtitle: 'Obtén cuentas premium de Netflix, Disney+, HBO Max, Prime Video y más.\nEntrega inmediata y soporte 24/7.',
  heroBadgeText: 'Plataforma #1 en México',
  heroCtaPrimary: 'Ver Catálogo',
  heroCTASecondary: 'Cómo Funciona',
  stat1Value: '10,000+',
  stat1Label: 'Clientes Satisfechos',
  stat2Value: '15+',
  stat2Label: 'Plataformas',
  stat3Value: '99.9%',
  stat3Label: 'Uptime',
  stat4Value: '24/7',
  stat4Label: 'Soporte',
  featuresTitle: '¿Por qué elegir CUENTY?',
  featuresSubtitle: 'Somos la plataforma más confiable de México para obtener cuentas premium de streaming y entretenimiento.',
  howItWorksTitle: '¿Cómo Funciona?',
  howItWorksSubtitle: 'Obtener tu cuenta premium es muy fácil. Solo sigue estos 4 simples pasos y estarás disfrutando en minutos.',
  whatsappNumber: 'message/IOR2WUU66JVMM1',
  supportEmail: 'soporte@cuenty.com',
  metaTitle: 'CUENTY - Cuentas de Streaming Premium',
  metaDescription: 'La mejor plataforma para obtener cuentas de streaming premium como Netflix, Disney+, HBO Max y más. Precios accesibles y entrega inmediata.',
  metaKeywords: 'streaming, Netflix, Disney+, HBO Max, cuentas premium, CUENTY'
}

export default function SiteConfigPage() {
  const [config, setConfig] = useState<SiteConfig>(defaultConfig)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [activeTab, setActiveTab] = useState('logos')
  const [uploadingLogo, setUploadingLogo] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const tabs = [
    { id: 'logos', name: 'Logos y Favicon', icon: ImageIcon },
    { id: 'hero', name: 'Sección Hero', icon: Type },
    { id: 'stats', name: 'Estadísticas', icon: BarChart3 },
    { id: 'sections', name: 'Secciones', icon: Settings },
    { id: 'contact', name: 'Contacto', icon: Smartphone },
    { id: 'seo', name: 'SEO', icon: Globe },
  ]

  useEffect(() => {
    loadConfig()
  }, [])

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/site-config')
      if (response.ok) {
        const data = await response.json()
        setConfig({ ...defaultConfig, ...data })
      }
    } catch (error) {
      console.error('Error loading config:', error)
      toast.error('Error al cargar la configuración')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/admin/site-config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(config),
      })

      if (response.ok) {
        toast.success('Configuración guardada exitosamente')
      } else {
        toast.error('Error al guardar la configuración')
      }
    } catch (error) {
      console.error('Error saving config:', error)
      toast.error('Error al guardar la configuración')
    } finally {
      setSaving(false)
    }
  }

  const handleReset = () => {
    setConfig(defaultConfig)
    toast.success('Configuración restablecida')
  }

  const handleFileUpload = async (file: File, field: keyof SiteConfig) => {
    setUploadingLogo(true)
    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        body: formData,
      })

      if (response.ok) {
        const { cloudStoragePath } = await response.json()
        setConfig(prev => ({ ...prev, [field]: cloudStoragePath }))
        toast.success('Archivo subido exitosamente')
      } else {
        toast.error('Error al subir el archivo')
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Error al subir el archivo')
    } finally {
      setUploadingLogo(false)
    }
  }

  const renderLogosTab = () => (
    <div className="space-y-6">
      {/* Logo Principal */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Logo Principal (Header)</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Subir Nuevo Logo
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) handleFileUpload(file, 'logoUrl')
              }}
              className="block w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Tamaño del Logo
            </label>
            <select
              value={config.logoSize}
              onChange={(e) => setConfig(prev => ({ ...prev, logoSize: e.target.value as any }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            >
              <option value="small">Pequeño (96x24px)</option>
              <option value="medium">Mediano (128x32px)</option>
              <option value="large">Grande (160x40px)</option>
            </select>
          </div>
        </div>
        
        {config.logoUrl && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Vista Previa
            </label>
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-600">
              <div className={`relative ${config.logoSize === 'small' ? 'w-24 h-6' : config.logoSize === 'large' ? 'w-40 h-10' : 'w-32 h-8'}`}>
                <Image
                  src={config.logoUrl}
                  alt="Logo Preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Favicon */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Favicon</h3>
        <input
          type="file"
          accept="image/x-icon,image/png,image/ico"
          onChange={(e) => {
            const file = e.target.files?.[0]
            if (file) handleFileUpload(file, 'faviconUrl')
          }}
          className="block w-full text-slate-300 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-medium file:bg-blue-600 file:text-white hover:file:bg-blue-700"
        />
        {config.faviconUrl && (
          <div className="mt-4">
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-600 w-fit">
              <div className="relative w-8 h-8">
                <Image
                  src={config.faviconUrl}
                  alt="Favicon Preview"
                  fill
                  className="object-contain"
                />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )

  const renderHeroTab = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Contenido del Hero</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Texto del Badge
            </label>
            <input
              type="text"
              value={config.heroBadgeText}
              onChange={(e) => setConfig(prev => ({ ...prev, heroBadgeText: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Título Principal (use \n para salto de línea)
            </label>
            <textarea
              value={config.heroTitle}
              onChange={(e) => setConfig(prev => ({ ...prev, heroTitle: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Subtítulo (use \n para salto de línea)
            </label>
            <textarea
              value={config.heroSubtitle}
              onChange={(e) => setConfig(prev => ({ ...prev, heroSubtitle: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Botón Principal
              </label>
              <input
                type="text"
                value={config.heroCtaPrimary}
                onChange={(e) => setConfig(prev => ({ ...prev, heroCtaPrimary: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Botón Secundario
              </label>
              <input
                type="text"
                value={config.heroCTASecondary}
                onChange={(e) => setConfig(prev => ({ ...prev, heroCTASecondary: e.target.value }))}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )

  const renderStatsTab = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Estadísticas del Hero</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((num) => (
            <div key={num} className="space-y-4">
              <h4 className="text-md font-medium text-blue-400">Estadística {num}</h4>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Valor
                </label>
                <input
                  type="text"
                  value={config[`stat${num}Value` as keyof SiteConfig] as string}
                  onChange={(e) => setConfig(prev => ({ ...prev, [`stat${num}Value`]: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">
                  Etiqueta
                </label>
                <input
                  type="text"
                  value={config[`stat${num}Label` as keyof SiteConfig] as string}
                  onChange={(e) => setConfig(prev => ({ ...prev, [`stat${num}Label`]: e.target.value }))}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )

  const renderSectionsTab = () => (
    <div className="space-y-6">
      {/* Features Section */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Sección de Características</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Título
            </label>
            <input
              type="text"
              value={config.featuresTitle}
              onChange={(e) => setConfig(prev => ({ ...prev, featuresTitle: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Subtítulo
            </label>
            <textarea
              value={config.featuresSubtitle}
              onChange={(e) => setConfig(prev => ({ ...prev, featuresSubtitle: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Sección "Cómo Funciona"</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Título
            </label>
            <input
              type="text"
              value={config.howItWorksTitle}
              onChange={(e) => setConfig(prev => ({ ...prev, howItWorksTitle: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Subtítulo
            </label>
            <textarea
              value={config.howItWorksSubtitle}
              onChange={(e) => setConfig(prev => ({ ...prev, howItWorksSubtitle: e.target.value }))}
              rows={2}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderContactTab = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Información de Contacto</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Número de WhatsApp
              <span className="text-xs text-slate-400 block">
                Formato: message/IOR2WUU66JVMM1 o número completo
              </span>
            </label>
            <input
              type="text"
              value={config.whatsappNumber}
              onChange={(e) => setConfig(prev => ({ ...prev, whatsappNumber: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Email de Soporte
            </label>
            <input
              type="email"
              value={config.supportEmail}
              onChange={(e) => setConfig(prev => ({ ...prev, supportEmail: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
          </div>
        </div>
      </div>
    </div>
  )

  const renderSEOTab = () => (
    <div className="space-y-6">
      <div className="bg-slate-800/50 rounded-lg p-6 border border-slate-700">
        <h3 className="text-lg font-semibold text-white mb-4">Configuración SEO</h3>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Título (Meta Title)
            </label>
            <input
              type="text"
              value={config.metaTitle}
              onChange={(e) => setConfig(prev => ({ ...prev, metaTitle: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Descripción (Meta Description)
            </label>
            <textarea
              value={config.metaDescription}
              onChange={(e) => setConfig(prev => ({ ...prev, metaDescription: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Palabras Clave (separadas por comas)
            </label>
            <input
              type="text"
              value={config.metaKeywords}
              onChange={(e) => setConfig(prev => ({ ...prev, metaKeywords: e.target.value }))}
              className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white"
            />
          </div>
        </div>
      </div>
    </div>
  )

  if (loading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Configuración del Sitio</h1>
            <p className="text-slate-400">Gestiona el contenido visual y textual de tu sitio web</p>
          </div>
          
          <div className="flex items-center space-x-4 mt-4 sm:mt-0">
            <button
              onClick={handleReset}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-slate-600 text-white rounded-lg hover:bg-slate-700 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restablecer</span>
            </button>
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50"
            >
              {saving ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{saving ? 'Guardando...' : 'Guardar'}</span>
            </button>
          </div>
        </div>

        <div className="bg-slate-800/50 rounded-lg border border-slate-700">
          {/* Tabs */}
          <div className="border-b border-slate-700">
            <nav className="flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-4 px-1 inline-flex items-center space-x-2 border-b-2 font-medium text-sm ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-400'
                        : 'border-transparent text-slate-400 hover:text-slate-300 hover:border-slate-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.name}</span>
                  </button>
                )
              })}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'logos' && renderLogosTab()}
            {activeTab === 'hero' && renderHeroTab()}
            {activeTab === 'stats' && renderStatsTab()}
            {activeTab === 'sections' && renderSectionsTab()}
            {activeTab === 'contact' && renderContactTab()}
            {activeTab === 'seo' && renderSEOTab()}
          </div>
        </div>

        {/* Status indicators */}
        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-400" />
              <span className="text-sm text-slate-300">
                Los cambios se aplicarán automáticamente en el sitio web
              </span>
            </div>
            
            <div className="text-xs text-slate-400">
              Última actualización: {new Date().toLocaleString('es-MX')}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}

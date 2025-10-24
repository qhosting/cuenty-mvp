'use client'

import { useState, useRef } from 'react'
import { Upload, Image as ImageIcon, Link as LinkIcon, Check, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

interface LogoUploaderProps {
  value: string
  onChange: (url: string) => void
  error?: string
}

// Lista de logos predefinidos de servicios populares
const PREDEFINED_LOGOS = [
  {
    name: 'Netflix',
    url: 'https://i.pinimg.com/736x/19/63/c8/1963c80b8983da5f3be640ca7473b098.jpg'
  },
  {
    name: 'Disney+',
    url: 'https://upload.wikimedia.org/wikipedia/commons/6/64/Disney%2B_2024.svg'
  },
  {
    name: 'HBO Max',
    url: 'https://pbs.twimg.com/media/FthviO_WwAIN6Ux.jpg:large'
  },
  {
    name: 'Spotify',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/26/Spotify_logo_with_text.svg/2560px-Spotify_logo_with_text.svg.png'
  },
  {
    name: 'Prime Video',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9e/Amazon_Prime_logo_%282024%29.svg/1200px-Amazon_Prime_logo_%282024%29.svg.png'
  },
  {
    name: 'Apple TV+',
    url: 'https://upload.wikimedia.org/wikipedia/en/e/eb/Apple_TV_logo_2025.png'
  },
  {
    name: 'YouTube Premium',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/YouTube_Premium_logo.svg/1280px-YouTube_Premium_logo.svg.png'
  },
  {
    name: 'Paramount+',
    url: 'https://upload.wikimedia.org/wikipedia/commons/a/a5/Paramount_Plus.svg'
  },
  {
    name: 'Star+',
    url: 'https://i.ytimg.com/vi/yjm38pD9KTY/maxresdefault.jpg'
  },
  {
    name: 'Crunchyroll',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f6/Crunchyroll_Logo.svg/1842px-Crunchyroll_Logo.svg.png'
  },
  {
    name: 'Twitch',
    url: 'https://upload.wikimedia.org/wikipedia/commons/2/26/Twitch_logo.svg'
  },
  {
    name: 'VIX',
    url: 'https://upload.wikimedia.org/wikipedia/commons/thumb/f/f0/ViX_Logo.png/1200px-ViX_Logo.png'
  }
]

export function LogoUploader({ value, onChange, error }: LogoUploaderProps) {
  const [selectedTab, setSelectedTab] = useState<'predefined' | 'upload' | 'url'>('predefined')
  const [uploading, setUploading] = useState(false)
  const [customUrl, setCustomUrl] = useState(value)
  const [s3Available, setS3Available] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileUpload = async (file: File) => {
    if (!file) return

    // Validar tipo de archivo
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
    if (!allowedTypes.includes(file.type)) {
      toast.error('Solo se permiten imágenes (JPEG, PNG, GIF, WEBP)')
      return
    }

    // Validar tamaño (5MB máximo)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('La imagen no puede superar los 5MB')
      return
    }

    setUploading(true)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/admin/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        },
        body: formData
      })

      const result = await response.json()

      if (result.success && result.cloudStoragePath) {
        onChange(result.cloudStoragePath)
        toast.success('Logo subido correctamente')
        setS3Available(true)
      } else {
        // Si hay error de configuración de S3, desactivar esta opción
        if (result.error && (result.error.includes('S3') || result.error.includes('AWS') || result.error.includes('bucket'))) {
          setS3Available(false)
          toast.error('La subida de archivos no está disponible. Por favor usa logos predefinidos o una URL.')
          setSelectedTab('predefined')
        } else {
          toast.error(result.error || 'Error al subir el logo')
        }
      }
    } catch (error) {
      console.error('Error uploading file:', error)
      toast.error('Error al subir el archivo. Intenta con una URL o logos predefinidos.')
      setS3Available(false)
      setSelectedTab('predefined')
    } finally {
      setUploading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileUpload(file)
    }
  }

  const handleUrlSubmit = () => {
    if (!customUrl.trim()) {
      toast.error('Por favor ingresa una URL')
      return
    }

    // Validar URL
    try {
      const url = new URL(customUrl.trim())
      if (!['http:', 'https:'].includes(url.protocol)) {
        toast.error('La URL debe ser HTTP o HTTPS')
        return
      }
      onChange(customUrl.trim())
      toast.success('URL del logo actualizada')
    } catch {
      toast.error('URL no válida')
    }
  }

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-slate-300">
        Logo del Servicio
      </label>

      {/* Tabs */}
      <div className="flex space-x-2 bg-slate-900/50 p-1 rounded-lg">
        <button
          type="button"
          onClick={() => setSelectedTab('predefined')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedTab === 'predefined'
              ? 'bg-blue-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <ImageIcon className="w-4 h-4 inline mr-1" />
          Predefinidos
        </button>
        <button
          type="button"
          onClick={() => {
            if (!s3Available) {
              toast.error('La subida de archivos no está disponible. Configura AWS S3 primero.')
              return
            }
            setSelectedTab('upload')
          }}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            !s3Available 
              ? 'text-slate-600 cursor-not-allowed opacity-50'
              : selectedTab === 'upload'
              ? 'bg-blue-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
          disabled={!s3Available}
        >
          <Upload className="w-4 h-4 inline mr-1" />
          Subir {!s3Available && '(No disponible)'}
        </button>
        <button
          type="button"
          onClick={() => setSelectedTab('url')}
          className={`flex-1 px-3 py-2 text-sm font-medium rounded-md transition-colors ${
            selectedTab === 'url'
              ? 'bg-blue-500 text-white'
              : 'text-slate-400 hover:text-white hover:bg-slate-800'
          }`}
        >
          <LinkIcon className="w-4 h-4 inline mr-1" />
          URL
        </button>
      </div>

      {/* Content */}
      <div className={`bg-slate-900/50 rounded-lg p-4 border transition-colors ${
        error ? 'border-red-500' : 'border-slate-700'
      }`}>
        {/* Predefined Logos */}
        {selectedTab === 'predefined' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Selecciona un logo de la lista de servicios populares
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 max-h-64 overflow-y-auto">
              {PREDEFINED_LOGOS.map((logo) => (
                <button
                  key={logo.name}
                  type="button"
                  onClick={() => {
                    onChange(logo.url)
                    toast.success(`Logo de ${logo.name} seleccionado`)
                  }}
                  className={`relative group p-3 rounded-lg border-2 transition-all hover:scale-105 ${
                    value === logo.url
                      ? 'border-blue-500 bg-blue-500/10'
                      : 'border-slate-700 hover:border-slate-600 bg-slate-800/50'
                  }`}
                >
                  <div className="aspect-square relative overflow-hidden rounded-md bg-white/10">
                    <img
                      src={logo.url}
                      alt={logo.name}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23334155" width="100" height="100"/%3E%3C/svg%3E'
                      }}
                    />
                  </div>
                  <p className="text-xs text-slate-300 mt-2 truncate">{logo.name}</p>
                  {value === logo.url && (
                    <div className="absolute top-1 right-1 bg-blue-500 rounded-full p-1">
                      <Check className="w-3 h-3 text-white" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Upload */}
        {selectedTab === 'upload' && (
          <div className="space-y-3">
            {s3Available ? (
              <>
                <p className="text-xs text-slate-400">
                  Sube una imagen desde tu computadora (máx. 5MB)
                </p>
                <div
                  onClick={() => !uploading && fileInputRef.current?.click()}
                  className={`border-2 border-dashed border-slate-600 rounded-lg p-8 text-center transition-all ${
                    uploading ? 'cursor-wait' : 'cursor-pointer hover:border-blue-500 hover:bg-slate-800/50'
                  }`}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                    disabled={uploading}
                  />
                  {uploading ? (
                    <div className="flex flex-col items-center space-y-2">
                      <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                      <p className="text-sm text-slate-400">Subiendo logo...</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center space-y-2">
                      <Upload className="w-8 h-8 text-slate-500" />
                      <p className="text-sm text-slate-300">Haz clic para seleccionar una imagen</p>
                      <p className="text-xs text-slate-500">JPG, PNG, GIF o WEBP (máx. 5MB)</p>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <p className="text-sm text-yellow-400 mb-2">⚠️ Subida de archivos no disponible</p>
                <p className="text-xs text-slate-400">
                  La configuración de AWS S3 no está disponible. Por favor, usa logos predefinidos o ingresa una URL personalizada.
                </p>
              </div>
            )}
          </div>
        )}

        {/* URL */}
        {selectedTab === 'url' && (
          <div className="space-y-3">
            <p className="text-xs text-slate-400">
              Ingresa la URL de una imagen existente
            </p>
            <div className="flex space-x-2">
              <input
                type="url"
                value={customUrl}
                onChange={(e) => setCustomUrl(e.target.value)}
                placeholder="https://i.pinimg.com/736x/c3/51/84/c351844f3be5fa5df32375cd320e6894.jpg"
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              />
              <button
                type="button"
                onClick={handleUrlSubmit}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-medium"
              >
                Aplicar
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Preview */}
      {value && (
        <div className="space-y-2">
          <p className="text-xs text-slate-400">Vista previa:</p>
          <div className="relative w-24 h-24 rounded-lg overflow-hidden bg-slate-800 border border-slate-700">
            <img
              src={value}
              alt="Logo preview"
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect fill="%23334155" width="100" height="100"/%3E%3C/svg%3E'
              }}
            />
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <p className="text-sm text-red-400">{error}</p>
      )}
    </div>
  )
}

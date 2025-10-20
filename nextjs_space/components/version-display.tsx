'use client'

import { useState, useEffect } from 'react'
import { Code } from 'lucide-react'

interface VersionInfo {
  version: string
  name?: string
  environment?: string
  timestamp?: string
}

interface VersionDisplayProps {
  variant?: 'badge' | 'full' | 'minimal'
  className?: string
}

export function VersionDisplay({ variant = 'badge', className = '' }: VersionDisplayProps) {
  const [versionInfo, setVersionInfo] = useState<VersionInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchVersion = async () => {
      try {
        const response = await fetch('/api/version')
        if (response.ok) {
          const data = await response.json()
          setVersionInfo(data)
        }
      } catch (error) {
        console.error('Error al obtener versión:', error)
      } finally {
        setLoading(false)
      }
    }
    fetchVersion()
  }, [])

  if (loading || !versionInfo) return null

  // Badge variant - small and compact
  if (variant === 'badge') {
    return (
      <div className={`inline-flex items-center space-x-1 px-2 py-1 bg-slate-800/50 rounded-full border border-slate-700 text-xs text-slate-400 ${className}`}>
        <Code className="w-3 h-3" />
        <span>v{versionInfo.version}</span>
      </div>
    )
  }

  // Minimal variant - just version number
  if (variant === 'minimal') {
    return (
      <span className={`text-xs text-slate-500 ${className}`}>
        v{versionInfo.version}
      </span>
    )
  }

  // Full variant - detailed information
  return (
    <div className={`bg-slate-800/30 border border-slate-700/50 rounded-lg p-3 ${className}`}>
      <div className="flex items-center space-x-2 mb-2">
        <Code className="w-4 h-4 text-blue-400" />
        <span className="text-sm font-semibold text-white">Información del Sistema</span>
      </div>
      <div className="space-y-1 text-xs text-slate-400">
        <div className="flex justify-between">
          <span>Versión:</span>
          <span className="text-white font-mono">{versionInfo.version}</span>
        </div>
        {versionInfo.environment && (
          <div className="flex justify-between">
            <span>Entorno:</span>
            <span className="text-white font-mono">{versionInfo.environment}</span>
          </div>
        )}
        {versionInfo.timestamp && (
          <div className="flex justify-between">
            <span>Última actualización:</span>
            <span className="text-white font-mono">
              {new Date(versionInfo.timestamp).toLocaleString('es-MX', {
                dateStyle: 'short',
                timeStyle: 'short'
              })}
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

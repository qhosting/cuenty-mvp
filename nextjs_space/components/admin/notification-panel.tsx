'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Bell,
  ShoppingBag,
  Users,
  AlertCircle,
  CheckCircle,
  X,
  Clock
} from 'lucide-react'
import Link from 'next/link'

interface Notification {
  id: string
  type: 'new_order' | 'subscription_expiring' | 'new_user' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  link?: string
}

interface NotificationPanelProps {
  isOpen: boolean
  onClose: () => void
  onNotificationCountUpdate?: (count: number) => void
}

const getNotificationIcon = (type: Notification['type']) => {
  switch (type) {
    case 'new_order':
      return <ShoppingBag className="w-5 h-5 text-blue-400" />
    case 'subscription_expiring':
      return <AlertCircle className="w-5 h-5 text-yellow-400" />
    case 'new_user':
      return <Users className="w-5 h-5 text-green-400" />
    default:
      return <Bell className="w-5 h-5 text-purple-400" />
  }
}

const getNotificationColor = (type: Notification['type']) => {
  switch (type) {
    case 'new_order':
      return 'from-blue-500/10 to-blue-600/5 border-blue-500/20'
    case 'subscription_expiring':
      return 'from-yellow-500/10 to-yellow-600/5 border-yellow-500/20'
    case 'new_user':
      return 'from-green-500/10 to-green-600/5 border-green-500/20'
    default:
      return 'from-purple-500/10 to-purple-600/5 border-purple-500/20'
  }
}

const formatTimestamp = (date: Date) => {
  const now = new Date()
  const diff = now.getTime() - new Date(date).getTime()
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (minutes < 1) return 'Ahora'
  if (minutes < 60) return `Hace ${minutes} min`
  if (hours < 24) return `Hace ${hours} h`
  return `Hace ${days} día${days !== 1 ? 's' : ''}`
}

export function NotificationPanel({ 
  isOpen, 
  onClose,
  onNotificationCountUpdate 
}: NotificationPanelProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const panelRef = useRef<HTMLDivElement>(null)

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node)) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  // Cargar notificaciones
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])

  const fetchNotifications = async () => {
    setLoading(true)
    setError(null)

    try {
      const token = localStorage.getItem('admin_token')
      const response = await fetch('/api/admin/notifications', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      })

      if (!response.ok) {
        throw new Error('Error al cargar notificaciones')
      }

      const data = await response.json()
      
      if (data.success) {
        setNotifications(data.notifications || [])
        
        // Actualizar contador
        if (onNotificationCountUpdate) {
          onNotificationCountUpdate(data.unreadCount || 0)
        }
      } else {
        throw new Error(data.error || 'Error desconocido')
      }
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err.message : 'Error al cargar notificaciones')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const token = localStorage.getItem('admin_token')
      await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationIds: [notificationId] })
      })

      // Actualizar localmente
      setNotifications(prev =>
        prev.map(n =>
          n.id === notificationId ? { ...n, read: true } : n
        )
      )

      // Actualizar contador
      const unreadCount = notifications.filter(n => !n.read && n.id !== notificationId).length
      if (onNotificationCountUpdate) {
        onNotificationCountUpdate(unreadCount)
      }
    } catch (err) {
      console.error('Error marking notification as read:', err)
    }
  }

  const markAllAsRead = async () => {
    try {
      const token = localStorage.getItem('admin_token')
      const unreadIds = notifications.filter(n => !n.read).map(n => n.id)

      await fetch('/api/admin/notifications', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ notificationIds: unreadIds })
      })

      // Actualizar localmente
      setNotifications(prev =>
        prev.map(n => ({ ...n, read: true }))
      )

      // Actualizar contador
      if (onNotificationCountUpdate) {
        onNotificationCountUpdate(0)
      }
    } catch (err) {
      console.error('Error marking all notifications as read:', err)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="absolute right-0 top-12 w-96 max-w-[calc(100vw-2rem)] bg-slate-900/95 backdrop-blur-xl border border-slate-700 rounded-xl shadow-2xl shadow-black/50 overflow-hidden z-50"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
            <div className="flex items-center space-x-2">
              <Bell className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-semibold text-white">Notificaciones</h3>
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="px-2 py-0.5 text-xs font-medium bg-red-500 text-white rounded-full">
                  {notifications.filter(n => !n.read).length}
                </span>
              )}
            </div>
            
            <button
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <div className="max-h-[500px] overflow-y-auto">
            {loading && (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
              </div>
            )}

            {error && (
              <div className="p-4 m-4 bg-red-500/10 border border-red-500/30 rounded-lg">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            {!loading && !error && notifications.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 px-4">
                <CheckCircle className="w-12 h-12 text-slate-600 mb-3" />
                <p className="text-slate-400 text-sm text-center">
                  No hay notificaciones nuevas
                </p>
              </div>
            )}

            {!loading && !error && notifications.length > 0 && (
              <>
                {/* Mark all as read button */}
                {notifications.some(n => !n.read) && (
                  <div className="px-4 pt-3 pb-2">
                    <button
                      onClick={markAllAsRead}
                      className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors"
                    >
                      Marcar todas como leídas
                    </button>
                  </div>
                )}

                <div className="divide-y divide-slate-700/50">
                  {notifications.map((notification) => (
                    <motion.div
                      key={notification.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className={`p-4 hover:bg-slate-800/30 transition-colors cursor-pointer ${
                        !notification.read ? 'bg-slate-800/20' : ''
                      }`}
                      onClick={() => {
                        if (!notification.read) {
                          markAsRead(notification.id)
                        }
                        if (notification.link) {
                          window.location.href = notification.link
                        }
                      }}
                    >
                      <div className="flex items-start space-x-3">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg bg-gradient-to-br ${getNotificationColor(notification.type)} border flex items-center justify-center`}>
                          {getNotificationIcon(notification.type)}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between mb-1">
                            <p className="text-sm font-medium text-white">
                              {notification.title}
                            </p>
                            {!notification.read && (
                              <span className="flex-shrink-0 w-2 h-2 bg-blue-500 rounded-full ml-2 mt-1.5"></span>
                            )}
                          </div>

                          <p className="text-sm text-slate-400 leading-relaxed mb-2">
                            {notification.message}
                          </p>

                          <div className="flex items-center space-x-1 text-xs text-slate-500">
                            <Clock className="w-3 h-3" />
                            <span>{formatTimestamp(notification.timestamp)}</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Footer */}
          {!loading && notifications.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-700 bg-slate-800/30">
              <button
                onClick={() => {
                  window.location.href = '/admin'
                  onClose()
                }}
                className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
              >
                Ver todas las notificaciones
              </button>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  )
}

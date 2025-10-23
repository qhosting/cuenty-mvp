
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { DynamicLogo } from '@/components/dynamic-logo'
import { ErrorBoundary } from '@/components/error-boundary'
import {
  LayoutDashboard,
  Package,
  CreditCard,
  ShoppingBag,
  Users,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Palette
} from 'lucide-react'
import { adminAuth } from '@/lib/admin-auth'
import { toast } from 'react-hot-toast'

interface AdminLayoutProps {
  children: React.ReactNode
  currentPath?: string
}

const navigation = [
  {
    name: 'Dashboard',
    href: '/admin',
    icon: LayoutDashboard
  },
  {
    name: 'Servicios',
    href: '/admin/services',
    icon: Package
  },
  {
    name: 'Planes',
    href: '/admin/plans',
    icon: CreditCard
  },
  {
    name: 'Pedidos',
    href: '/admin/orders',
    icon: ShoppingBag
  },
  {
    name: 'Cuentas',
    href: '/admin/accounts',
    icon: Users
  },
  {
    name: 'Config. Sitio',
    href: '/admin/site-config',
    icon: Palette
  },
  {
    name: 'Configuración',
    href: '/admin/config',
    icon: Settings
  }
]

export function AdminLayout({ children, currentPath }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [apiVersion, setApiVersion] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    // Check authentication only once on mount
    const checkAuth = () => {
      console.log('[AdminLayout] Iniciando verificación de autenticación...')
      const token = localStorage.getItem('admin_token')
      console.log('[AdminLayout] Token encontrado:', token ? 'sí' : 'no')
      
      const isAuth = !!token
      
      if (!isAuth) {
        console.log('[AdminLayout] No autenticado, redirigiendo a login...')
        // Prevenir loops de redirección verificando la URL actual
        if (typeof window !== 'undefined' && !window.location.pathname.includes('/admin/login')) {
          window.location.href = '/admin/login'
        }
        return false
      }

      console.log('[AdminLayout] Usuario autenticado correctamente')
      return true
    }

    const isAuth = checkAuth()
    setIsAuthenticated(isAuth)
    setMounted(true)

    if (isAuth) {
      // Obtener versión de la API solo si está autenticado
      const fetchApiVersion = async () => {
        try {
          const response = await fetch('/api/version')
          if (response.ok) {
            const data = await response.json()
            setApiVersion(data.version)
          }
        } catch (error) {
          console.error('[AdminLayout] Error al obtener versión de API:', error)
        }
      }
      fetchApiVersion()
    }
  }, [])

  const handleLogout = () => {
    toast.success('Sesión cerrada correctamente')
    adminAuth.logout()
  }

  // Show loading state while checking authentication
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white text-lg">Cargando...</div>
      </div>
    )
  }

  // If not authenticated, don't render anything (will redirect)
  if (!isAuthenticated) {
    return null
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/50 lg:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.div
        initial={false}
        animate={{
          x: sidebarOpen ? 0 : -256
        }}
        className="fixed inset-y-0 left-0 z-50 w-64 bg-slate-900/90 backdrop-blur-xl border-r border-slate-700 lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700">
            <DynamicLogo linkTo="/" size="medium" showText={false} />
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-3 py-4 space-y-1">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Panel de Administración
            </p>
            {navigation.map((item) => {
              const isActive = currentPath === item.href
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center space-x-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Bottom section */}
          <div className="p-3 border-t border-slate-700 space-y-2">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-3 py-2.5 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-lg transition-all duration-200 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
            
            {apiVersion && (
              <div className="flex items-center justify-center px-3 py-2 text-xs text-slate-500 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <span className="font-mono">API v{apiVersion}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top header */}
        <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700">
          <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <h1 className="text-base lg:text-lg font-semibold text-white lg:ml-0 ml-2">
              Panel de Administración
            </h1>
            
            <div className="flex items-center space-x-2 lg:space-x-4">
              <button className="relative p-2 text-slate-400 hover:text-white">
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                  3
                </span>
              </button>
              
              <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-medium">
                A
              </div>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6 max-w-7xl mx-auto">
          {children}
        </main>
      </div>
    </div>
    </ErrorBoundary>
  )
}

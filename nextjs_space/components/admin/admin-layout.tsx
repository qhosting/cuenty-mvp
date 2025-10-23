
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
  Palette,
  ChevronLeft,
  ChevronRight
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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
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
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-x-hidden">
        {/* Mobile sidebar overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
          )}
        </AnimatePresence>

        {/* Sidebar - Mobile */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div
              initial={{ x: -320 }}
              animate={{ x: 0 }}
              exit={{ x: -320 }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700 lg:hidden shadow-2xl"
            >
              <div className="flex h-full flex-col">
                {/* Logo */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
                  <div className="flex items-center space-x-3">
                    <DynamicLogo linkTo="/" size="medium" showText={false} />
                    <span className="text-white font-bold text-lg">CUENTY</span>
                  </div>
                  <button
                    onClick={() => setSidebarOpen(false)}
                    className="p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
                  <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                    Panel de Administración
                  </p>
                  {navigation.map((item) => {
                    const isActive = currentPath === item.href
                    return (
                      <Link
                        key={item.name}
                        href={item.href}
                        className={`flex items-center space-x-3 px-4 py-3 text-sm font-medium rounded-xl transition-all duration-200 ${
                          isActive
                            ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10'
                            : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                        }`}
                        onClick={() => setSidebarOpen(false)}
                      >
                        <item.icon className="w-5 h-5 flex-shrink-0" />
                        <span>{item.name}</span>
                      </Link>
                    )
                  })}
                </nav>

                {/* Bottom section */}
                <div className="p-4 border-t border-slate-700 space-y-2">
                  <button
                    onClick={handleLogout}
                    className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 w-full"
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
          )}
        </AnimatePresence>

        {/* Sidebar - Desktop */}
        <motion.div
          initial={false}
          animate={{
            width: sidebarCollapsed ? 80 : 256
          }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="hidden lg:block fixed inset-y-0 left-0 z-30 bg-slate-900/95 backdrop-blur-xl border-r border-slate-700 shadow-xl"
        >
          <div className="flex h-full flex-col">
            {/* Logo */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-slate-700 h-[73px]">
              {!sidebarCollapsed && (
                <div className="flex items-center space-x-3">
                  <DynamicLogo linkTo="/" size="medium" showText={false} />
                  <span className="text-white font-bold text-lg">CUENTY</span>
                </div>
              )}
              {sidebarCollapsed && (
                <div className="mx-auto">
                  <DynamicLogo linkTo="/" size="medium" showText={false} />
                </div>
              )}
              <button
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                className="hidden lg:block p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors absolute -right-3 top-5 bg-slate-900 border border-slate-700"
              >
                {sidebarCollapsed ? (
                  <ChevronRight className="w-4 h-4" />
                ) : (
                  <ChevronLeft className="w-4 h-4" />
                )}
              </button>
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
              {!sidebarCollapsed && (
                <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
                  Panel de Administración
                </p>
              )}
              {navigation.map((item) => {
                const isActive = currentPath === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 text-sm font-medium rounded-xl transition-all duration-200 group relative ${
                      isActive
                        ? 'bg-gradient-to-r from-blue-500/20 to-purple-600/20 text-white border border-blue-500/30 shadow-lg shadow-blue-500/10'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
                    }`}
                    title={sidebarCollapsed ? item.name : ''}
                  >
                    <item.icon className="w-5 h-5 flex-shrink-0" />
                    {!sidebarCollapsed && <span>{item.name}</span>}
                    
                    {/* Tooltip for collapsed state */}
                    {sidebarCollapsed && (
                      <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-slate-700">
                        {item.name}
                      </div>
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Bottom section */}
            <div className="p-3 border-t border-slate-700 space-y-2">
              <button
                onClick={handleLogout}
                className={`flex items-center ${sidebarCollapsed ? 'justify-center' : 'space-x-3'} px-3 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 w-full group relative`}
                title={sidebarCollapsed ? 'Cerrar Sesión' : ''}
              >
                <LogOut className="w-5 h-5 flex-shrink-0" />
                {!sidebarCollapsed && <span>Cerrar Sesión</span>}
                
                {/* Tooltip for collapsed state */}
                {sidebarCollapsed && (
                  <div className="absolute left-full ml-2 px-3 py-1.5 bg-slate-800 text-white text-sm rounded-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 whitespace-nowrap z-50 shadow-xl border border-slate-700">
                    Cerrar Sesión
                  </div>
                )}
              </button>
              
              {apiVersion && !sidebarCollapsed && (
                <div className="flex items-center justify-center px-3 py-2 text-xs text-slate-500 bg-slate-800/30 rounded-lg border border-slate-700/50">
                  <span className="font-mono">API v{apiVersion}</span>
                </div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Main content wrapper */}
        <motion.div
          initial={false}
          animate={{
            marginLeft: 0
          }}
          className="lg:ml-64 min-h-screen flex flex-col"
          style={{
            marginLeft: typeof window !== 'undefined' && window.innerWidth >= 1024 ? (sidebarCollapsed ? 80 : 256) : 0
          }}
        >
          {/* Top header */}
          <div className="sticky top-0 z-20 bg-slate-900/90 backdrop-blur-xl border-b border-slate-700 shadow-lg">
            <div className="flex items-center justify-between px-4 py-3 lg:px-6 lg:py-4">
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setSidebarOpen(true)}
                  className="lg:hidden p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors"
                >
                  <Menu className="w-6 h-6" />
                </button>
                
                <h1 className="text-base lg:text-lg font-semibold text-white">
                  Panel de Administración
                </h1>
              </div>
              
              <div className="flex items-center space-x-2 lg:space-x-4">
                <button className="relative p-2 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-lg transition-colors">
                  <Bell className="w-5 h-5" />
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                    3
                  </span>
                </button>
                
                <div className="w-9 h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm shadow-lg">
                  A
                </div>
              </div>
            </div>
          </div>

          {/* Page content */}
          <main className="flex-1 p-4 lg:p-6 xl:p-8 max-w-[1600px] w-full mx-auto">
            <div className="w-full">
              {children}
            </div>
          </main>

          {/* Footer */}
          <footer className="border-t border-slate-700 bg-slate-900/50 backdrop-blur-xl mt-auto">
            <div className="px-4 lg:px-6 xl:px-8 py-4 max-w-[1600px] w-full mx-auto">
              <div className="flex flex-col sm:flex-row items-center justify-between space-y-2 sm:space-y-0 text-sm text-slate-400">
                <p>© 2024 CUENTY. Todos los derechos reservados.</p>
                <p className="flex items-center space-x-2">
                  <span>Versión 1.0.0</span>
                  {apiVersion && (
                    <>
                      <span>•</span>
                      <span className="font-mono">API v{apiVersion}</span>
                    </>
                  )}
                </p>
              </div>
            </div>
          </footer>
        </motion.div>
      </div>
    </ErrorBoundary>
  )
}

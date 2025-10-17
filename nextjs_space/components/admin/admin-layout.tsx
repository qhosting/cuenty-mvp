
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'framer-motion'
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
  Bell
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
    name: 'Configuración',
    href: '/admin/config',
    icon: Settings
  }
]

export function AdminLayout({ children, currentPath }: AdminLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [apiVersion, setApiVersion] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    setMounted(true)
    
    // Check authentication
    if (!adminAuth.isAuthenticated()) {
      router.push('/admin/login')
      return
    }

    // Obtener versión de la API
    const fetchApiVersion = async () => {
      try {
        const response = await fetch('/api/version')
        if (response.ok) {
          const data = await response.json()
          setApiVersion(data.version)
        }
      } catch (error) {
        console.error('Error al obtener versión de API:', error)
      }
    }
    fetchApiVersion()
  }, [router])

  const handleLogout = () => {
    toast.success('Sesión cerrada correctamente')
    adminAuth.logout()
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Cargando...</div>
      </div>
    )
  }

  if (!adminAuth.isAuthenticated()) {
    return null
  }

  return (
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
          x: sidebarOpen ? 0 : -320
        }}
        className="fixed inset-y-0 left-0 z-50 w-80 bg-slate-900/90 backdrop-blur-xl border-r border-slate-700 lg:translate-x-0 lg:static lg:inset-0"
      >
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex items-center justify-between px-6 py-6 border-b border-slate-700">
            <Link href="/" className="flex items-center space-x-3">
              <div className="relative w-32 h-8">
                <Image
                  src="/images/CUENTY.png"
                  alt="CUENTY"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            <p className="px-4 text-xs font-semibold text-slate-400 uppercase tracking-wider">
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
          <div className="p-4 border-t border-slate-700 space-y-3">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-800/50 rounded-xl transition-all duration-200 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Cerrar Sesión</span>
            </button>
            
            {apiVersion && (
              <div className="flex items-center justify-center px-4 py-2 text-xs text-slate-500 bg-slate-800/30 rounded-lg border border-slate-700/50">
                <span className="font-mono">API v{apiVersion}</span>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Main content */}
      <div className="lg:pl-80">
        {/* Top header */}
        <div className="sticky top-0 z-40 bg-slate-900/80 backdrop-blur-xl border-b border-slate-700">
          <div className="flex items-center justify-between px-6 py-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 text-slate-400 hover:text-white"
            >
              <Menu className="w-6 h-6" />
            </button>
            
            <h1 className="text-lg font-semibold text-white lg:ml-0 ml-2">
              Panel de Administración
            </h1>
            
            <div className="flex items-center space-x-4">
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
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  )
}

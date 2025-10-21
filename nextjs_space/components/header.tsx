
'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Menu, X, User, LogOut, Heart, Settings } from 'lucide-react'
import Link from 'next/link'
import { HeaderLogo } from '@/components/dynamic-logo'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  let session = null
  let status = 'loading'
  
  try {
    const sessionData = useSession() || {}
    session = sessionData.data || null
    status = sessionData.status || 'loading'
  } catch (error) {
    // useSession not available, proceed without session
    status = 'loading'
    session = null
  }

  useEffect(() => {
    setMounted(true)
  }, [])

  const navigation = [
    { name: 'Catálogo', href: '/catalogo' },
    { name: 'Cómo Funciona', href: '#como-funciona' },
    { name: 'Soporte', href: '#faq' },
  ]

  const handleLogout = async () => {
    await signOut({ redirect: true, callbackUrl: '/' })
  }

  if (!mounted) {
    return (
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <HeaderLogo />
            <div className="hidden md:flex space-x-8">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-slate-300 hover:text-white transition-colors duration-200 font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </div>
            <div className="h-9 w-20 bg-slate-700 animate-pulse rounded"></div>
          </div>
        </div>
      </header>
    )
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <HeaderLogo />

          {/* Desktop Navigation */}
          <nav className="hidden md:flex space-x-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="text-slate-300 hover:text-white transition-colors duration-200 font-medium"
              >
                {item.name}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="h-9 w-20 bg-slate-700 animate-pulse rounded"></div>
            ) : session ? (
              <div className="relative group">
                <button className="flex items-center space-x-2 bg-slate-800 hover:bg-slate-700 px-3 py-2 rounded-lg transition-colors">
                  <User className="w-4 h-4" />
                  <span className="text-sm font-medium">{session.user?.name?.split(' ')[0] || 'Usuario'}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-slate-800 rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                  <div className="py-1">
                    <Link href="/dashboard" className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700">
                      <User className="w-4 h-4" />
                      <span>Mi Cuenta</span>
                    </Link>
                    <Link href="/dashboard/orders" className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700">
                      <Heart className="w-4 h-4" />
                      <span>Mis Órdenes</span>
                    </Link>
                    <Link href="/dashboard/settings" className="flex items-center space-x-2 px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700">
                      <Settings className="w-4 h-4" />
                      <span>Configuración</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex items-center space-x-2 w-full px-4 py-2 text-sm text-slate-300 hover:text-white hover:bg-slate-700"
                    >
                      <LogOut className="w-4 h-4" />
                      <span>Cerrar Sesión</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  href="/auth/login"
                  className="text-slate-300 hover:text-white transition-colors font-medium"
                >
                  Iniciar Sesión
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-300 hover:text-white"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 py-4 space-y-2">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="block px-4 py-2 text-slate-300 hover:text-white transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            
            <div className="px-4 py-2 border-t border-slate-700 mt-4">
              {session ? (
                <div className="space-y-2">
                  <Link href="/dashboard" className="flex items-center space-x-2 py-2 text-slate-300">
                    <User className="w-4 h-4" />
                    <span>Mi Cuenta</span>
                  </Link>
                  <button onClick={handleLogout} className="flex items-center space-x-2 py-2 text-slate-300">
                    <LogOut className="w-4 h-4" />
                    <span>Cerrar Sesión</span>
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <Link href="/auth/login" className="block py-2 text-slate-300">
                    Iniciar Sesión
                  </Link>
                  <Link href="/auth/register" className="block py-2 text-blue-400">
                    Registrarse
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  )
}

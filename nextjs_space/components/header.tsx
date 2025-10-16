
'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Menu, X, User, LogIn, UserPlus } from 'lucide-react'
import { useSession, signOut } from 'next-auth/react'

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { data: session, status } = useSession() || {}

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen)

  const menuItems = [
    { href: '#productos', label: 'Productos' },
    { href: '#caracteristicas', label: 'Características' },
    { href: '#como-funciona', label: 'Cómo Funciona' },
    { href: '#faq', label: 'FAQ' },
    { href: '#contacto', label: 'Contacto' },
  ]

  return (
    <motion.header 
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="relative w-32 h-8">
              <Image
                src="/images/CUENTY.png"
                alt="CUENTY Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            {menuItems?.map((item) => (
              <Link
                key={item?.href}
                href={item?.href || '#'}
                className="text-white/80 hover:text-white transition-colors duration-300 text-sm font-medium"
              >
                {item?.label}
              </Link>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {status === 'loading' ? (
              <div className="animate-pulse bg-white/20 h-10 w-20 rounded-lg"></div>
            ) : session?.user ? (
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <User className="w-5 h-5 text-white/70" />
                  <span className="text-white/80 text-sm">{session.user.name || session.user.email}</span>
                </div>
                <button
                  onClick={() => signOut()}
                  className="text-white/80 hover:text-white transition-colors duration-300 text-sm font-medium"
                >
                  Salir
                </button>
              </div>
            ) : (
              <div className="flex items-center space-x-3">
                <Link
                  href="/auth/login"
                  className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-300 text-sm font-medium"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Ingresar</span>
                </Link>
                <Link
                  href="/auth/register"
                  className="flex items-center space-x-2 btn-primary text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  <span>Registro</span>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <button
            onClick={toggleMenu}
            className="md:hidden text-white/80 hover:text-white transition-colors duration-300"
          >
            {isMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden py-4 border-t border-white/10"
          >
            <nav className="flex flex-col space-y-4">
              {menuItems?.map((item) => (
                <Link
                  key={item?.href}
                  href={item?.href || '#'}
                  onClick={toggleMenu}
                  className="text-white/80 hover:text-white transition-colors duration-300 font-medium"
                >
                  {item?.label}
                </Link>
              ))}
              <div className="pt-4 border-t border-white/10 flex flex-col space-y-3">
                {session?.user ? (
                  <>
                    <div className="flex items-center space-x-2 text-white/80">
                      <User className="w-5 h-5" />
                      <span className="text-sm">{session.user.name || session.user.email}</span>
                    </div>
                    <button
                      onClick={() => signOut()}
                      className="text-left text-white/80 hover:text-white transition-colors duration-300 font-medium"
                    >
                      Salir
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth/login"
                      onClick={toggleMenu}
                      className="flex items-center space-x-2 text-white/80 hover:text-white transition-colors duration-300 font-medium"
                    >
                      <LogIn className="w-4 h-4" />
                      <span>Ingresar</span>
                    </Link>
                    <Link
                      href="/auth/register"
                      onClick={toggleMenu}
                      className="flex items-center space-x-2 btn-primary text-sm w-fit"
                    >
                      <UserPlus className="w-4 h-4" />
                      <span>Registro</span>
                    </Link>
                  </>
                )}
              </div>
            </nav>
          </motion.div>
        )}
      </div>
    </motion.header>
  )
}

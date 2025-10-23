
'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { getClienteToken, removeClienteToken, getClienteProfile, Cliente } from '@/lib/client-auth';
import { HomeIcon, CreditCardIcon, ShoppingBagIcon, UserIcon, ArrowRightOnRectangleIcon, Bars3Icon, XMarkIcon } from '@heroicons/react/24/outline';

// Páginas que no requieren autenticación
const publicPages = ['/client/login', '/client/register', '/client/forgot-password'];

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const token = getClienteToken();

      // Si no hay token y no estamos en una página pública, redirigir al login
      if (!token && !publicPages.includes(pathname)) {
        router.push('/client/login');
        return;
      }

      // Si hay token, obtener el perfil del cliente
      if (token && !publicPages.includes(pathname)) {
        try {
          const response = await getClienteProfile(token);
          setCliente(response.cliente);
        } catch (error) {
          // Token inválido o expirado
          removeClienteToken();
          router.push('/client/login');
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, [pathname, router]);

  const handleLogout = () => {
    removeClienteToken();
    router.push('/client/login');
  };

  // Mostrar loader mientras se verifica la autenticación
  if (loading && !publicPages.includes(pathname)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si es una página pública, renderizar sin layout
  if (publicPages.includes(pathname)) {
    return <>{children}</>;
  }

  // Navegación del sidebar
  const navigation = [
    { name: 'Dashboard', href: '/client/dashboard', icon: HomeIcon },
    { name: 'Mis Cuentas', href: '/client/accounts', icon: CreditCardIcon },
    { name: 'Mis Pedidos', href: '/client/orders', icon: ShoppingBagIcon },
    { name: 'Mi Perfil', href: '/client/profile', icon: UserIcon },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Sidebar para móvil */}
      <div
        className={`fixed inset-0 z-50 lg:hidden ${
          sidebarOpen ? 'block' : 'hidden'
        }`}
      >
        <div
          className="fixed inset-0 bg-black/50"
          onClick={() => setSidebarOpen(false)}
        ></div>
        <div className="fixed inset-y-0 left-0 w-64 bg-gray-900 p-6">
          <div className="flex items-center justify-between mb-8">
            <Image
              src="/CUENTY.png"
              alt="CUENTY"
              width={120}
              height={40}
            />
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-400 hover:text-white"
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <nav className="space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                  onClick={() => setSidebarOpen(false)}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="absolute bottom-6 left-6 right-6">
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Sidebar para desktop */}
      <div className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col">
        <div className="flex flex-col flex-grow bg-gray-900 p-6">
          <div className="mb-8">
            <Image
              src="/CUENTY.png"
              alt="CUENTY"
              width={150}
              height={50}
            />
          </div>

          <nav className="flex-1 space-y-2">
            {navigation.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={`flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${
                    isActive
                      ? 'bg-purple-600 text-white'
                      : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                  }`}
                >
                  <item.icon className="h-5 w-5 mr-3" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          <div className="border-t border-gray-800 pt-4">
            {cliente && (
              <div className="mb-4 px-4">
                <p className="text-sm font-medium text-white">
                  {cliente.nombre} {cliente.apellido}
                </p>
                <p className="text-xs text-gray-400">{cliente.email}</p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
            >
              <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3" />
              Cerrar Sesión
            </button>
          </div>
        </div>
      </div>

      {/* Contenido principal */}
      <div className="lg:pl-64">
        {/* Header móvil */}
        <div className="lg:hidden flex items-center justify-between p-4 bg-gray-900/50 backdrop-blur">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-white"
          >
            <Bars3Icon className="h-6 w-6" />
          </button>
          <Image
            src="/CUENTY.png"
            alt="CUENTY"
            width={100}
            height={33}
          />
          <div className="w-6"></div>
        </div>

        {/* Contenido */}
        <main className="p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}

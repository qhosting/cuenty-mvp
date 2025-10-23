
'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { getClienteToken } from '@/lib/client-auth';
import { getDashboard, DashboardData } from '@/lib/client-api';
import { CreditCardIcon, ClockIcon, ShoppingBagIcon, CheckCircleIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ClientDashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = getClienteToken();
        if (!token) return;

        const dashboardData = await getDashboard(token);
        setData(dashboardData);
      } catch (err: any) {
        setError(err.message || 'Error al cargar datos');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Cargando dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
        {error}
      </div>
    );
  }

  if (!data) return null;

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'entregada':
      case 'pagada':
        return 'text-green-400';
      case 'pendiente_pago':
        return 'text-yellow-400';
      case 'cancelada':
        return 'text-red-400';
      default:
        return 'text-gray-400';
    }
  };

  const getPaymentStatusIcon = (status: string) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircleIcon className="h-5 w-5 text-green-400" />;
      case 'failed':
        return <XCircleIcon className="h-5 w-5 text-red-400" />;
      default:
        return <ClockIcon className="h-5 w-5 text-yellow-400" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">
          ¡Bienvenido, {data.cliente.nombre}!
        </h1>
        <p className="text-gray-400 mt-2">
          Aquí puedes gestionar todas tus suscripciones y pedidos
        </p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-purple-600 to-blue-600 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-200 text-sm font-medium">Cuentas Activas</p>
              <p className="text-3xl font-bold text-white mt-2">
                {data.estadisticas.cuentasActivas}
              </p>
            </div>
            <CreditCardIcon className="h-12 w-12 text-purple-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-600 to-orange-600 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-200 text-sm font-medium">Próximas a Vencer</p>
              <p className="text-3xl font-bold text-white mt-2">
                {data.estadisticas.cuentasProximasVencer}
              </p>
            </div>
            <ClockIcon className="h-12 w-12 text-yellow-200" />
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-600 to-teal-600 rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-200 text-sm font-medium">Total Pedidos</p>
              <p className="text-3xl font-bold text-white mt-2">
                {data.ultimasOrdenes.length}
              </p>
            </div>
            <ShoppingBagIcon className="h-12 w-12 text-green-200" />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Próximos Vencimientos */}
        <div className="bg-gray-900/50 backdrop-blur rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Próximos Vencimientos</h2>
            <Link
              href="/client/accounts"
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Ver todas →
            </Link>
          </div>

          {data.proximosVencimientos.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No hay cuentas próximas a vencer
            </p>
          ) : (
            <div className="space-y-4">
              {data.proximosVencimientos.map((cuenta) => (
                <div
                  key={cuenta.id}
                  className="bg-gray-800 rounded-lg p-4 flex items-center justify-between"
                >
                  <div className="flex items-center space-x-4">
                    {cuenta.logoServicio && (
                      <Image
                        src={cuenta.logoServicio}
                        alt={cuenta.servicio}
                        width={40}
                        height={40}
                        className="rounded"
                      />
                    )}
                    <div>
                      <p className="text-white font-medium">{cuenta.servicio}</p>
                      <p className="text-sm text-gray-400">{cuenta.plan}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`text-sm font-medium ${
                      cuenta.diasRestantes <= 3 ? 'text-red-400' : 
                      cuenta.diasRestantes <= 7 ? 'text-yellow-400' : 
                      'text-gray-400'
                    }`}>
                      {cuenta.diasRestantes} días
                    </p>
                    <p className="text-xs text-gray-500">
                      {new Date(cuenta.fechaVencimiento).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Últimos Pedidos */}
        <div className="bg-gray-900/50 backdrop-blur rounded-lg p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-white">Últimos Pedidos</h2>
            <Link
              href="/client/orders"
              className="text-sm text-purple-400 hover:text-purple-300"
            >
              Ver todos →
            </Link>
          </div>

          {data.ultimasOrdenes.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No tienes pedidos aún
            </p>
          ) : (
            <div className="space-y-4">
              {data.ultimasOrdenes.map((orden) => (
                <Link
                  key={orden.id}
                  href={`/client/orders`}
                  className="bg-gray-800 rounded-lg p-4 block hover:bg-gray-750 transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <p className="text-white font-medium">Orden #{orden.id}</p>
                      {getPaymentStatusIcon(orden.paymentStatus)}
                    </div>
                    <p className="text-white font-bold">${orden.total}</p>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <p className={getEstadoColor(orden.estado)}>
                      {orden.estado.replace('_', ' ')}
                    </p>
                    <p className="text-gray-400">
                      {new Date(orden.fecha).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="text-xs text-gray-500 mt-2">
                    {orden.itemsCount} {orden.itemsCount === 1 ? 'item' : 'items'}
                  </p>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Acciones Rápidas */}
      <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg p-6">
        <h2 className="text-xl font-bold text-white mb-4">Acciones Rápidas</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/catalogo"
            className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-4 text-center transition-colors"
          >
            <ShoppingBagIcon className="h-8 w-8 text-white mx-auto mb-2" />
            <p className="text-white font-medium">Comprar Servicios</p>
          </Link>
          <Link
            href="/client/accounts"
            className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-4 text-center transition-colors"
          >
            <CreditCardIcon className="h-8 w-8 text-white mx-auto mb-2" />
            <p className="text-white font-medium">Ver Mis Cuentas</p>
          </Link>
          <Link
            href="/client/profile"
            className="bg-white/10 hover:bg-white/20 backdrop-blur rounded-lg p-4 text-center transition-colors"
          >
            <svg className="h-8 w-8 text-white mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
            <p className="text-white font-medium">Editar Perfil</p>
          </Link>
        </div>
      </div>
    </div>
  );
}

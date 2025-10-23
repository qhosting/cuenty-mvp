
'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import { motion } from 'framer-motion'
import {
  TrendingUp,
  Users,
  ShoppingBag,
  Package,
  DollarSign,
  Calendar,
  ArrowUpRight,
  Star,
  RefreshCw
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { adminApiService } from '@/lib/admin-auth'
import { toast } from 'react-hot-toast'

// Importar componentes de gráficos de forma dinámica para evitar problemas de SSR
const SalesChart = dynamic(() => import('@/components/admin/charts/SalesChart').then(mod => mod.SalesChart), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-slate-400">Cargando gráfico...</div>
})

const OrdersStatusChart = dynamic(() => import('@/components/admin/charts/OrdersStatusChart').then(mod => mod.OrdersStatusChart), { 
  ssr: false,
  loading: () => <div className="flex items-center justify-center h-full text-slate-400">Cargando gráfico...</div>
})

interface DashboardStats {
  totalOrders: number
  totalRevenue: number
  totalUsers: number
  activeServices: number
  salesData: Array<{ day: string; sales: number }>
  topServices: Array<{ name: string; sales: number; revenue: number }>
  ordersByStatus: Array<{ status: string; count: number; color: string }>
}

const defaultStats: DashboardStats = {
  totalOrders: 0,
  totalRevenue: 0,
  totalUsers: 0,
  activeServices: 0,
  salesData: [],
  topServices: [],
  ordersByStatus: []
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats>(defaultStats)
  const [loading, setLoading] = useState(true)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    console.log('[AdminDashboard] Componente montado')
    setMounted(true)
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      console.log('[AdminDashboard] Iniciando carga de datos...')
      setLoading(true)
      
      const result = await adminApiService.getDashboard()
      console.log('[AdminDashboard] Resultado de la API:', result)
      
      if (result.success) {
        console.log('[AdminDashboard] Datos cargados exitosamente')
        setStats(result.data)
      } else {
        console.warn('[AdminDashboard] API falló, usando datos mock:', result.message)
        // Set mock data if API fails
        setStats(getMockStats())
        toast.error(result.message || 'Error al cargar estadísticas, mostrando datos de ejemplo')
      }
    } catch (error) {
      console.error('[AdminDashboard] Error al cargar datos:', error)
      toast.error('Error de conexión, mostrando datos de ejemplo')
      // Set mock data on error
      setStats(getMockStats())
    } finally {
      setLoading(false)
      console.log('[AdminDashboard] Carga completada')
    }
  }

  // Helper function to get mock stats
  const getMockStats = (): DashboardStats => ({
    totalOrders: 156,
    totalRevenue: 45280,
    totalUsers: 89,
    activeServices: 12,
    salesData: [
      { day: 'Lun', sales: 4200 },
      { day: 'Mar', sales: 3800 },
      { day: 'Mie', sales: 5100 },
      { day: 'Jue', sales: 4600 },
      { day: 'Vie', sales: 6200 },
      { day: 'Sab', sales: 7800 },
      { day: 'Dom', sales: 6400 }
    ],
    topServices: [
      { name: 'Netflix Premium', sales: 45, revenue: 13500 },
      { name: 'Disney+ Familiar', sales: 32, revenue: 9600 },
      { name: 'HBO Max', sales: 28, revenue: 8400 },
      { name: 'Amazon Prime', sales: 24, revenue: 7200 },
      { name: 'Spotify Premium', sales: 18, revenue: 5400 }
    ],
    ordersByStatus: [
      { status: 'Completadas', count: 89, color: '#22c55e' },
      { status: 'Pendientes', count: 34, color: '#f59e0b' },
      { status: 'En Proceso', count: 23, color: '#3b82f6' },
      { status: 'Canceladas', count: 10, color: '#ef4444' }
    ]
  })

  const statCards = [
    {
      title: 'Total Pedidos',
      value: stats.totalOrders.toLocaleString(),
      icon: ShoppingBag,
      change: '+12%',
      changeType: 'positive' as const
    },
    {
      title: 'Ingresos Totales',
      value: `$${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      change: '+8%',
      changeType: 'positive' as const
    },
    {
      title: 'Usuarios Registrados',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      change: '+15%',
      changeType: 'positive' as const
    },
    {
      title: 'Servicios Activos',
      value: stats.activeServices.toString(),
      icon: Package,
      change: '+2',
      changeType: 'positive' as const
    }
  ]

  if (loading) {
    return (
      <AdminLayout currentPath="/admin">
        <div className="flex items-center justify-center h-96">
          <div className="text-white text-lg">Cargando estadísticas...</div>
        </div>
      </AdminLayout>
    )
  }

  return (
    <AdminLayout currentPath="/admin">
      <div className="space-y-6 w-full">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl xl:text-4xl font-bold text-white mb-1.5">Dashboard</h1>
            <p className="text-slate-400 text-sm lg:text-base">
              Resumen general de la plataforma CUENTY
            </p>
          </div>
          <button
            onClick={fetchDashboardData}
            disabled={loading}
            className="flex items-center justify-center space-x-2 px-4 py-2.5 bg-blue-500 hover:bg-blue-600 disabled:bg-slate-600 disabled:cursor-not-allowed text-white rounded-xl transition-colors duration-200 font-medium shadow-lg hover:shadow-blue-500/25 w-full sm:w-auto"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Actualizar</span>
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 lg:gap-5">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 lg:p-6 border border-slate-700 hover:bg-slate-800/70 hover:border-slate-600 transition-all duration-200 hover:shadow-xl hover:shadow-blue-500/10"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl">
                  <stat.icon className="w-5 h-5 lg:w-6 lg:h-6 text-blue-400" />
                </div>
                <div className={`flex items-center text-xs lg:text-sm font-medium ${
                  stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <ArrowUpRight className="w-3.5 h-3.5 lg:w-4 lg:h-4 mr-1" />
                  {stat.change}
                </div>
              </div>
              <div>
                <h3 className="text-2xl lg:text-3xl font-bold text-white mb-1.5">{stat.value}</h3>
                <p className="text-slate-400 text-sm lg:text-base">{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        {mounted && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 lg:gap-6">
            {/* Sales Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 lg:p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg lg:text-xl font-semibold text-white">Ventas por Día</h3>
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-5 h-5 text-blue-400" />
                </div>
              </div>
              <div className="h-72 lg:h-80">
                <SalesChart data={stats.salesData} />
              </div>
            </motion.div>

            {/* Orders Status Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 lg:p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg lg:text-xl font-semibold text-white">Estado de Pedidos</h3>
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <Calendar className="w-5 h-5 text-purple-400" />
                </div>
              </div>
              <div className="h-72 lg:h-80">
                <OrdersStatusChart data={stats.ordersByStatus} />
              </div>
            </motion.div>
          </div>
        )}

        {/* Top Services */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-5 lg:p-6 border border-slate-700 hover:border-slate-600 transition-all duration-200"
        >
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg lg:text-xl font-semibold text-white">Top 5 Servicios</h3>
            <div className="p-2 bg-yellow-500/10 rounded-lg">
              <Star className="w-5 h-5 text-yellow-400" />
            </div>
          </div>
          {stats.topServices.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12">
              <Package className="w-16 h-16 text-slate-600 mb-3" />
              <p className="text-slate-400 text-base">No hay servicios vendidos aún</p>
            </div>
          ) : (
            <div className="overflow-x-auto -mx-5 px-5 lg:mx-0 lg:px-0">
              <table className="w-full min-w-[500px]">
                <thead>
                  <tr className="border-b border-slate-600">
                    <th className="text-left py-3 px-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Servicio</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Ventas</th>
                    <th className="text-right py-3 px-4 text-slate-400 font-semibold text-sm uppercase tracking-wider">Ingresos</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.topServices.map((service, index) => (
                    <tr key={service.name} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 lg:w-9 lg:h-9 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center text-white font-semibold text-sm lg:text-base shadow-lg">
                            {index + 1}
                          </div>
                          <span className="text-white font-medium text-sm lg:text-base">{service.name}</span>
                        </div>
                      </td>
                      <td className="text-right py-4 px-4 text-slate-300 text-sm lg:text-base">
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-blue-500/10 text-blue-400 rounded-lg font-medium">
                          {service.sales} ventas
                        </span>
                      </td>
                      <td className="text-right py-4 px-4">
                        <span className="inline-flex items-center justify-center px-3 py-1 bg-green-500/10 text-green-400 rounded-lg font-semibold text-sm lg:text-base">
                          ${service.revenue.toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </motion.div>
      </div>
    </AdminLayout>
  )
}

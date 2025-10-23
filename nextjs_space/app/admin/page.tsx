
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
  Star
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
      <div className="space-y-5">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl lg:text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-slate-400 text-sm">
            Resumen general de la plataforma CUENTY
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 lg:p-5 border border-slate-700 hover:bg-slate-800/70 transition-all duration-200"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg">
                  <stat.icon className="w-5 h-5 text-blue-400" />
                </div>
                <div className={`flex items-center text-xs lg:text-sm ${
                  stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                }`}>
                  <ArrowUpRight className="w-3 h-3 lg:w-4 lg:h-4 mr-1" />
                  {stat.change}
                </div>
              </div>
              <div>
                <h3 className="text-xl lg:text-2xl font-bold text-white mb-1">{stat.value}</h3>
                <p className="text-slate-400 text-xs lg:text-sm">{stat.title}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Row */}
        {mounted && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Sales Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 lg:p-5 border border-slate-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg lg:text-xl font-semibold text-white">Ventas por Día</h3>
                <TrendingUp className="w-5 h-5 text-blue-400" />
              </div>
              <div className="h-64 lg:h-80">
                <SalesChart data={stats.salesData} />
              </div>
            </motion.div>

            {/* Orders Status Pie Chart */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 lg:p-5 border border-slate-700"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg lg:text-xl font-semibold text-white">Estado de Pedidos</h3>
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div className="h-64 lg:h-80">
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
          className="bg-slate-800/50 backdrop-blur-xl rounded-xl p-4 lg:p-5 border border-slate-700"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg lg:text-xl font-semibold text-white">Top 5 Servicios</h3>
            <Star className="w-5 h-5 text-blue-400" />
          </div>
          <div className="overflow-x-auto -mx-4 lg:mx-0">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-600">
                  <th className="text-left py-2.5 px-4 text-slate-400 font-medium text-sm">Servicio</th>
                  <th className="text-right py-2.5 px-4 text-slate-400 font-medium text-sm">Ventas</th>
                  <th className="text-right py-2.5 px-4 text-slate-400 font-medium text-sm">Ingresos</th>
                </tr>
              </thead>
              <tbody>
                {stats.topServices.map((service, index) => (
                  <tr key={service.name} className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2 lg:space-x-3">
                        <div className="w-7 h-7 lg:w-8 lg:h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-medium text-xs lg:text-sm">
                          {index + 1}
                        </div>
                        <span className="text-white font-medium text-sm lg:text-base">{service.name}</span>
                      </div>
                    </td>
                    <td className="text-right py-3 px-4 text-slate-300 text-sm">
                      {service.sales} ventas
                    </td>
                    <td className="text-right py-3 px-4 text-green-400 font-medium text-sm">
                      ${service.revenue.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>
      </div>
    </AdminLayout>
  )
}

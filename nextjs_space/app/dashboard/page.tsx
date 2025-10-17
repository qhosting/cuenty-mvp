
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { User, Package, Settings, Shield, Clock, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { formatPrice, formatDuration } from '@/lib/utils'

interface Order {
  id: string
  totalAmount: number
  status: string
  createdAt: string
  product: {
    id: string
    name: string
    category: string
    duration: number
  }
}

interface DashboardStats {
  totalOrders: number
  activeSubscriptions: number
  totalSpent: number
  lastOrderDate?: string
}

export default function DashboardPage() {
  const sessionData = useSession() || {}; const session = sessionData.data || null; const status = sessionData.status || "loading"
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    activeSubscriptions: 0,
    totalSpent: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchDashboardData()
  }, [session, status, router])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const ordersData = await response.json()
        setOrders(ordersData.slice(0, 5)) // Mostrar solo las últimas 5
        
        // Calcular estadísticas
        const totalSpent = ordersData.reduce((sum: number, order: Order) => sum + Number(order.totalAmount), 0)
        const activeSubscriptions = ordersData.filter((order: Order) => 
          order.status === 'COMPLETED' || order.status === 'PAID'
        ).length
        const lastOrder = ordersData[0]
        
        setStats({
          totalOrders: ordersData.length,
          activeSubscriptions,
          totalSpent,
          lastOrderDate: lastOrder?.createdAt
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-500/20'
      case 'PAID': return 'bg-blue-500/20 text-blue-400 border-blue-500/20'
      case 'PROCESSING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20'
      case 'PENDING': return 'bg-orange-500/20 text-orange-400 border-orange-500/20'
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/20'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/20'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'Completada'
      case 'PAID': return 'Pagada'
      case 'PROCESSING': return 'Procesando'
      case 'PENDING': return 'Pendiente'
      case 'CANCELLED': return 'Cancelada'
      default: return status
    }
  }

  if (status === 'loading' || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-slate-700 rounded w-1/4"></div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-32 bg-slate-800/50 rounded-xl"></div>
                ))}
              </div>
              <div className="h-64 bg-slate-800/50 rounded-xl"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!session) {
    return null
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">
              ¡Hola, {session.user?.name?.split(' ')[0]}! 👋
            </h1>
            <p className="text-xl text-slate-300">
              Gestiona tus suscripciones y órdenes desde tu panel de control
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gradient-to-br from-blue-500/20 to-blue-600/10 backdrop-blur-sm rounded-xl border border-blue-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-blue-500/20 rounded-lg">
                  <Package className="w-6 h-6 text-blue-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{stats.totalOrders}</div>
                  <div className="text-sm text-blue-300">Total de Órdenes</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-500/20 to-green-600/10 backdrop-blur-sm rounded-xl border border-green-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-500/20 rounded-lg">
                  <Shield className="w-6 h-6 text-green-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{stats.activeSubscriptions}</div>
                  <div className="text-sm text-green-300">Suscripciones Activas</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-500/20 to-purple-600/10 backdrop-blur-sm rounded-xl border border-purple-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-500/20 rounded-lg">
                  <Calendar className="w-6 h-6 text-purple-400" />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-white">{formatPrice(stats.totalSpent)}</div>
                  <div className="text-sm text-purple-300">Total Gastado</div>
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-500/20 to-cyan-600/10 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-cyan-500/20 rounded-lg">
                  <Clock className="w-6 h-6 text-cyan-400" />
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {stats.lastOrderDate 
                      ? new Date(stats.lastOrderDate).toLocaleDateString('es-MX', { day: '2-digit', month: 'short' })
                      : 'N/A'
                    }
                  </div>
                  <div className="text-sm text-cyan-300">Última Compra</div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-semibold text-white">Órdenes Recientes</h2>
                  <Link
                    href="/dashboard/orders"
                    className="text-blue-400 hover:text-blue-300 transition-colors font-medium"
                  >
                    Ver todas →
                  </Link>
                </div>

                {orders.length === 0 ? (
                  <div className="text-center py-8">
                    <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-white mb-2">No tienes órdenes aún</h3>
                    <p className="text-slate-300 mb-4">
                      ¡Explora nuestro catálogo y haz tu primera compra!
                    </p>
                    <Link
                      href="/catalogo"
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
                    >
                      <span>Ver Catálogo</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {orders.map((order) => (
                      <div
                        key={order.id}
                        className="bg-slate-900/50 rounded-lg p-4 hover:bg-slate-800/50 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <h4 className="font-medium text-white">{order.product.name}</h4>
                            <p className="text-sm text-slate-400">
                              {new Date(order.createdAt).toLocaleDateString('es-MX', {
                                day: '2-digit',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold text-white mb-1">
                              {formatPrice(Number(order.totalAmount))}
                            </div>
                            <div className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              {/* Account Info */}
              <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Información de la cuenta</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <User className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-300">{session.user?.name}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Package className="w-5 h-5 text-slate-400" />
                    <span className="text-slate-300">{session.user?.email}</span>
                  </div>
                  {session.user?.phone && (
                    <div className="flex items-center space-x-3">
                      <Settings className="w-5 h-5 text-slate-400" />
                      <span className="text-slate-300">{session.user.phone}</span>
                    </div>
                  )}
                </div>
                <Link
                  href="/dashboard/settings"
                  className="mt-4 w-full bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium text-center block"
                >
                  Editar perfil
                </Link>
              </div>

              {/* Quick Actions */}
              <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">Acciones rápidas</h3>
                <div className="space-y-3">
                  <Link
                    href="/catalogo"
                    className="flex items-center justify-between w-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 hover:from-blue-500/30 hover:to-purple-500/30 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    <span className="font-medium">Explorar Catálogo</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/dashboard/orders"
                    className="flex items-center justify-between w-full bg-slate-700/50 hover:bg-slate-600/50 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    <span className="font-medium">Ver Mis Órdenes</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <button
                    onClick={() => {
                      const message = encodeURIComponent('¡Hola! Tengo una consulta sobre mi cuenta en CUENTY. ¿Podrían ayudarme? 😊')
                      const whatsappUrl = `https://wa.me/message/IOR2WUU66JVMM1?text=${message}`
                      window.open(whatsappUrl, '_blank')
                    }}
                    className="flex items-center justify-between w-full bg-green-500/20 hover:bg-green-500/30 text-white py-3 px-4 rounded-lg transition-colors"
                  >
                    <span className="font-medium">Contactar Soporte</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Tips */}
              <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
                <h3 className="text-lg font-semibold text-white mb-4">💡 Tips</h3>
                <div className="space-y-3 text-sm">
                  <div className="text-slate-300">
                    <strong className="text-white">Entrega rápida:</strong> Las credenciales se envían por WhatsApp inmediatamente
                  </div>
                  <div className="text-slate-300">
                    <strong className="text-white">Soporte 24/7:</strong> Estamos disponibles para ayudarte cuando lo necesites
                  </div>
                  <div className="text-slate-300">
                    <strong className="text-white">Garantía:</strong> Si algo no funciona, te devolvemos tu dinero
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

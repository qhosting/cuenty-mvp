
'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Package, Search, Filter, ArrowLeft, Calendar, Clock, DollarSign, Eye } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { formatPrice, formatDuration } from '@/lib/utils'

interface Order {
  id: string
  totalAmount: number
  status: string
  createdAt: string
  updatedAt: string
  paymentMethod?: string
  product: {
    id: string
    name: string
    description: string
    category: string
    duration: number
  }
}

export default function OrdersPage() {
  const sessionData = useSession() || {}; const session = sessionData.data || null; const status = sessionData.status || "loading"
  const router = useRouter()
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    status: 'all',
    search: ''
  })

  useEffect(() => {
    if (status === 'loading') return
    if (!session) {
      router.push('/auth/login')
      return
    }
    fetchOrders()
  }, [session, status, router])

  useEffect(() => {
    filterOrders()
  }, [orders, filters])

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
      }
    } catch (error) {
      console.error('Error fetching orders:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterOrders = () => {
    let filtered = orders

    // Filtrar por estado
    if (filters.status !== 'all') {
      filtered = filtered.filter(order => order.status === filters.status)
    }

    // Filtrar por búsqueda
    if (filters.search) {
      filtered = filtered.filter(order =>
        order.product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        order.id.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    setFilteredOrders(filtered)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-500/20 text-green-400 border-green-500/30'
      case 'PAID': return 'bg-blue-500/20 text-blue-400 border-blue-500/30'
      case 'PROCESSING': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
      case 'PENDING': return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
      case 'CANCELLED': return 'bg-red-500/20 text-red-400 border-red-500/30'
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30'
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

  const statusOptions = [
    { value: 'all', label: 'Todos los estados' },
    { value: 'PENDING', label: 'Pendientes' },
    { value: 'PAID', label: 'Pagadas' },
    { value: 'PROCESSING', label: 'Procesando' },
    { value: 'COMPLETED', label: 'Completadas' },
    { value: 'CANCELLED', label: 'Canceladas' }
  ]

  if (status === 'loading' || loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="animate-pulse space-y-8">
              <div className="h-8 bg-slate-700 rounded w-1/4"></div>
              <div className="h-16 bg-slate-800/50 rounded-xl"></div>
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="h-24 bg-slate-800/50 rounded-xl"></div>
                ))}
              </div>
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
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver al Dashboard</span>
            </Link>
            
            <h1 className="text-4xl font-bold text-white mb-2">Mis Órdenes</h1>
            <p className="text-xl text-slate-300">
              Consulta el historial y estado de todas tus compras
            </p>
          </div>

          {/* Filters */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar por producto o ID de orden..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Status Filter */}
              <div className="lg:w-64">
                <select
                  value={filters.status}
                  onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
                >
                  {statusOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Orders */}
          <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-white">
                {filteredOrders.length} {filteredOrders.length === 1 ? 'orden' : 'órdenes'}
              </h2>
              {orders.length > 0 && (
                <div className="text-slate-300 text-sm">
                  Total gastado: <span className="font-semibold text-white">
                    {formatPrice(orders.reduce((sum, order) => sum + Number(order.totalAmount), 0))}
                  </span>
                </div>
              )}
            </div>

            {filteredOrders.length === 0 ? (
              <div className="text-center py-16">
                {orders.length === 0 ? (
                  <>
                    <Package className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No tienes órdenes aún</h3>
                    <p className="text-slate-300 mb-6">
                      ¡Explora nuestro catálogo y haz tu primera compra!
                    </p>
                    <Link
                      href="/catalogo"
                      className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
                    >
                      <span>Ver Catálogo</span>
                      <Package className="w-4 h-4" />
                    </Link>
                  </>
                ) : (
                  <>
                    <Filter className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                    <h3 className="text-xl font-semibold text-white mb-2">No se encontraron resultados</h3>
                    <p className="text-slate-300 mb-6">
                      Intenta cambiar los filtros de búsqueda
                    </p>
                    <button
                      onClick={() => setFilters({ status: 'all', search: '' })}
                      className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-colors"
                    >
                      Limpiar filtros
                    </button>
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredOrders.map((order) => (
                  <div
                    key={order.id}
                    className="bg-slate-900/50 rounded-lg border border-slate-700/50 hover:border-slate-600 transition-all duration-200 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                        {/* Order Info */}
                        <div className="flex-1">
                          <div className="flex items-start justify-between mb-2">
                            <div>
                              <h3 className="text-lg font-semibold text-white mb-1">
                                {order.product.name}
                              </h3>
                              <p className="text-slate-400 text-sm">
                                ID: {order.id.slice(-8).toUpperCase()}
                              </p>
                            </div>
                            <div className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>
                              {getStatusText(order.status)}
                            </div>
                          </div>
                          
                          <p className="text-slate-300 text-sm mb-3">
                            {order.product.description}
                          </p>

                          <div className="flex flex-wrap gap-4 text-sm text-slate-400">
                            <div className="flex items-center space-x-2">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {new Date(order.createdAt).toLocaleDateString('es-MX', {
                                  day: '2-digit',
                                  month: 'long',
                                  year: 'numeric',
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Clock className="w-4 h-4" />
                              <span>{formatDuration(order.product.duration)}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <DollarSign className="w-4 h-4" />
                              <span>{order.paymentMethod === 'bank_transfer' ? 'Transferencia' : 'Otro'}</span>
                            </div>
                          </div>
                        </div>

                        {/* Price and Actions */}
                        <div className="lg:text-right">
                          <div className="text-2xl font-bold text-white mb-3">
                            {formatPrice(Number(order.totalAmount))}
                          </div>
                          
                          <div className="flex lg:justify-end gap-2">
                            {order.status === 'PENDING' && (
                              <button
                                onClick={() => router.push(`/checkout?product=${order.product.id}`)}
                                className="bg-orange-500/20 hover:bg-orange-500/30 text-orange-400 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                              >
                                Completar Pago
                              </button>
                            )}
                            
                            {(order.status === 'COMPLETED' || order.status === 'PAID') && (
                              <button
                                onClick={() => {
                                  const message = encodeURIComponent(`Hola, necesito las credenciales de mi orden ${order.id.slice(-8).toUpperCase()}: ${order.product.name}`)
                                  const whatsappUrl = `https://wa.me/message/IOR2WUU66JVMM1?text=${message}`
                                  window.open(whatsappUrl, '_blank')
                                }}
                                className="bg-green-500/20 hover:bg-green-500/30 text-green-400 px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                              >
                                Ver Credenciales
                              </button>
                            )}
                            
                            <button
                              onClick={() => {
                                const message = encodeURIComponent(`Hola, tengo una consulta sobre mi orden ${order.id.slice(-8).toUpperCase()}`)
                                const whatsappUrl = `https://wa.me/message/IOR2WUU66JVMM1?text=${message}`
                                window.open(whatsappUrl, '_blank')
                              }}
                              className="bg-slate-700/50 hover:bg-slate-600/50 text-slate-300 hover:text-white px-4 py-2 rounded-lg transition-colors text-sm font-medium"
                            >
                              Soporte
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

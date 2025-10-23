'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Search,
  Filter,
  ShoppingBag,
  Eye,
  Calendar,
  Phone,
  DollarSign,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  XOctagon,
  HelpCircle,
  Shield
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { adminApiService } from '@/lib/admin-auth'
import { toast } from 'react-hot-toast'

interface Order {
  id: string
  usuario_celular: string
  servicio_nombre: string
  plan_nombre: string
  plan_duracion_meses: number
  total: number
  estado: 'pendiente' | 'pagado' | 'entregado' | 'cancelado'
  payment_status?: 'pending' | 'confirmed' | 'failed'
  payment_confirmed_at?: string
  payment_confirmed_by?: number
  admin_confirmador?: {
    id: number
    username: string
    email?: string
  }
  created_at: string
  updated_at: string
  comprobante_url?: string
  usuario_nombre?: string
  usuario_email?: string
}

const statusConfig = {
  pendiente: {
    label: 'Pendiente',
    color: 'text-yellow-400',
    bgColor: 'bg-yellow-500/20',
    icon: Clock
  },
  pagado: {
    label: 'Pagado',
    color: 'text-blue-400',
    bgColor: 'bg-blue-500/20',
    icon: AlertCircle
  },
  entregado: {
    label: 'Entregado',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    icon: CheckCircle
  },
  cancelado: {
    label: 'Cancelado',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    icon: XCircle
  }
}

const paymentStatusConfig = {
  pending: {
    label: 'Pago Pendiente',
    color: 'text-orange-400',
    bgColor: 'bg-orange-500/20',
    borderColor: 'border-orange-500/50',
    icon: HelpCircle,
    tooltip: 'El pago aún no ha sido confirmado por un administrador'
  },
  confirmed: {
    label: 'Pago Confirmado',
    color: 'text-green-400',
    bgColor: 'bg-green-500/20',
    borderColor: 'border-green-500/50',
    icon: CheckCircle2,
    tooltip: 'El pago ha sido verificado y confirmado'
  },
  failed: {
    label: 'Pago Fallido',
    color: 'text-red-400',
    bgColor: 'bg-red-500/20',
    borderColor: 'border-red-500/50',
    icon: XOctagon,
    tooltip: 'Hubo un problema con el pago'
  }
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string>('')
  const [dateFilter, setDateFilter] = useState('')
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [showOrderModal, setShowOrderModal] = useState(false)
  const [showConfirmPaymentModal, setShowConfirmPaymentModal] = useState(false)
  const [orderToConfirm, setOrderToConfirm] = useState<Order | null>(null)
  const [confirmingPayment, setConfirmingPayment] = useState(false)

  useEffect(() => {
    fetchOrders()
  }, [paymentStatusFilter])

  const fetchOrders = async () => {
    try {
      setLoading(true)
      const filters: any = {
        celular: searchTerm,
        estado: statusFilter,
        fecha: dateFilter
      }
      
      if (paymentStatusFilter) {
        filters.payment_status = paymentStatusFilter
      }
      
      const result = await adminApiService.getOrders(filters)
      
      if (result.success) {
        setOrders(result.data)
      } else {
        // Mock data for demo con payment_status
        setOrders([
          {
            id: '1',
            usuario_celular: '+56987654321',
            usuario_nombre: 'Juan Pérez',
            usuario_email: 'juan@email.com',
            servicio_nombre: 'Netflix',
            plan_nombre: 'Plan Premium',
            plan_duracion_meses: 1,
            total: 15990,
            estado: 'entregado',
            payment_status: 'confirmed',
            payment_confirmed_at: '2024-01-15T12:30:00Z',
            payment_confirmed_by: 1,
            admin_confirmador: {
              id: 1,
              username: 'admin',
              email: 'admin@cuenty.cl'
            },
            created_at: '2024-01-15T10:30:00Z',
            updated_at: '2024-01-15T14:30:00Z',
            comprobante_url: '/comprobantes/orden-1.jpg'
          },
          {
            id: '2',
            usuario_celular: '+56912345678',
            usuario_nombre: 'María González',
            usuario_email: 'maria@email.com',
            servicio_nombre: 'Disney+',
            plan_nombre: 'Plan Familiar',
            plan_duracion_meses: 3,
            total: 35990,
            estado: 'pagado',
            payment_status: 'pending',
            created_at: '2024-01-14T09:15:00Z',
            updated_at: '2024-01-14T11:20:00Z',
            comprobante_url: '/comprobantes/orden-2.jpg'
          },
          {
            id: '3',
            usuario_celular: '+56945678901',
            usuario_nombre: 'Carlos Silva',
            usuario_email: 'carlos@email.com',
            servicio_nombre: 'HBO Max',
            plan_nombre: 'Plan Estándar',
            plan_duracion_meses: 1,
            total: 12990,
            estado: 'pendiente',
            payment_status: 'pending',
            created_at: '2024-01-13T14:45:00Z',
            updated_at: '2024-01-13T14:45:00Z'
          },
          {
            id: '4',
            usuario_celular: '+56923456789',
            usuario_nombre: 'Ana Torres',
            usuario_email: 'ana@email.com',
            servicio_nombre: 'Spotify',
            plan_nombre: 'Plan Individual',
            plan_duracion_meses: 6,
            total: 29990,
            estado: 'cancelado',
            payment_status: 'failed',
            created_at: '2024-01-12T16:20:00Z',
            updated_at: '2024-01-12T18:30:00Z'
          }
        ])
        toast.error(result.message || 'Error al cargar pedidos')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (orderId: string, newStatus: string) => {
    try {
      const result = await adminApiService.updateOrderStatus(orderId, newStatus)
      
      if (result.success) {
        setOrders(orders.map(order => 
          order.id === orderId 
            ? { ...order, estado: newStatus as any, updated_at: new Date().toISOString() }
            : order
        ))
        toast.success('Estado actualizado correctamente')
      } else {
        toast.error(result.message || 'Error al actualizar estado')
      }
    } catch (error) {
      toast.error('Error de conexión')
    }
  }

  const handleConfirmPayment = async () => {
    if (!orderToConfirm) return

    try {
      setConfirmingPayment(true)
      const result = await adminApiService.confirmPayment(orderToConfirm.id)
      
      if (result.success) {
        // Actualizar la orden en el estado
        setOrders(orders.map(order => 
          order.id === orderToConfirm.id 
            ? { 
                ...order, 
                payment_status: 'confirmed', 
                payment_confirmed_at: new Date().toISOString(),
                updated_at: new Date().toISOString() 
              }
            : order
        ))
        
        toast.success('¡Pago confirmado exitosamente! ✅')
        setShowConfirmPaymentModal(false)
        setOrderToConfirm(null)
        
        // Actualizar la lista de órdenes
        fetchOrders()
      } else {
        toast.error(result.message || 'Error al confirmar pago')
      }
    } catch (error) {
      toast.error('Error de conexión al confirmar pago')
    } finally {
      setConfirmingPayment(false)
    }
  }

  const handleViewOrder = async (orderId: string) => {
    try {
      const result = await adminApiService.getOrder(orderId)
      
      if (result.success) {
        setSelectedOrder(result.data)
      } else {
        // Use order from list if API fails
        const order = orders.find(o => o.id === orderId)
        if (order) setSelectedOrder(order)
      }
      setShowOrderModal(true)
    } catch (error) {
      toast.error('Error al cargar detalles del pedido')
    }
  }

  const openConfirmPaymentModal = (order: Order) => {
    setOrderToConfirm(order)
    setShowConfirmPaymentModal(true)
  }

  const filteredOrders = orders.filter(order => {
    const matchesSearch = 
      order.usuario_celular.includes(searchTerm) ||
      (order.usuario_nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.id.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = !statusFilter || order.estado === statusFilter
    const matchesPaymentStatus = !paymentStatusFilter || order.payment_status === paymentStatusFilter
    
    return matchesSearch && matchesStatus && matchesPaymentStatus
  })

  // Contadores para las tabs
  const paymentStatusCounts = {
    all: orders.length,
    pending: orders.filter(o => o.payment_status === 'pending').length,
    confirmed: orders.filter(o => o.payment_status === 'confirmed').length,
    failed: orders.filter(o => o.payment_status === 'failed').length
  }

  return (
    <AdminLayout currentPath="/admin/orders">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Gestión de Pedidos</h1>
          <p className="text-slate-400">
            Administra y controla el estado de los pedidos y pagos de los clientes
          </p>
        </div>

        {/* Payment Status Tabs */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
          <div className="flex items-center space-x-2 mb-4">
            <CreditCard className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-semibold text-white">Estado de Pago</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button
              onClick={() => setPaymentStatusFilter('')}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentStatusFilter === ''
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <Shield className="w-5 h-5 text-slate-400" />
                <span className={`text-2xl font-bold ${paymentStatusFilter === '' ? 'text-blue-400' : 'text-white'}`}>
                  {paymentStatusCounts.all}
                </span>
              </div>
              <p className="text-sm text-slate-400">Todas las órdenes</p>
            </button>

            <button
              onClick={() => setPaymentStatusFilter('pending')}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentStatusFilter === 'pending'
                  ? 'border-orange-500 bg-orange-500/10'
                  : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <HelpCircle className="w-5 h-5 text-orange-400" />
                <span className={`text-2xl font-bold ${paymentStatusFilter === 'pending' ? 'text-orange-400' : 'text-white'}`}>
                  {paymentStatusCounts.pending}
                </span>
              </div>
              <p className="text-sm text-slate-400">Pago Pendiente</p>
            </button>

            <button
              onClick={() => setPaymentStatusFilter('confirmed')}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentStatusFilter === 'confirmed'
                  ? 'border-green-500 bg-green-500/10'
                  : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <CheckCircle2 className="w-5 h-5 text-green-400" />
                <span className={`text-2xl font-bold ${paymentStatusFilter === 'confirmed' ? 'text-green-400' : 'text-white'}`}>
                  {paymentStatusCounts.confirmed}
                </span>
              </div>
              <p className="text-sm text-slate-400">Pago Confirmado</p>
            </button>

            <button
              onClick={() => setPaymentStatusFilter('failed')}
              className={`p-4 rounded-xl border-2 transition-all ${
                paymentStatusFilter === 'failed'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-slate-600 bg-slate-900/50 hover:border-slate-500'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <XOctagon className="w-5 h-5 text-red-400" />
                <span className={`text-2xl font-bold ${paymentStatusFilter === 'failed' ? 'text-red-400' : 'text-white'}`}>
                  {paymentStatusCounts.failed}
                </span>
              </div>
              <p className="text-sm text-slate-400">Pago Fallido</p>
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar por celular, nombre o ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div className="relative lg:w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">Todos los estados</option>
                <option value="pendiente">Pendientes</option>
                <option value="pagado">Pagados</option>
                <option value="entregado">Entregados</option>
                <option value="cancelado">Cancelados</option>
              </select>
            </div>
            <button
              onClick={fetchOrders}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 lg:w-auto w-full"
            >
              Actualizar
            </button>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50 border-b border-slate-600">
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Pedido</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Cliente</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Servicio</th>
                  <th className="text-right py-4 px-6 text-slate-300 font-medium">Total</th>
                  <th className="text-center py-4 px-6 text-slate-300 font-medium">Estado Pago</th>
                  <th className="text-center py-4 px-6 text-slate-300 font-medium">Estado</th>
                  <th className="text-center py-4 px-6 text-slate-300 font-medium">Fecha</th>
                  <th className="text-center py-4 px-6 text-slate-300 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order, index) => {
                  const status = statusConfig[order.estado]
                  const StatusIcon = status.icon
                  const paymentStatus = order.payment_status ? paymentStatusConfig[order.payment_status] : null
                  const PaymentStatusIcon = paymentStatus?.icon
                  
                  return (
                    <motion.tr
                      key={order.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
                    >
                      <td className="py-4 px-6">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg">
                            <ShoppingBag className="w-5 h-5 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-white font-medium">#{order.id}</h3>
                            <p className="text-slate-400 text-sm">
                              {order.plan_duracion_meses} {order.plan_duracion_meses === 1 ? 'mes' : 'meses'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <div className="flex items-center space-x-2 text-white">
                            <Phone className="w-4 h-4" />
                            <span>{order.usuario_celular}</span>
                          </div>
                          {order.usuario_nombre && (
                            <p className="text-slate-400 text-sm mt-1">{order.usuario_nombre}</p>
                          )}
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div>
                          <span className="text-white font-medium">{order.servicio_nombre}</span>
                          <p className="text-slate-400 text-sm">{order.plan_nombre}</p>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end space-x-1 text-green-400 font-medium">
                          <DollarSign className="w-4 h-4" />
                          <span>{order.total.toLocaleString('es-CL')}</span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        {paymentStatus && PaymentStatusIcon && (
                          <div className="flex items-center justify-center">
                            <div 
                              className={`flex items-center space-x-2 px-3 py-1 rounded-full border ${paymentStatus.bgColor} ${paymentStatus.borderColor}`}
                              title={paymentStatus.tooltip}
                            >
                              <PaymentStatusIcon className={`w-4 h-4 ${paymentStatus.color}`} />
                              <span className={`text-sm font-medium ${paymentStatus.color}`}>
                                {paymentStatus.label}
                              </span>
                            </div>
                          </div>
                        )}
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center">
                          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${status.bgColor}`}>
                            <StatusIcon className={`w-4 h-4 ${status.color}`} />
                            <span className={`text-sm font-medium ${status.color}`}>
                              {status.label}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center space-x-1 text-slate-300">
                          <Calendar className="w-4 h-4" />
                          <span className="text-sm">
                            {new Date(order.created_at).toLocaleDateString('es-ES')}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="flex items-center justify-center space-x-2">
                          <button
                            onClick={() => handleViewOrder(order.id)}
                            className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                            title="Ver detalles"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          
                          {/* Botón Confirmar Pago - Solo visible si payment_status es pending */}
                          {order.payment_status === 'pending' && (
                            <button
                              onClick={() => openConfirmPaymentModal(order)}
                              className="px-3 py-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-xs rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center space-x-1"
                              title="Confirmar pago manualmente"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Confirmar</span>
                            </button>
                          )}
                          
                          <select
                            value={order.estado}
                            onChange={(e) => handleStatusUpdate(order.id, e.target.value)}
                            className="bg-slate-700 text-white text-xs px-2 py-1 rounded border border-slate-600 focus:outline-none focus:border-blue-500"
                            title="Cambiar estado de la orden"
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="pagado">Pagado</option>
                            <option value="entregado">Entregado</option>
                            <option value="cancelado">Cancelado</option>
                          </select>
                        </div>
                      </td>
                    </motion.tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredOrders.length === 0 && !loading && (
          <div className="text-center py-12">
            <ShoppingBag className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              {searchTerm || statusFilter || paymentStatusFilter ? 'No se encontraron pedidos' : 'No hay pedidos registrados'}
            </h3>
            <p className="text-slate-500">
              {searchTerm || statusFilter || paymentStatusFilter
                ? 'Intenta con otros filtros de búsqueda'
                : 'Los pedidos de los clientes aparecerán aquí'
              }
            </p>
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Cargando pedidos...</p>
          </div>
        )}
      </div>

      {/* Order Details Modal */}
      {showOrderModal && selectedOrder && (
        <OrderDetailsModal
          order={selectedOrder}
          onClose={() => {
            setShowOrderModal(false)
            setSelectedOrder(null)
          }}
          onStatusUpdate={(orderId, newStatus) => {
            handleStatusUpdate(orderId, newStatus)
            setSelectedOrder({ ...selectedOrder, estado: newStatus as any })
          }}
          onConfirmPayment={(order) => {
            setShowOrderModal(false)
            openConfirmPaymentModal(order)
          }}
        />
      )}

      {/* Confirm Payment Modal */}
      {showConfirmPaymentModal && orderToConfirm && (
        <ConfirmPaymentModal
          order={orderToConfirm}
          onConfirm={handleConfirmPayment}
          onClose={() => {
            setShowConfirmPaymentModal(false)
            setOrderToConfirm(null)
          }}
          isConfirming={confirmingPayment}
        />
      )}
    </AdminLayout>
  )
}

interface OrderDetailsModalProps {
  order: Order
  onClose: () => void
  onStatusUpdate: (orderId: string, status: string) => void
  onConfirmPayment: (order: Order) => void
}

function OrderDetailsModal({ order, onClose, onStatusUpdate, onConfirmPayment }: OrderDetailsModalProps) {
  const [newStatus, setNewStatus] = useState(order.estado)
  const status = statusConfig[order.estado]
  const StatusIcon = status.icon
  const paymentStatus = order.payment_status ? paymentStatusConfig[order.payment_status] : null
  const PaymentStatusIcon = paymentStatus?.icon

  const handleStatusChange = () => {
    if (newStatus !== order.estado) {
      onStatusUpdate(order.id, newStatus)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl p-6 border border-slate-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-xl">
              <ShoppingBag className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">Pedido #{order.id}</h3>
              <div className="flex items-center space-x-2 mt-1">
                <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${status.bgColor} inline-flex`}>
                  <StatusIcon className={`w-4 h-4 ${status.color}`} />
                  <span className={`text-sm font-medium ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white transition-colors"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Order Details */}
        <div className="space-y-6">
          {/* Payment Status Section */}
          {paymentStatus && PaymentStatusIcon && (
            <div className="bg-slate-900/50 rounded-xl p-4 border-2 border-slate-700">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-5 h-5 text-blue-400" />
                  <h4 className="text-lg font-medium text-white">Estado de Pago</h4>
                </div>
                {order.payment_status === 'pending' && (
                  <button
                    onClick={() => onConfirmPayment(order)}
                    className="px-4 py-2 bg-gradient-to-r from-green-500 to-emerald-600 text-white text-sm rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium flex items-center space-x-2"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirmar Pago</span>
                  </button>
                )}
              </div>
              
              <div className={`flex items-center space-x-3 p-4 rounded-lg border-2 ${paymentStatus.bgColor} ${paymentStatus.borderColor}`}>
                <PaymentStatusIcon className={`w-8 h-8 ${paymentStatus.color}`} />
                <div className="flex-1">
                  <p className={`font-semibold ${paymentStatus.color}`}>{paymentStatus.label}</p>
                  <p className="text-sm text-slate-400">{paymentStatus.tooltip}</p>
                </div>
              </div>

              {order.payment_confirmed_at && (
                <div className="mt-3 p-3 bg-slate-800 rounded-lg">
                  <div className="grid grid-cols-2 gap-3 text-sm">
                    <div>
                      <label className="text-slate-400">Confirmado el:</label>
                      <p className="text-white font-medium">
                        {new Date(order.payment_confirmed_at).toLocaleString('es-ES', {
                          dateStyle: 'medium',
                          timeStyle: 'short'
                        })}
                      </p>
                    </div>
                    {order.admin_confirmador && (
                      <div>
                        <label className="text-slate-400">Confirmado por:</label>
                        <p className="text-white font-medium">{order.admin_confirmador.username}</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Customer Info */}
          <div className="bg-slate-900/50 rounded-xl p-4">
            <h4 className="text-lg font-medium text-white mb-3">Información del Cliente</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Teléfono</label>
                <p className="text-white">{order.usuario_celular}</p>
              </div>
              {order.usuario_nombre && (
                <div>
                  <label className="text-sm text-slate-400">Nombre</label>
                  <p className="text-white">{order.usuario_nombre}</p>
                </div>
              )}
              {order.usuario_email && (
                <div>
                  <label className="text-sm text-slate-400">Email</label>
                  <p className="text-white">{order.usuario_email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Service Info */}
          <div className="bg-slate-900/50 rounded-xl p-4">
            <h4 className="text-lg font-medium text-white mb-3">Detalles del Servicio</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Servicio</label>
                <p className="text-white">{order.servicio_nombre}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Plan</label>
                <p className="text-white">{order.plan_nombre}</p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Duración</label>
                <p className="text-white">
                  {order.plan_duracion_meses} {order.plan_duracion_meses === 1 ? 'mes' : 'meses'}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Total</label>
                <p className="text-green-400 font-medium">
                  ${order.total.toLocaleString('es-CL')}
                </p>
              </div>
            </div>
          </div>

          {/* Dates */}
          <div className="bg-slate-900/50 rounded-xl p-4">
            <h4 className="text-lg font-medium text-white mb-3">Fechas</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-slate-400">Fecha de Pedido</label>
                <p className="text-white">
                  {new Date(order.created_at).toLocaleString('es-ES')}
                </p>
              </div>
              <div>
                <label className="text-sm text-slate-400">Última Actualización</label>
                <p className="text-white">
                  {new Date(order.updated_at).toLocaleString('es-ES')}
                </p>
              </div>
            </div>
          </div>

          {/* Payment Proof */}
          {order.comprobante_url && (
            <div className="bg-slate-900/50 rounded-xl p-4">
              <h4 className="text-lg font-medium text-white mb-3">Comprobante de Pago</h4>
              <div className="bg-slate-800 rounded-lg p-4 text-center">
                <p className="text-slate-400 mb-2">Archivo adjunto</p>
                <a
                  href={order.comprobante_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 underline"
                >
                  Ver comprobante
                </a>
              </div>
            </div>
          )}

          {/* Status Update */}
          <div className="bg-slate-900/50 rounded-xl p-4">
            <h4 className="text-lg font-medium text-white mb-3">Actualizar Estado de Orden</h4>
            <div className="flex items-center space-x-4">
              <select
                value={newStatus}
                onChange={(e) => setNewStatus(e.target.value as any)}
                className="flex-1 px-3 py-2 bg-slate-800 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              >
                <option value="pendiente">Pendiente</option>
                <option value="pagado">Pagado</option>
                <option value="entregado">Entregado</option>
                <option value="cancelado">Cancelado</option>
              </select>
              {newStatus !== order.estado && (
                <button
                  onClick={handleStatusChange}
                  className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
                >
                  Actualizar
                </button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

interface ConfirmPaymentModalProps {
  order: Order
  onConfirm: () => void
  onClose: () => void
  isConfirming: boolean
}

function ConfirmPaymentModal({ order, onConfirm, onClose, isConfirming }: ConfirmPaymentModalProps) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl p-8 border-2 border-green-500/30 max-w-md w-full"
      >
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-gradient-to-r from-green-500/20 to-emerald-600/20 rounded-full">
            <CheckCircle2 className="w-12 h-12 text-green-400" />
          </div>
        </div>

        {/* Content */}
        <div className="text-center mb-6">
          <h3 className="text-2xl font-bold text-white mb-2">
            Confirmar Pago
          </h3>
          <p className="text-slate-400 mb-4">
            ¿Estás seguro de que deseas confirmar el pago para esta orden?
          </p>
          
          {/* Order Info */}
          <div className="bg-slate-900/50 rounded-xl p-4 text-left space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-400">Orden:</span>
              <span className="text-white font-medium">#{order.id}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Cliente:</span>
              <span className="text-white font-medium">{order.usuario_celular}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Servicio:</span>
              <span className="text-white font-medium">{order.servicio_nombre}</span>
            </div>
            <div className="flex justify-between border-t border-slate-700 pt-2 mt-2">
              <span className="text-slate-400">Total:</span>
              <span className="text-green-400 font-bold">${order.total.toLocaleString('es-CL')}</span>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-400 text-sm">
              ⚠️ Esta acción marcará el pago como confirmado y no se puede deshacer.
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex space-x-3">
          <button
            onClick={onClose}
            disabled={isConfirming}
            className="flex-1 px-4 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={isConfirming}
            className="flex-1 px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-200 font-medium disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
          >
            {isConfirming ? (
              <>
                <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
                <span>Confirmando...</span>
              </>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Confirmar Pago</span>
              </>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  )
}

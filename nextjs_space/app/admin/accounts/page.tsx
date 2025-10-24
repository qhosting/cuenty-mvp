
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Filter,
  Users,
  Eye,
  EyeOff,
  Copy,
  CheckCircle,
  XCircle
} from 'lucide-react'
import { AdminLayout } from '@/components/admin/admin-layout'
import { adminApiService } from '@/lib/admin-auth'
import { toast } from 'react-hot-toast'

interface Account {
  id: string
  servicio_id: string
  servicio_nombre?: string
  email: string
  password: string
  pin?: string | null
  perfil: string
  slots_totales: number
  slots_usados: number
  activo: boolean
  created_at: string
}

interface Service {
  id: string
  nombre: string
}

export default function AdminAccountsPage() {
  const [accounts, setAccounts] = useState<Account[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [serviceFilter, setServiceFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingAccount, setEditingAccount] = useState<Account | null>(null)
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null)
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({})
  const [showPins, setShowPins] = useState<{ [key: string]: boolean }>({})

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const [accountsResult, servicesResult] = await Promise.all([
        adminApiService.getAccounts(),
        adminApiService.getServices()
      ])
      
      if (accountsResult.success) {
        setAccounts(accountsResult.data)
      } else {
        // Mock data for demo
        setAccounts([
          {
            id: '1',
            servicio_id: '1',
            servicio_nombre: 'Netflix',
            email: 'netflix.premium@example.com',
            password: 'NetflixPass123!',
            perfil: 'Perfil 1',
            slots_totales: 4,
            slots_usados: 2,
            activo: true,
            created_at: '2024-01-15T10:30:00Z'
          },
          {
            id: '2',
            servicio_id: '1',
            servicio_nombre: 'Netflix',
            email: 'netflix.family@example.com',
            password: 'FamilyNet456!',
            perfil: 'Perfil 2',
            slots_totales: 4,
            slots_usados: 4,
            activo: true,
            created_at: '2024-01-14T09:15:00Z'
          },
          {
            id: '3',
            servicio_id: '2',
            servicio_nombre: 'Disney+',
            email: 'disney.premium@example.com',
            password: 'DisneyMagic789!',
            perfil: 'Perfil Principal',
            slots_totales: 7,
            slots_usados: 3,
            activo: true,
            created_at: '2024-01-13T14:45:00Z'
          },
          {
            id: '4',
            servicio_id: '3',
            servicio_nombre: 'HBO Max',
            email: 'hbo.max@example.com',
            password: 'HBO2024Pass!',
            perfil: 'Usuario 1',
            slots_totales: 3,
            slots_usados: 1,
            activo: false,
            created_at: '2024-01-12T16:20:00Z'
          }
        ])
      }
      
      if (servicesResult.success) {
        setServices(servicesResult.data)
      } else {
        setServices([
          { id: '1', nombre: 'Netflix' },
          { id: '2', nombre: 'Disney+' },
          { id: '3', nombre: 'HBO Max' }
        ])
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const result = await adminApiService.deleteAccount(id)
      
      if (result.success) {
        setAccounts(accounts.filter(a => a.id !== id))
        toast.success('Cuenta eliminada correctamente')
      } else {
        toast.error(result.message || 'Error al eliminar cuenta')
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setDeleteConfirm(null)
    }
  }

  const togglePasswordVisibility = (accountId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }))
  }

  const togglePinVisibility = (accountId: string) => {
    setShowPins(prev => ({
      ...prev,
      [accountId]: !prev[accountId]
    }))
  }

  const copyToClipboard = (text: string, type: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`${type} copiado al portapapeles`)
  }

  const filteredAccounts = accounts.filter(account => {
    const matchesSearch = 
      account.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (account.servicio_nombre || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.perfil.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesService = !serviceFilter || account.servicio_id === serviceFilter
    const matchesStatus = !statusFilter || 
      (statusFilter === 'activo' && account.activo) ||
      (statusFilter === 'inactivo' && !account.activo) ||
      (statusFilter === 'disponible' && account.slots_usados < account.slots_totales) ||
      (statusFilter === 'lleno' && account.slots_usados >= account.slots_totales)
    
    return matchesSearch && matchesService && matchesStatus
  })

  return (
    <AdminLayout currentPath="/admin/accounts">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Gestión de Cuentas</h1>
            <p className="text-slate-400">
              Administra las cuentas de streaming disponibles para los clientes
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              setEditingAccount(null)
              setShowModal(true)
            }}
            className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200 flex items-center space-x-2"
          >
            <Plus className="w-5 h-5" />
            <span>Nueva Cuenta</span>
          </motion.button>
        </div>

        {/* Filters */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl p-6 border border-slate-700">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Buscar cuentas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              />
            </div>
            <div className="relative lg:w-48">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
              <select
                value={serviceFilter}
                onChange={(e) => setServiceFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">Todos los servicios</option>
                {services.map(service => (
                  <option key={service.id} value={service.id}>
                    {service.nombre}
                  </option>
                ))}
              </select>
            </div>
            <div className="relative lg:w-48">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-4 py-3 bg-slate-900/50 border border-slate-600 rounded-xl text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-colors"
              >
                <option value="">Todos los estados</option>
                <option value="activo">Activas</option>
                <option value="inactivo">Inactivas</option>
                <option value="disponible">Con slots</option>
                <option value="lleno">Sin slots</option>
              </select>
            </div>
          </div>
        </div>

        {/* Accounts Table */}
        <div className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-slate-700/50 border-b border-slate-600">
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Cuenta</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Servicio</th>
                  <th className="text-left py-4 px-6 text-slate-300 font-medium">Credenciales</th>
                  <th className="text-center py-4 px-6 text-slate-300 font-medium">Slots</th>
                  <th className="text-center py-4 px-6 text-slate-300 font-medium">Estado</th>
                  <th className="text-center py-4 px-6 text-slate-300 font-medium">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredAccounts.map((account, index) => (
                  <motion.tr
                    key={account.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className="border-b border-slate-700 hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="py-4 px-6">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg">
                          <Users className="w-5 h-5 text-blue-400" />
                        </div>
                        <div>
                          <h3 className="text-white font-medium">{account.perfil}</h3>
                          <p className="text-slate-400 text-sm">ID: {account.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-white">{account.servicio_nombre || 'N/A'}</span>
                    </td>
                    <td className="py-4 px-6">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 text-sm w-12">Email:</span>
                          <span className="text-white text-sm font-mono">{account.email}</span>
                          <button
                            onClick={() => copyToClipboard(account.email, 'Email')}
                            className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                          >
                            <Copy className="w-3 h-3" />
                          </button>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span className="text-slate-400 text-sm w-12">Pass:</span>
                          <span className="text-white text-sm font-mono">
                            {showPasswords[account.id] ? account.password : '••••••••'}
                          </span>
                          <button
                            onClick={() => togglePasswordVisibility(account.id)}
                            className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                          >
                            {showPasswords[account.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>
                          {showPasswords[account.id] && (
                            <button
                              onClick={() => copyToClipboard(account.password, 'Contraseña')}
                              className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                            >
                              <Copy className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                        {account.pin && (
                          <div className="flex items-center space-x-2">
                            <span className="text-slate-400 text-sm w-12">PIN:</span>
                            <span className="text-white text-sm font-mono">
                              {showPins[account.id] ? account.pin : '••••'}
                            </span>
                            <button
                              onClick={() => togglePinVisibility(account.id)}
                              className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                            >
                              {showPins[account.id] ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                            </button>
                            {showPins[account.id] && (
                              <button
                                onClick={() => copyToClipboard(account.pin || '', 'PIN')}
                                className="p-1 text-slate-400 hover:text-blue-400 transition-colors"
                              >
                                <Copy className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center space-x-2">
                        <span className="text-white font-medium">{account.slots_usados}</span>
                        <span className="text-slate-400">/</span>
                        <span className="text-slate-300">{account.slots_totales}</span>
                        <div className={`w-2 h-2 rounded-full ${
                          account.slots_usados >= account.slots_totales ? 'bg-red-400' : 'bg-green-400'
                        }`} />
                      </div>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <div className="flex items-center justify-center">
                        {account.activo ? (
                          <div className="flex items-center space-x-2 text-green-400">
                            <CheckCircle className="w-4 h-4" />
                            <span className="text-sm">Activa</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-2 text-red-400">
                            <XCircle className="w-4 h-4" />
                            <span className="text-sm">Inactiva</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="flex items-center justify-center space-x-2">
                        <button
                          onClick={() => {
                            setEditingAccount(account)
                            setShowModal(true)
                          }}
                          className="p-2 text-slate-400 hover:text-blue-400 transition-colors"
                          title="Editar"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(account.id)}
                          className="p-2 text-slate-400 hover:text-red-400 transition-colors"
                          title="Eliminar"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Empty State */}
        {filteredAccounts.length === 0 && !loading && (
          <div className="text-center py-12">
            <Users className="w-16 h-16 text-slate-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-slate-400 mb-2">
              {searchTerm || serviceFilter || statusFilter ? 'No se encontraron cuentas' : 'No hay cuentas registradas'}
            </h3>
            <p className="text-slate-500 mb-6">
              {searchTerm || serviceFilter || statusFilter
                ? 'Intenta con otros filtros de búsqueda'
                : 'Comienza agregando tu primera cuenta de streaming'
              }
            </p>
            {!searchTerm && !serviceFilter && !statusFilter && (
              <button
                onClick={() => {
                  setEditingAccount(null)
                  setShowModal(true)
                }}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-xl font-medium hover:from-blue-600 hover:to-purple-700 transition-all duration-200"
              >
                Crear Primera Cuenta
              </button>
            )}
          </div>
        )}

        {/* Loading State */}
        {loading && (
          <div className="text-center py-12">
            <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-slate-400">Cargando cuentas...</p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-slate-800 rounded-2xl p-6 border border-slate-700 max-w-md w-full"
          >
            <h3 className="text-xl font-semibold text-white mb-4">Confirmar Eliminación</h3>
            <p className="text-slate-400 mb-6">
              ¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(deleteConfirm)}
                className="flex-1 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
              >
                Eliminar
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Account Modal (Create/Edit) */}
      {showModal && (
        <AccountModal
          account={editingAccount}
          services={services}
          onClose={() => setShowModal(false)}
          onSuccess={fetchData}
        />
      )}
    </AdminLayout>
  )
}

interface AccountModalProps {
  account: Account | null
  services: Service[]
  onClose: () => void
  onSuccess: () => void
}

function AccountModal({ account, services, onClose, onSuccess }: AccountModalProps) {
  const [formData, setFormData] = useState({
    servicio_id: account?.servicio_id || '',
    email: account?.email || '',
    password: '', // No cargar password existente para evitar doble encriptación
    pin: account?.pin || '', // No cargar PIN existente para evitar doble encriptación
    perfil: account?.perfil || '',
    slots_totales: account?.slots_totales || 1,
    slots_usados: account?.slots_usados || 0,
    activo: account?.activo ?? true
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Para crear nueva cuenta, todos los campos son requeridos
    if (!account && (!formData.servicio_id || !formData.email || !formData.password || !formData.perfil)) {
      toast.error('Por favor completa todos los campos requeridos')
      return
    }
    
    // Para editar, solo email, perfil y servicio son requeridos
    if (account && (!formData.servicio_id || !formData.email || !formData.perfil)) {
      toast.error('Por favor completa los campos requeridos (servicio, email y perfil)')
      return
    }

    if (formData.slots_usados > formData.slots_totales) {
      toast.error('Los slots usados no pueden ser mayores a los slots totales')
      return
    }

    setLoading(true)

    try {
      // Preparar datos a enviar
      let dataToSend: any = { ...formData }
      
      // Si estamos editando y el password está vacío, no enviarlo
      if (account && !formData.password) {
        const { password, ...rest } = dataToSend
        dataToSend = rest
      }
      
      // Si estamos editando y el PIN está vacío, no enviarlo
      if (account && !formData.pin) {
        const { pin, ...rest } = dataToSend
        dataToSend = rest
      }
      
      const result = account
        ? await adminApiService.updateAccount(account.id, dataToSend)
        : await adminApiService.createAccount(dataToSend)
      
      if (result.success) {
        toast.success(`Cuenta ${account ? 'actualizada' : 'creada'} correctamente`)
        onSuccess()
        onClose()
      } else {
        toast.error(result.message || `Error al ${account ? 'actualizar' : 'crear'} cuenta`)
      }
    } catch (error) {
      toast.error('Error de conexión')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-slate-800 rounded-2xl p-6 border border-slate-700 max-w-lg w-full max-h-[90vh] overflow-y-auto"
      >
        <h3 className="text-xl font-semibold text-white mb-6">
          {account ? 'Editar Cuenta' : 'Nueva Cuenta'}
        </h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Servicio *
            </label>
            <select
              value={formData.servicio_id}
              onChange={(e) => setFormData({ ...formData, servicio_id: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              required
            >
              <option value="">Seleccionar servicio</option>
              {services.map(service => (
                <option key={service.id} value={service.id}>
                  {service.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Email *
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                placeholder="cuenta@servicio.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Contraseña {account ? '(Opcional)' : '*'}
              </label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
                placeholder={account ? "Dejar en blanco para no cambiar" : "••••••••"}
                required={!account}
              />
              {account && (
                <p className="mt-1 text-xs text-slate-400">
                  Deja este campo vacío si no deseas cambiar la contraseña
                </p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              PIN/NIP (Opcional)
            </label>
            <input
              type="text"
              value={formData.pin}
              onChange={(e) => setFormData({ ...formData, pin: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder={account ? "Dejar en blanco para no cambiar" : "Ejemplo: 1234"}
              maxLength={10}
            />
            <p className="mt-1 text-xs text-slate-400">
              {account 
                ? 'Deja este campo vacío si no deseas cambiar el PIN' 
                : 'Solo para servicios que requieren PIN (máximo 10 caracteres)'
              }
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              Nombre del Perfil *
            </label>
            <input
              type="text"
              value={formData.perfil}
              onChange={(e) => setFormData({ ...formData, perfil: e.target.value })}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-500"
              placeholder="Ej: Perfil 1"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Slots Totales *
              </label>
              <input
                type="number"
                min="1"
                max="10"
                value={formData.slots_totales}
                onChange={(e) => setFormData({ ...formData, slots_totales: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-2">
                Slots Usados
              </label>
              <input
                type="number"
                min="0"
                max={formData.slots_totales}
                value={formData.slots_usados}
                onChange={(e) => setFormData({ ...formData, slots_usados: parseInt(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-900 border border-slate-600 rounded-lg text-white focus:outline-none focus:border-blue-500"
              />
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="activo"
              checked={formData.activo}
              onChange={(e) => setFormData({ ...formData, activo: e.target.checked })}
              className="w-4 h-4 text-blue-600 bg-slate-900 border-slate-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="activo" className="text-sm font-medium text-slate-300">
              Cuenta activa
            </label>
          </div>

          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-slate-700 text-slate-300 rounded-lg hover:bg-slate-600 transition-colors"
              disabled={loading}
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors disabled:opacity-50"
              disabled={loading}
            >
              {loading ? 'Guardando...' : (account ? 'Actualizar' : 'Crear')}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  )
}

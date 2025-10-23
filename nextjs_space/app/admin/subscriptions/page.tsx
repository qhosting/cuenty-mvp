'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Edit, Trash2, RefreshCw, Eye, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';

interface Suscripcion {
  idSuscripcion: number;
  celularUsuario: string;
  idPlan: number;
  idOrden: number | null;
  estado: 'activa' | 'vencida' | 'cancelada' | 'pausada';
  fechaInicio: string;
  fechaVencimiento: string;
  fechaCancelacion: string | null;
  renovacionAutomatica: boolean;
  notasAdmin: string | null;
  fechaCreacion: string;
  fechaActualizacion: string;
  notificaciones?: any[];
}

interface Plan {
  idPlan: number;
  nombrePlan: string;
  duracionMeses: number;
  duracionDias: number | null;
}

export default function SubscriptionsPage() {
  const [suscripciones, setSuscripciones] = useState<Suscripcion[]>([]);
  const [planes, setPlanes] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterEstado, setFilterEstado] = useState<string>('');
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedSuscripcion, setSelectedSuscripcion] = useState<Suscripcion | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [estadisticas, setEstadisticas] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    celularUsuario: '',
    idPlan: '',
    duracionMeses: '',
    duracionDias: '',
    renovacionAutomatica: false,
    notasAdmin: ''
  });

  // Fetch subscriptions
  const fetchSuscripciones = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('adminToken');
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: '10',
        ...(filterEstado && { estado: filterEstado }),
        ...(searchTerm && { celularUsuario: searchTerm })
      });

      const response = await fetch(`/api/suscripciones?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSuscripciones(data.data || []);
        setTotalPages(data.pagination?.totalPages || 1);
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch plans
  const fetchPlanes = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/planes?activo=true', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setPlanes(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching plans:', error);
    }
  };

  // Fetch statistics
  const fetchEstadisticas = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/suscripciones/estadisticas', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEstadisticas(data.data);
      }
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  useEffect(() => {
    fetchSuscripciones();
    fetchPlanes();
    fetchEstadisticas();
  }, [currentPage, filterEstado, searchTerm]);

  // Create subscription
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch('/api/suscripciones', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          ...formData,
          idPlan: parseInt(formData.idPlan),
          duracionMeses: formData.duracionMeses ? parseInt(formData.duracionMeses) : undefined,
          duracionDias: formData.duracionDias ? parseInt(formData.duracionDias) : undefined
        })
      });

      if (response.ok) {
        setShowModal(false);
        resetForm();
        fetchSuscripciones();
        fetchEstadisticas();
        alert('Suscripción creada exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error creating subscription:', error);
      alert('Error al crear suscripción');
    }
  };

  // Update subscription
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSuscripcion) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/suscripciones/${selectedSuscripcion.idSuscripcion}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          renovacionAutomatica: formData.renovacionAutomatica,
          notasAdmin: formData.notasAdmin
        })
      });

      if (response.ok) {
        setShowModal(false);
        setSelectedSuscripcion(null);
        resetForm();
        fetchSuscripciones();
        alert('Suscripción actualizada exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error updating subscription:', error);
      alert('Error al actualizar suscripción');
    }
  };

  // Delete subscription
  const handleDelete = async (id: number) => {
    if (!confirm('¿Estás seguro de eliminar esta suscripción?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/suscripciones/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchSuscripciones();
        fetchEstadisticas();
        alert('Suscripción eliminada exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error deleting subscription:', error);
      alert('Error al eliminar suscripción');
    }
  };

  // Renew subscription
  const handleRenew = async (id: number) => {
    if (!confirm('¿Deseas renovar esta suscripción?')) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/suscripciones/${id}/renovar`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        fetchSuscripciones();
        fetchEstadisticas();
        alert('Suscripción renovada exitosamente');
      } else {
        const error = await response.json();
        alert(`Error: ${error.message}`);
      }
    } catch (error) {
      console.error('Error renewing subscription:', error);
      alert('Error al renovar suscripción');
    }
  };

  // View details
  const handleViewDetails = async (id: number) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`/api/suscripciones/${id}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSelectedSuscripcion(data.data);
        setShowDetailModal(true);
      }
    } catch (error) {
      console.error('Error fetching subscription details:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      celularUsuario: '',
      idPlan: '',
      duracionMeses: '',
      duracionDias: '',
      renovacionAutomatica: false,
      notasAdmin: ''
    });
  };

  const openEditModal = (suscripcion: Suscripcion) => {
    setSelectedSuscripcion(suscripcion);
    setFormData({
      celularUsuario: suscripcion.celularUsuario,
      idPlan: suscripcion.idPlan.toString(),
      duracionMeses: '',
      duracionDias: '',
      renovacionAutomatica: suscripcion.renovacionAutomatica,
      notasAdmin: suscripcion.notasAdmin || ''
    });
    setShowModal(true);
  };

  const getEstadoBadge = (estado: string) => {
    const badges: Record<string, { color: string; icon: any; text: string }> = {
      activa: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Activa' },
      vencida: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Vencida' },
      cancelada: { color: 'bg-gray-100 text-gray-800', icon: XCircle, text: 'Cancelada' },
      pausada: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, text: 'Pausada' }
    };

    const badge = badges[estado] || badges.activa;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon size={12} />
        {badge.text}
      </span>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDaysRemaining = (fechaVencimiento: string) => {
    const today = new Date();
    const vencimiento = new Date(fechaVencimiento);
    const diffTime = vencimiento.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Gestión de Suscripciones</h1>
          <p className="text-gray-600">Administra todas las suscripciones activas y vencidas</p>
        </div>

        {/* Statistics Cards */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Activas</p>
                  <p className="text-2xl font-bold text-green-600">{estadisticas.totalActivas}</p>
                </div>
                <CheckCircle className="text-green-600" size={32} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Vencidas</p>
                  <p className="text-2xl font-bold text-red-600">{estadisticas.totalVencidas}</p>
                </div>
                <XCircle className="text-red-600" size={32} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Próximas a Vencer</p>
                  <p className="text-2xl font-bold text-yellow-600">{estadisticas.proximasVencer}</p>
                </div>
                <AlertCircle className="text-yellow-600" size={32} />
              </div>
            </div>
            <div className="bg-white p-4 rounded-lg shadow">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Renovación Auto</p>
                  <p className="text-2xl font-bold text-blue-600">{estadisticas.conRenovacionAutomatica}</p>
                </div>
                <RefreshCw className="text-blue-600" size={32} />
              </div>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="bg-white p-4 rounded-lg shadow mb-6">
          <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
            <div className="flex-1 flex gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  placeholder="Buscar por celular..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <select
                value={filterEstado}
                onChange={(e) => setFilterEstado(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Todos los estados</option>
                <option value="activa">Activa</option>
                <option value="vencida">Vencida</option>
                <option value="cancelada">Cancelada</option>
                <option value="pausada">Pausada</option>
              </select>
            </div>
            <button
              onClick={() => {
                resetForm();
                setSelectedSuscripcion(null);
                setShowModal(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Plus size={20} />
              Nueva Suscripción
            </button>
          </div>
        </div>

        {/* Subscriptions Table */}
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Cargando suscripciones...</p>
            </div>
          ) : suscripciones.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <AlertCircle size={48} className="mx-auto mb-4 text-gray-400" />
              <p>No se encontraron suscripciones</p>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Usuario</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Plan</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Inicio</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Vencimiento</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Días Restantes</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Renovación Auto</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {suscripciones.map((suscripcion) => {
                      const diasRestantes = getDaysRemaining(suscripcion.fechaVencimiento);
                      return (
                        <tr key={suscripcion.idSuscripcion} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                            {suscripcion.celularUsuario}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            Plan #{suscripcion.idPlan}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {getEstadoBadge(suscripcion.estado)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(suscripcion.fechaInicio)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(suscripcion.fechaVencimiento)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <span className={`font-medium ${
                              diasRestantes < 0 ? 'text-red-600' : 
                              diasRestantes <= 7 ? 'text-yellow-600' : 
                              'text-green-600'
                            }`}>
                              {diasRestantes < 0 ? 'Vencida' : `${diasRestantes} días`}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {suscripcion.renovacionAutomatica ? (
                              <CheckCircle className="text-green-600" size={20} />
                            ) : (
                              <XCircle className="text-gray-400" size={20} />
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleViewDetails(suscripcion.idSuscripcion)}
                                className="text-blue-600 hover:text-blue-900"
                                title="Ver detalles"
                              >
                                <Eye size={18} />
                              </button>
                              <button
                                onClick={() => openEditModal(suscripcion)}
                                className="text-yellow-600 hover:text-yellow-900"
                                title="Editar"
                              >
                                <Edit size={18} />
                              </button>
                              <button
                                onClick={() => handleRenew(suscripcion.idSuscripcion)}
                                className="text-green-600 hover:text-green-900"
                                title="Renovar"
                              >
                                <RefreshCw size={18} />
                              </button>
                              <button
                                onClick={() => handleDelete(suscripcion.idSuscripcion)}
                                className="text-red-600 hover:text-red-900"
                                title="Eliminar"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Anterior
                  </button>
                  <span className="text-sm text-gray-600">
                    Página {currentPage} de {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                  >
                    Siguiente
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">
                  {selectedSuscripcion ? 'Editar Suscripción' : 'Nueva Suscripción'}
                </h2>
                <form onSubmit={selectedSuscripcion ? handleUpdate : handleCreate}>
                  <div className="space-y-4">
                    {!selectedSuscripcion && (
                      <>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Celular Usuario *
                          </label>
                          <input
                            type="text"
                            value={formData.celularUsuario}
                            onChange={(e) => setFormData({ ...formData, celularUsuario: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          />
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Plan *
                          </label>
                          <select
                            value={formData.idPlan}
                            onChange={(e) => setFormData({ ...formData, idPlan: e.target.value })}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            required
                          >
                            <option value="">Seleccionar plan</option>
                            {planes.map((plan) => (
                              <option key={plan.idPlan} value={plan.idPlan}>
                                {plan.nombrePlan} - {plan.duracionMeses} meses
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Duración (Meses)
                            </label>
                            <input
                              type="number"
                              value={formData.duracionMeses}
                              onChange={(e) => setFormData({ ...formData, duracionMeses: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="1"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Duración (Días)
                            </label>
                            <input
                              type="number"
                              value={formData.duracionDias}
                              onChange={(e) => setFormData({ ...formData, duracionDias: e.target.value })}
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                              min="1"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="renovacionAutomatica"
                        checked={formData.renovacionAutomatica}
                        onChange={(e) => setFormData({ ...formData, renovacionAutomatica: e.target.checked })}
                        className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                      />
                      <label htmlFor="renovacionAutomatica" className="text-sm font-medium text-gray-700">
                        Renovación Automática
                      </label>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notas Admin
                      </label>
                      <textarea
                        value={formData.notasAdmin}
                        onChange={(e) => setFormData({ ...formData, notasAdmin: e.target.value })}
                        rows={3}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                    </div>
                  </div>

                  <div className="mt-6 flex gap-4 justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setShowModal(false);
                        setSelectedSuscripcion(null);
                        resetForm();
                      }}
                      className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Cancelar
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                      {selectedSuscripcion ? 'Actualizar' : 'Crear'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        {showDetailModal && selectedSuscripcion && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-4">Detalles de Suscripción</h2>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">ID Suscripción</p>
                      <p className="font-medium">{selectedSuscripcion.idSuscripcion}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Celular Usuario</p>
                      <p className="font-medium">{selectedSuscripcion.celularUsuario}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">ID Plan</p>
                      <p className="font-medium">{selectedSuscripcion.idPlan}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Estado</p>
                      <div className="mt-1">{getEstadoBadge(selectedSuscripcion.estado)}</div>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha Inicio</p>
                      <p className="font-medium">{formatDate(selectedSuscripcion.fechaInicio)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Fecha Vencimiento</p>
                      <p className="font-medium">{formatDate(selectedSuscripcion.fechaVencimiento)}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Renovación Automática</p>
                      <p className="font-medium">
                        {selectedSuscripcion.renovacionAutomatica ? 'Sí' : 'No'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Días Restantes</p>
                      <p className={`font-medium ${
                        getDaysRemaining(selectedSuscripcion.fechaVencimiento) < 0 ? 'text-red-600' : 
                        getDaysRemaining(selectedSuscripcion.fechaVencimiento) <= 7 ? 'text-yellow-600' : 
                        'text-green-600'
                      }`}>
                        {getDaysRemaining(selectedSuscripcion.fechaVencimiento) < 0 
                          ? 'Vencida' 
                          : `${getDaysRemaining(selectedSuscripcion.fechaVencimiento)} días`}
                      </p>
                    </div>
                  </div>

                  {selectedSuscripcion.notasAdmin && (
                    <div>
                      <p className="text-sm text-gray-600 mb-1">Notas Admin</p>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm">{selectedSuscripcion.notasAdmin}</p>
                      </div>
                    </div>
                  )}

                  {selectedSuscripcion.notificaciones && selectedSuscripcion.notificaciones.length > 0 && (
                    <div>
                      <p className="text-sm text-gray-600 mb-2">Notificaciones</p>
                      <div className="space-y-2">
                        {selectedSuscripcion.notificaciones.map((notif: any) => (
                          <div key={notif.idNotificacion} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start">
                              <div>
                                <p className="text-sm font-medium">{notif.tipoNotificacion}</p>
                                <p className="text-xs text-gray-600">{notif.mensaje}</p>
                              </div>
                              <span className={`text-xs px-2 py-1 rounded ${
                                notif.enviada 
                                  ? 'bg-green-100 text-green-800' 
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {notif.enviada ? 'Enviada' : 'Pendiente'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <button
                    onClick={() => {
                      setShowDetailModal(false);
                      setSelectedSuscripcion(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
                  >
                    Cerrar
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

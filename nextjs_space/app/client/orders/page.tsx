
'use client';

import { useEffect, useState } from 'react';
import { getClienteToken } from '@/lib/client-auth';
import { getOrdenes, Orden } from '@/lib/client-api';
import { CheckCircleIcon, ClockIcon, XCircleIcon } from '@heroicons/react/24/outline';

export default function ClientOrdersPage() {
  const [ordenes, setOrdenes] = useState<Orden[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedOrden, setSelectedOrden] = useState<Orden | null>(null);

  useEffect(() => {
    const fetchOrdenes = async () => {
      try {
        const token = getClienteToken();
        if (!token) return;

        const data = await getOrdenes(token);
        setOrdenes(data.ordenes);
      } catch (err: any) {
        setError(err.message || 'Error al cargar pedidos');
      } finally {
        setLoading(false);
      }
    };

    fetchOrdenes();
  }, []);

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case 'entregada':
      case 'pagada':
        return 'bg-green-500/20 text-green-400';
      case 'pendiente_pago':
      case 'pendiente':
        return 'bg-yellow-500/20 text-yellow-400';
      case 'cancelada':
        return 'bg-red-500/20 text-red-400';
      case 'en_proceso':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-gray-500/20 text-gray-400';
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

  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'Pago Confirmado';
      case 'failed':
        return 'Pago Rechazado';
      default:
        return 'Pago Pendiente';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Cargando pedidos...</p>
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

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Mis Pedidos</h1>
        <p className="text-gray-400 mt-2">
          Historial completo de tus compras
        </p>
      </div>

      {ordenes.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur rounded-lg p-12 text-center">
          <p className="text-gray-400 text-lg">No tienes pedidos aún</p>
          <a
            href="/catalogo"
            className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700"
          >
            Explorar Servicios
          </a>
        </div>
      ) : (
        <div className="space-y-4">
          {ordenes.map((orden) => (
            <div
              key={orden.idOrden}
              className="bg-gray-900/50 backdrop-blur rounded-lg p-6 border border-gray-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div>
                  <div className="flex items-center space-x-3 mb-2">
                    <h3 className="text-lg font-bold text-white">
                      Orden #{orden.idOrden}
                    </h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getEstadoColor(orden.estado)}`}>
                      {orden.estado.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-sm text-gray-400">
                    {new Date(orden.fechaCreacion).toLocaleDateString('es-ES', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-white">
                    ${parseFloat(orden.montoTotal.toString()).toFixed(2)}
                  </p>
                  <div className="flex items-center space-x-2 mt-2">
                    {getPaymentStatusIcon(orden.paymentStatus)}
                    <span className="text-sm text-gray-400">
                      {getPaymentStatusText(orden.paymentStatus)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-800 pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Items:</h4>
                <div className="space-y-2">
                  {orden.items.map((item) => (
                    <div
                      key={item.id_order_item}
                      className="flex items-center justify-between text-sm"
                    >
                      <div>
                        <span className="text-white font-medium">
                          {item.nombre_servicio}
                        </span>
                        <span className="text-gray-400"> - {item.nombre_plan}</span>
                        {item.cantidad > 1 && (
                          <span className="text-gray-500"> x{item.cantidad}</span>
                        )}
                      </div>
                      <div className="flex items-center space-x-4">
                        <span
                          className={`px-2 py-1 rounded text-xs ${
                            item.credenciales_entregadas
                              ? 'bg-green-500/20 text-green-400'
                              : 'bg-gray-500/20 text-gray-400'
                          }`}
                        >
                          {item.credenciales_entregadas ? 'Entregado' : 'Pendiente'}
                        </span>
                        <span className="text-white font-medium">
                          ${parseFloat(item.subtotal.toString()).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {orden.instruccionesPago && orden.paymentStatus === 'pending' && (
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <button
                    onClick={() => setSelectedOrden(orden)}
                    className="text-sm text-purple-400 hover:text-purple-300"
                  >
                    Ver instrucciones de pago →
                  </button>
                </div>
              )}

              {orden.notasAdmin && (
                <div className="border-t border-gray-800 pt-4 mt-4">
                  <h4 className="text-sm font-medium text-gray-400 mb-2">
                    Notas del administrador:
                  </h4>
                  <p className="text-sm text-gray-300">{orden.notasAdmin}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Modal de instrucciones de pago */}
      {selectedOrden && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">
              Instrucciones de Pago - Orden #{selectedOrden.idOrden}
            </h3>

            <div className="bg-gray-800 rounded-lg p-4 mb-4">
              <pre className="text-sm text-gray-300 whitespace-pre-wrap font-mono">
                {selectedOrden.instruccionesPago}
              </pre>
            </div>

            <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-3 rounded-lg text-sm mb-4">
              <p className="font-medium">Importante:</p>
              <ul className="list-disc list-inside mt-2 space-y-1">
                <li>Realiza el pago exacto del monto indicado</li>
                <li>Incluye el concepto/referencia para identificar tu pago</li>
                <li>Una vez realizado el pago, espera la confirmación del administrador</li>
              </ul>
            </div>

            <button
              onClick={() => setSelectedOrden(null)}
              className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

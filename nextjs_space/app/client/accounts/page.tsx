
'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { getClienteToken } from '@/lib/client-auth';
import { getCuentas, getCuentaCredenciales, Cuenta } from '@/lib/client-api';
import { ClipboardDocumentIcon, CheckIcon } from '@heroicons/react/24/outline';

export default function ClientAccountsPage() {
  const [cuentas, setCuentas] = useState<Cuenta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedAccount, setSelectedAccount] = useState<number | null>(null);
  const [credentials, setCredentials] = useState<any>(null);
  const [loadingCredentials, setLoadingCredentials] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  useEffect(() => {
    const fetchCuentas = async () => {
      try {
        const token = getClienteToken();
        if (!token) return;

        const data = await getCuentas(token);
        setCuentas(data.cuentas);
      } catch (err: any) {
        setError(err.message || 'Error al cargar cuentas');
      } finally {
        setLoading(false);
      }
    };

    fetchCuentas();
  }, []);

  const handleViewCredentials = async (id: number) => {
    setLoadingCredentials(true);
    setSelectedAccount(id);
    setCredentials(null);

    try {
      const token = getClienteToken();
      if (!token) return;

      const data = await getCuentaCredenciales(token, id);
      setCredentials(data.cuenta);
    } catch (err: any) {
      setError(err.message || 'Error al obtener credenciales');
    } finally {
      setLoadingCredentials(false);
    }
  };

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Cargando cuentas...</p>
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
        <h1 className="text-3xl font-bold text-white">Mis Cuentas</h1>
        <p className="text-gray-400 mt-2">
          Gestiona todas tus suscripciones activas
        </p>
      </div>

      {cuentas.length === 0 ? (
        <div className="bg-gray-900/50 backdrop-blur rounded-lg p-12 text-center">
          <p className="text-gray-400 text-lg">No tienes cuentas activas</p>
          <a
            href="/catalogo"
            className="inline-block mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700"
          >
            Explorar Servicios
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {cuentas.map((cuenta) => (
            <div
              key={cuenta.id}
              className="bg-gray-900/50 backdrop-blur rounded-lg p-6 border border-gray-800"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-4">
                  {cuenta.logoServicio && (
                    <Image
                      src={cuenta.logoServicio}
                      alt={cuenta.servicio}
                      width={50}
                      height={50}
                      className="rounded"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-bold text-white">
                      {cuenta.servicio}
                    </h3>
                    <p className="text-sm text-gray-400">{cuenta.plan}</p>
                  </div>
                </div>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${
                    cuenta.diasRestantes <= 3
                      ? 'bg-red-500/20 text-red-400'
                      : cuenta.diasRestantes <= 7
                      ? 'bg-yellow-500/20 text-yellow-400'
                      : 'bg-green-500/20 text-green-400'
                  }`}
                >
                  {cuenta.diasRestantes} días restantes
                </span>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Fecha de inicio:</span>
                  <span className="text-white">
                    {new Date(cuenta.fechaInicio).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">Fecha de vencimiento:</span>
                  <span className="text-white">
                    {new Date(cuenta.fechaVencimiento).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handleViewCredentials(cuenta.id)}
                className="w-full py-2 px-4 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors"
              >
                Ver Credenciales
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Modal de credenciales */}
      {selectedAccount && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-900 rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-white mb-4">
              Credenciales de Acceso
            </h3>

            {loadingCredentials ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
                <p className="text-white mt-4">Cargando...</p>
              </div>
            ) : credentials ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Usuario/Email
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={credentials.email}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg"
                    />
                    <button
                      onClick={() => handleCopy(credentials.email, 'email')}
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
                    >
                      {copiedField === 'email' ? (
                        <CheckIcon className="h-5 w-5 text-green-400" />
                      ) : (
                        <ClipboardDocumentIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm text-gray-400 mb-2">
                    Contraseña
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="text"
                      value={credentials.password}
                      readOnly
                      className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg"
                    />
                    <button
                      onClick={() => handleCopy(credentials.password, 'password')}
                      className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
                    >
                      {copiedField === 'password' ? (
                        <CheckIcon className="h-5 w-5 text-green-400" />
                      ) : (
                        <ClipboardDocumentIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {credentials.perfil && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Perfil
                    </label>
                    <input
                      type="text"
                      value={credentials.perfil}
                      readOnly
                      className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
                    />
                  </div>
                )}

                {credentials.pin && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      PIN
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={credentials.pin}
                        readOnly
                        className="flex-1 px-3 py-2 bg-gray-800 text-white rounded-lg"
                      />
                      <button
                        onClick={() => handleCopy(credentials.pin, 'pin')}
                        className="p-2 bg-gray-800 hover:bg-gray-700 text-white rounded-lg"
                      >
                        {copiedField === 'pin' ? (
                          <CheckIcon className="h-5 w-5 text-green-400" />
                        ) : (
                          <ClipboardDocumentIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {credentials.notas && (
                  <div>
                    <label className="block text-sm text-gray-400 mb-2">
                      Notas
                    </label>
                    <textarea
                      value={credentials.notas}
                      readOnly
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-800 text-white rounded-lg"
                    />
                  </div>
                )}

                <div className="bg-yellow-500/10 border border-yellow-500 text-yellow-500 px-4 py-3 rounded-lg text-sm">
                  ⚠️ No compartas estas credenciales con nadie
                </div>
              </div>
            ) : null}

            <button
              onClick={() => {
                setSelectedAccount(null);
                setCredentials(null);
              }}
              className="w-full mt-4 py-2 px-4 bg-gray-800 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

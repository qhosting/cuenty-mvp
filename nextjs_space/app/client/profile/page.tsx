
'use client';

import { useEffect, useState } from 'react';
import { getClienteToken, getClienteProfile, updateClienteProfile, changeClientePassword, Cliente } from '@/lib/client-auth';

export default function ClientProfilePage() {
  const [cliente, setCliente] = useState<Cliente | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>('profile');

  const [profileData, setProfileData] = useState({
    nombre: '',
    apellido: '',
    telefono: '',
    whatsapp: '',
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = getClienteToken();
        if (!token) return;

        const data = await getClienteProfile(token);
        setCliente(data.cliente);
        setProfileData({
          nombre: data.cliente.nombre,
          apellido: data.cliente.apellido,
          telefono: data.cliente.telefono || '',
          whatsapp: data.cliente.whatsapp || '',
        });
      } catch (err: any) {
        setError(err.message || 'Error al cargar perfil');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
  };

  const handleProfileSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    try {
      const token = getClienteToken();
      if (!token) return;

      await updateClienteProfile(token, profileData);
      setSuccess('Perfil actualizado exitosamente');

      // Actualizar datos locales
      const data = await getClienteProfile(token);
      setCliente(data.cliente);
    } catch (err: any) {
      setError(err.message || 'Error al actualizar perfil');
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setError('La nueva contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const token = getClienteToken();
      if (!token) return;

      await changeClientePassword(token, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword,
      });

      setSuccess('Contraseña cambiada exitosamente');
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    } catch (err: any) {
      setError(err.message || 'Error al cambiar contraseña');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto"></div>
          <p className="text-white mt-4">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-white">Mi Perfil</h1>
        <p className="text-gray-400 mt-2">
          Administra tu información personal y seguridad
        </p>
      </div>

      {/* Tabs */}
      <div className="flex space-x-4 border-b border-gray-800">
        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'profile'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Información Personal
        </button>
        <button
          onClick={() => setActiveTab('password')}
          className={`pb-4 px-4 font-medium transition-colors ${
            activeTab === 'password'
              ? 'text-purple-400 border-b-2 border-purple-400'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          Cambiar Contraseña
        </button>
      </div>

      {/* Mensajes */}
      {error && (
        <div className="bg-red-500/10 border border-red-500 text-red-500 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-500/10 border border-green-500 text-green-500 px-4 py-3 rounded-lg">
          {success}
        </div>
      )}

      {/* Información Personal */}
      {activeTab === 'profile' && (
        <form onSubmit={handleProfileSubmit} className="bg-gray-900/50 backdrop-blur rounded-lg p-6 space-y-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-4">
              Información de Cuenta
            </h3>
            <div className="bg-gray-800 rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Email:</span>
                <span className="text-white">{cliente?.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Miembro desde:</span>
                <span className="text-white">
                  {cliente && new Date(cliente.fechaCreacion).toLocaleDateString()}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Nombre
              </label>
              <input
                type="text"
                name="nombre"
                value={profileData.nombre}
                onChange={handleProfileChange}
                required
                className="w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Apellido
              </label>
              <input
                type="text"
                name="apellido"
                value={profileData.apellido}
                onChange={handleProfileChange}
                required
                className="w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Teléfono
            </label>
            <input
              type="tel"
              name="telefono"
              value={profileData.telefono}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              WhatsApp
            </label>
            <input
              type="tel"
              name="whatsapp"
              value={profileData.whatsapp}
              onChange={handleProfileChange}
              className="w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Guardar Cambios
          </button>
        </form>
      )}

      {/* Cambiar Contraseña */}
      {activeTab === 'password' && (
        <form onSubmit={handlePasswordSubmit} className="bg-gray-900/50 backdrop-blur rounded-lg p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña Actual
            </label>
            <input
              type="password"
              name="currentPassword"
              value={passwordData.currentPassword}
              onChange={handlePasswordChange}
              required
              className="w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Nueva Contraseña
            </label>
            <input
              type="password"
              name="newPassword"
              value={passwordData.newPassword}
              onChange={handlePasswordChange}
              required
              className="w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-400">
              Mínimo 6 caracteres
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Confirmar Nueva Contraseña
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={passwordData.confirmPassword}
              onChange={handlePasswordChange}
              required
              className="w-full px-3 py-2 border border-gray-700 bg-gray-800 placeholder-gray-400 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
          </div>

          <button
            type="submit"
            className="w-full py-3 px-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg font-medium transition-colors"
          >
            Cambiar Contraseña
          </button>
        </form>
      )}
    </div>
  );
}

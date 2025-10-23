/**
 * Servicio de autenticación para clientes
 * Maneja registro, login, recuperación de contraseña, etc.
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Cliente {
  id: number;
  email: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  whatsapp?: string;
  emailVerificado: boolean;
  fechaCreacion: string;
  ultimoAcceso?: string;
}

export interface ClienteAuthResponse {
  message: string;
  cliente: Cliente;
  token: string;
}

export interface RegisterData {
  email: string;
  password: string;
  nombre: string;
  apellido: string;
  telefono?: string;
  whatsapp?: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface UpdateProfileData {
  nombre?: string;
  apellido?: string;
  telefono?: string;
  whatsapp?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

/**
 * Registrar un nuevo cliente
 */
export async function registerCliente(data: RegisterData): Promise<ClienteAuthResponse> {
  const response = await fetch(`${API_URL}/api/client/auth/register`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al registrar');
  }

  return response.json();
}

/**
 * Login de cliente
 */
export async function loginCliente(data: LoginData): Promise<ClienteAuthResponse> {
  const response = await fetch(`${API_URL}/api/client/auth/login`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al iniciar sesión');
  }

  return response.json();
}

/**
 * Obtener perfil del cliente autenticado
 */
export async function getClienteProfile(token: string): Promise<{ cliente: Cliente }> {
  const response = await fetch(`${API_URL}/api/client/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener perfil');
  }

  return response.json();
}

/**
 * Actualizar perfil del cliente
 */
export async function updateClienteProfile(token: string, data: UpdateProfileData): Promise<{ message: string; cliente: Cliente }> {
  const response = await fetch(`${API_URL}/api/client/profile`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al actualizar perfil');
  }

  return response.json();
}

/**
 * Cambiar contraseña
 */
export async function changeClientePassword(token: string, data: ChangePasswordData): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/client/change-password`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cambiar contraseña');
  }

  return response.json();
}

/**
 * Solicitar recuperación de contraseña
 */
export async function requestPasswordReset(email: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/client/auth/forgot-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ email }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al solicitar recuperación');
  }

  return response.json();
}

/**
 * Resetear contraseña con token
 */
export async function resetPassword(token: string, newPassword: string): Promise<{ message: string }> {
  const response = await fetch(`${API_URL}/api/client/auth/reset-password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ token, newPassword }),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al restablecer contraseña');
  }

  return response.json();
}

/**
 * Guardar token en localStorage
 */
export function saveClienteToken(token: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('clienteToken', token);
  }
}

/**
 * Obtener token de localStorage
 */
export function getClienteToken(): string | null {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('clienteToken');
  }
  return null;
}

/**
 * Eliminar token de localStorage
 */
export function removeClienteToken(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('clienteToken');
  }
}

/**
 * Verificar si el cliente está autenticado
 */
export function isClienteAuthenticated(): boolean {
  return getClienteToken() !== null;
}

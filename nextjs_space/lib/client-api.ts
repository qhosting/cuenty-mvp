
/**
 * Funciones para consumir la API del panel de clientes
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface DashboardData {
  cliente: {
    nombre: string;
    apellido: string;
    email: string;
  };
  estadisticas: {
    cuentasActivas: number;
    cuentasProximasVencer: number;
  };
  proximosVencimientos: Array<{
    id: number;
    servicio: string;
    logoServicio?: string;
    plan: string;
    fechaVencimiento: string;
    diasRestantes: number;
  }>;
  ultimasOrdenes: Array<{
    id: number;
    fecha: string;
    total: number;
    estado: string;
    paymentStatus: string;
    itemsCount: number;
  }>;
}

export interface Cuenta {
  id: number;
  ordenId: number;
  servicio: string;
  logoServicio?: string;
  plan: string;
  fechaInicio: string;
  fechaVencimiento: string;
  estado: string;
  diasRestantes: number;
}

export interface CuentaCredenciales {
  cuenta: {
    servicio: string;
    logoServicio?: string;
    plan: string;
    email: string;
    password: string;
    perfil?: string;
    pin?: string;
    notas?: string;
    fechaVencimiento: string;
  };
}

export interface Orden {
  idOrden: number;
  celularUsuario: string;
  clienteId?: number;
  montoTotal: number;
  estado: string;
  metodoPago: string;
  metodoEntrega: string;
  instruccionesPago?: string;
  notasAdmin?: string;
  fechaCreacion: string;
  fechaPago?: string;
  fechaEntrega?: string;
  paymentStatus: string;
  items: Array<{
    id_order_item: number;
    id_plan: number;
    cantidad: number;
    precio_unitario: number;
    subtotal: number;
    estado: string;
    nombre_servicio: string;
    nombre_plan: string;
    duracion_meses: number;
    credenciales_entregadas: boolean;
  }>;
}

/**
 * Obtener datos del dashboard
 */
export async function getDashboard(token: string): Promise<DashboardData> {
  const response = await fetch(`${API_URL}/api/client/dashboard`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener dashboard');
  }

  return response.json();
}

/**
 * Obtener cuentas activas
 */
export async function getCuentas(token: string, servicio?: string): Promise<{ cuentas: Cuenta[] }> {
  const url = new URL(`${API_URL}/api/client/accounts`);
  if (servicio) {
    url.searchParams.append('servicio', servicio);
  }

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener cuentas');
  }

  return response.json();
}

/**
 * Obtener credenciales de una cuenta
 */
export async function getCuentaCredenciales(token: string, id: number): Promise<CuentaCredenciales> {
  const response = await fetch(`${API_URL}/api/client/accounts/${id}/credentials`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener credenciales');
  }

  return response.json();
}

/**
 * Obtener historial de órdenes
 */
export async function getOrdenes(
  token: string,
  params?: { estado?: string; page?: number; limit?: number }
): Promise<{
  ordenes: Orden[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}> {
  const url = new URL(`${API_URL}/api/client/orders`);
  if (params?.estado) url.searchParams.append('estado', params.estado);
  if (params?.page) url.searchParams.append('page', params.page.toString());
  if (params?.limit) url.searchParams.append('limit', params.limit.toString());

  const response = await fetch(url.toString(), {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener órdenes');
  }

  return response.json();
}

/**
 * Obtener detalle de una orden
 */
export async function getOrdenById(token: string, id: number): Promise<{ orden: Orden }> {
  const response = await fetch(`${API_URL}/api/client/orders/${id}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al obtener orden');
  }

  return response.json();
}

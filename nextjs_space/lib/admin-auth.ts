
'use client'

import axios, { AxiosResponse } from 'axios'
import { toast } from 'react-hot-toast'

// Use relative URL for API calls to work in all environments
const API_BASE_URL = typeof window !== 'undefined' ? window.location.origin : ''

// Create axios instance for admin API
export const adminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000, // 15 segundos de timeout
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth interceptor to include token in requests
adminApi.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Add response interceptor to handle auth errors
adminApi.interceptors.response.use(
  (response: AxiosResponse) => {
    return response
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      if (typeof window !== 'undefined') {
        localStorage.removeItem('admin_token')
        window.location.href = '/admin/login'
      }
    }
    return Promise.reject(error)
  }
)

// Admin auth functions
export const adminAuth = {
  login: async (email: string, password: string) => {
    try {
      console.log('[AdminAuth] Enviando solicitud de login...')
      const response = await adminApi.post('/api/admin/login', {
        email,
        password,
      })
      
      console.log('[AdminAuth] Respuesta recibida:', response.status)
      
      if (response.data.token) {
        localStorage.setItem('admin_token', response.data.token)
        console.log('[AdminAuth] Token guardado exitosamente')
        return { success: true, token: response.data.token }
      }
      
      console.warn('[AdminAuth] No se recibió token en la respuesta')
      return { success: false, message: 'No se recibió token de autenticación' }
    } catch (error: any) {
      console.error('[AdminAuth] Error durante login:', error)
      
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        return { success: false, message: 'Tiempo de espera agotado. Verifica tu conexión.' }
      }
      
      if (error.code === 'ERR_NETWORK') {
        return { success: false, message: 'Error de red. Verifica tu conexión a internet.' }
      }
      
      const message = error.response?.data?.message || 
                     error.message || 
                     'Error de autenticación. Intenta de nuevo.'
      return { success: false, message }
    }
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('admin_token')
      window.location.href = '/admin/login'
    }
  },

  isAuthenticated: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('admin_token')
      return !!token
    }
    return false
  },

  getProfile: async () => {
    try {
      const response = await adminApi.get('/api/admin/profile')
      return { success: true, data: response.data }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error al obtener perfil'
      return { success: false, message }
    }
  }
}

// API functions for admin operations
export const adminApiService = {
  // Dashboard
  getDashboard: async () => {
    try {
      const response = await adminApi.get('/api/admin/dashboard')
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al obtener estadísticas'
      return { success: false, message }
    }
  },

  // Services
  getServices: async () => {
    try {
      const response = await adminApi.get('/api/admin/services')
      // La ruta API ya devuelve {success: true, data: [...]}
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al obtener servicios'
      return { success: false, message }
    }
  },

  createService: async (data: any) => {
    try {
      const response = await adminApi.post('/api/admin/services', data)
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al crear servicio'
      return { success: false, message }
    }
  },

  updateService: async (id: string, data: any) => {
    try {
      const response = await adminApi.put(`/api/admin/services/${id}`, data)
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al actualizar servicio'
      return { success: false, message }
    }
  },

  deleteService: async (id: string) => {
    try {
      const response = await adminApi.delete(`/api/admin/services/${id}`)
      return response.data.success ? { success: true } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al eliminar servicio'
      return { success: false, message }
    }
  },

  // Plans
  getPlans: async () => {
    try {
      const response = await adminApi.get('/api/admin/plans')
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al obtener planes'
      return { success: false, message }
    }
  },

  createPlan: async (data: any) => {
    try {
      const response = await adminApi.post('/api/admin/plans', data)
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al crear plan'
      return { success: false, message }
    }
  },

  updatePlan: async (id: string, data: any) => {
    try {
      const response = await adminApi.put(`/api/admin/plans/${id}`, data)
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al actualizar plan'
      return { success: false, message }
    }
  },

  deletePlan: async (id: string) => {
    try {
      const response = await adminApi.delete(`/api/admin/plans/${id}`)
      return response.data.success ? { success: true } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al eliminar plan'
      return { success: false, message }
    }
  },

  // Orders
  getOrders: async (filters?: any) => {
    try {
      const response = await adminApi.get('/api/admin/orders', { params: filters })
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al obtener órdenes'
      return { success: false, message }
    }
  },

  getOrder: async (id: string) => {
    try {
      const response = await adminApi.get(`/api/admin/orders/${id}`)
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al obtener orden'
      return { success: false, message }
    }
  },

  updateOrderStatus: async (id: string, status: string) => {
    try {
      const response = await adminApi.put(`/api/admin/orders/${id}/status`, { status })
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al actualizar estado'
      return { success: false, message }
    }
  },

  confirmPayment: async (id: string) => {
    try {
      const response = await adminApi.post(`/api/admin/orders/${id}/confirm-payment`)
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al confirmar pago'
      return { success: false, message }
    }
  },

  // Accounts
  getAccounts: async (filters?: any) => {
    try {
      const response = await adminApi.get('/api/admin/accounts', { params: filters })
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al obtener cuentas'
      return { success: false, message }
    }
  },

  createAccount: async (data: any) => {
    try {
      const response = await adminApi.post('/api/admin/accounts', data)
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al crear cuenta'
      return { success: false, message }
    }
  },

  updateAccount: async (id: string, data: any) => {
    try {
      const response = await adminApi.put(`/api/admin/accounts/${id}`, data)
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al actualizar cuenta'
      return { success: false, message }
    }
  },

  deleteAccount: async (id: string) => {
    try {
      const response = await adminApi.delete(`/api/admin/accounts/${id}`)
      return response.data.success ? { success: true } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al eliminar cuenta'
      return { success: false, message }
    }
  },

  // Configuration
  getEvolutionConfig: async () => {
    try {
      const response = await adminApi.get('/api/admin/config/evolution')
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al obtener configuración'
      return { success: false, message }
    }
  },

  saveEvolutionConfig: async (data: any) => {
    try {
      const response = await adminApi.post('/api/admin/config/evolution', data)
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al guardar configuración'
      return { success: false, message }
    }
  },

  // Chatwoot Configuration
  getChatwootConfig: async () => {
    try {
      const response = await adminApi.get('/api/admin/config/chatwoot')
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al obtener configuración de Chatwoot'
      return { success: false, message }
    }
  },

  saveChatwootConfig: async (data: any) => {
    try {
      const response = await adminApi.post('/api/admin/config/chatwoot', data)
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al guardar configuración de Chatwoot'
      return { success: false, message }
    }
  },

  // Combos
  getCombos: async () => {
    try {
      const response = await adminApi.get('/api/admin/combos')
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al obtener combos'
      return { success: false, message }
    }
  },

  getCombo: async (id: string) => {
    try {
      const response = await adminApi.get(`/api/admin/combos/${id}`)
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al obtener combo'
      return { success: false, message }
    }
  },

  createCombo: async (data: any) => {
    try {
      const response = await adminApi.post('/api/admin/combos', data)
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al crear combo'
      return { success: false, message }
    }
  },

  updateCombo: async (id: string, data: any) => {
    try {
      const response = await adminApi.put(`/api/admin/combos/${id}`, data)
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al actualizar combo'
      return { success: false, message }
    }
  },

  deleteCombo: async (id: string) => {
    try {
      const response = await adminApi.delete(`/api/admin/combos/${id}`)
      return response.data.success ? { success: true } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al eliminar combo'
      return { success: false, message }
    }
  },

  calculateComboTotals: async (planes: any[]) => {
    try {
      const response = await adminApi.post('/api/admin/combos/calculate-totals', { planes })
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al calcular totales'
      return { success: false, message }
    }
  },

  // Payment Configurations
  getPaymentConfigs: async () => {
    try {
      const response = await adminApi.get('/api/admin/payment-config')
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al obtener configuraciones de pago'
      return { success: false, message }
    }
  },

  createPaymentConfig: async (data: any) => {
    try {
      const response = await adminApi.post('/api/admin/payment-config', data)
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al crear configuración de pago'
      return { success: false, message }
    }
  },

  updatePaymentConfig: async (id: string, data: any) => {
    try {
      const response = await adminApi.put(`/api/admin/payment-config/${id}`, data)
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al actualizar configuración'
      return { success: false, message }
    }
  },

  togglePaymentConfig: async (id: string, activo: boolean) => {
    try {
      const response = await adminApi.patch(`/api/admin/payment-config/toggle/${id}`, { activo })
      return response.data.success ? { success: true, data: response.data.data } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al cambiar estado'
      return { success: false, message }
    }
  },

  deletePaymentConfig: async (id: string) => {
    try {
      const response = await adminApi.delete(`/api/admin/payment-config/${id}`)
      return response.data.success ? { success: true } : { success: false, message: response.data.error }
    } catch (error: any) {
      const message = error.response?.data?.error || error.response?.data?.message || 'Error al eliminar configuración'
      return { success: false, message }
    }
  },

  // Generic methods for custom API calls
  get: async (url: string) => {
    try {
      const response = await adminApi.get(url)
      return { success: true, data: response.data }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error en la solicitud GET'
      return { success: false, message }
    }
  },

  post: async (url: string, data: any) => {
    try {
      const response = await adminApi.post(url, data)
      return { success: true, data: response.data }
    } catch (error: any) {
      const message = error.response?.data?.message || 'Error en la solicitud POST'
      return { success: false, message }
    }
  }
}

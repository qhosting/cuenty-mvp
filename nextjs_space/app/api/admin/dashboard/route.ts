
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'cuenty-admin-secret-change-in-production'

// Verificar token de autenticación
function verifyToken(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return null
    }

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, ADMIN_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

// Mapeo de estados de orden en español
const statusMapToSpanish: { [key: string]: string } = {
  'pendiente': 'Pendientes',
  'pendiente_pago': 'Pendientes',
  'pagada': 'En Proceso',
  'en_proceso': 'En Proceso',
  'entregada': 'Completadas',
  'cancelada': 'Canceladas'
}

// Colores para estados de orden
const statusColors: { [key: string]: string } = {
  'Completadas': '#22c55e',
  'Pendientes': '#f59e0b',
  'En Proceso': '#3b82f6',
  'Canceladas': '#ef4444'
}

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener datos reales de la base de datos
    try {
      // 1. Total de órdenes
      const totalOrders = await prisma.orden.count()

      // 2. Total de ingresos (suma de todas las órdenes pagadas y entregadas)
      const revenueData = await prisma.orden.aggregate({
        where: {
          estado: {
            in: ['pagada', 'en_proceso', 'entregada']
          }
        },
        _sum: {
          montoTotal: true
        }
      })
      const totalRevenue = Number(revenueData._sum.montoTotal || 0)

      // 3. Total de usuarios
      const totalUsers = await prisma.usuario.count()

      // 4. Servicios activos
      const activeServices = await prisma.servicio.count({
        where: {
          activo: true
        }
      })

      // 5. Datos de ventas por día (últimos 7 días)
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
      
      const ordersLastWeek = await prisma.orden.findMany({
        where: {
          fechaCreacion: {
            gte: sevenDaysAgo
          },
          estado: {
            in: ['pagada', 'en_proceso', 'entregada']
          }
        },
        select: {
          fechaCreacion: true,
          montoTotal: true
        },
        orderBy: {
          fechaCreacion: 'asc'
        }
      })

      // Agrupar ventas por día
      const salesByDay: { [key: string]: number } = {}
      const dayNames = ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab']
      
      ordersLastWeek.forEach(order => {
        const dayName = dayNames[order.fechaCreacion.getDay()]
        if (!salesByDay[dayName]) {
          salesByDay[dayName] = 0
        }
        salesByDay[dayName] += Number(order.montoTotal)
      })

      // Crear array de ventas para los últimos 7 días
      const salesData = []
      for (let i = 6; i >= 0; i--) {
        const date = new Date()
        date.setDate(date.getDate() - i)
        const dayName = dayNames[date.getDay()]
        salesData.push({
          day: dayName,
          sales: Math.round(salesByDay[dayName] || 0)
        })
      }

      // 6. Top 5 servicios más vendidos
      const topServicesData = await prisma.orderItem.groupBy({
        by: ['idPlan'],
        _sum: {
          subtotal: true,
          cantidad: true
        },
        orderBy: {
          _sum: {
            cantidad: 'desc'
          }
        },
        take: 5
      })

      // Obtener información completa de los servicios
      const topServices = await Promise.all(
        topServicesData.map(async (item) => {
          const plan = await prisma.servicePlan.findUnique({
            where: { idPlan: item.idPlan },
            include: {
              servicio: true
            }
          })
          
          return {
            name: plan ? `${plan.servicio.nombre} - ${plan.nombrePlan}` : 'Servicio Desconocido',
            sales: item._sum.cantidad || 0,
            revenue: Math.round(Number(item._sum.subtotal || 0))
          }
        })
      )

      // 7. Órdenes por estado
      const ordersByStatusData = await prisma.orden.groupBy({
        by: ['estado'],
        _count: {
          estado: true
        }
      })

      // Agrupar estados y mapear a español
      const statusGroups: { [key: string]: number } = {}
      ordersByStatusData.forEach(item => {
        const spanishStatus = statusMapToSpanish[item.estado] || 'Otros'
        if (!statusGroups[spanishStatus]) {
          statusGroups[spanishStatus] = 0
        }
        statusGroups[spanishStatus] += item._count.estado
      })

      const ordersByStatus = Object.entries(statusGroups).map(([status, count]) => ({
        status,
        count,
        color: statusColors[status] || '#94a3b8'
      }))

      const dashboardData = {
        totalOrders,
        totalRevenue,
        totalUsers,
        activeServices,
        salesData,
        topServices,
        ordersByStatus
      }

      return NextResponse.json(dashboardData)
      
    } catch (dbError: any) {
      // Si hay error de base de datos, devolver datos de ejemplo con advertencia
      console.error('[Admin Dashboard] Error al consultar base de datos:', dbError)
      
      // Datos de fallback
      const fallbackData = {
        totalOrders: 0,
        totalRevenue: 0,
        totalUsers: 0,
        activeServices: 0,
        salesData: [
          { day: 'Lun', sales: 0 },
          { day: 'Mar', sales: 0 },
          { day: 'Mie', sales: 0 },
          { day: 'Jue', sales: 0 },
          { day: 'Vie', sales: 0 },
          { day: 'Sab', sales: 0 },
          { day: 'Dom', sales: 0 }
        ],
        topServices: [],
        ordersByStatus: []
      }

      return NextResponse.json(fallbackData)
    }
  } catch (error) {
    console.error('[Admin Dashboard] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error del servidor' },
      { status: 500 }
    )
  }
}

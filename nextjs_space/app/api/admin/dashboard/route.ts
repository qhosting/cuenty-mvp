
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

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

export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // TODO: Obtener datos reales de la base de datos
    // Por ahora, devolver datos de ejemplo
    const dashboardData = {
      totalOrders: 156,
      totalRevenue: 45280,
      totalUsers: 89,
      activeServices: 12,
      salesData: [
        { day: 'Lun', sales: 4200 },
        { day: 'Mar', sales: 3800 },
        { day: 'Mie', sales: 5100 },
        { day: 'Jue', sales: 4600 },
        { day: 'Vie', sales: 6200 },
        { day: 'Sab', sales: 7800 },
        { day: 'Dom', sales: 6400 }
      ],
      topServices: [
        { name: 'Netflix Premium', sales: 45, revenue: 13500 },
        { name: 'Disney+ Familiar', sales: 32, revenue: 9600 },
        { name: 'HBO Max', sales: 28, revenue: 8400 },
        { name: 'Amazon Prime', sales: 24, revenue: 7200 },
        { name: 'Spotify Premium', sales: 18, revenue: 5400 }
      ],
      ordersByStatus: [
        { status: 'Completadas', count: 89, color: '#22c55e' },
        { status: 'Pendientes', count: 34, color: '#f59e0b' },
        { status: 'En Proceso', count: 23, color: '#3b82f6' },
        { status: 'Canceladas', count: 10, color: '#ef4444' }
      ]
    }

    return NextResponse.json(dashboardData)
  } catch (error) {
    console.error('[Admin Dashboard] Error:', error)
    return NextResponse.json(
      { error: 'Error del servidor' },
      { status: 500 }
    )
  }
}

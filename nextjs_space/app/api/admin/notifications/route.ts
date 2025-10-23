import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Tipo de notificación para el admin
interface AdminNotification {
  id: string
  type: 'new_order' | 'subscription_expiring' | 'new_user' | 'system'
  title: string
  message: string
  timestamp: Date
  read: boolean
  link?: string
}

/**
 * GET /api/admin/notifications
 * Obtiene las notificaciones del admin (eventos importantes del sistema)
 */
export async function GET(request: NextRequest) {
  try {
    console.log('[Admin Notifications API] Iniciando petición de notificaciones...')
    
    // Verificar token de admin
    const token = request.headers.get('authorization')?.replace('Bearer ', '')
    
    if (!token) {
      console.log('[Admin Notifications API] Token no proporcionado')
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const notifications: AdminNotification[] = []
    const now = new Date()
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)

    // 1. Obtener pedidos recientes (últimas 24 horas)
    try {
      const recentOrders = await prisma.ordenes.findMany({
        where: {
          created_at: {
            gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
          }
        },
        include: {
          usuarios: true,
          planes: true
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 5
      })

      for (const order of recentOrders) {
        notifications.push({
          id: `order-${order.id}`,
          type: 'new_order',
          title: 'Nuevo pedido',
          message: `${order.usuarios?.nombre || 'Usuario'} realizó un pedido de ${order.planes?.nombre || 'plan'}`,
          timestamp: order.created_at,
          read: false,
          link: `/admin/orders`
        })
      }
    } catch (error) {
      console.error('[Admin Notifications API] Error obteniendo pedidos:', error)
    }

    // 2. Obtener suscripciones próximas a vencer (7 días)
    try {
      const expiringSubs = await prisma.suscripciones.findMany({
        where: {
          estado: 'activa',
          fecha_vencimiento: {
            gte: now,
            lte: sevenDaysFromNow
          }
        },
        include: {
          usuarios: true,
          planes: true
        },
        orderBy: {
          fecha_vencimiento: 'asc'
        },
        take: 10
      })

      for (const sub of expiringSubs) {
        const daysRemaining = Math.ceil(
          (sub.fecha_vencimiento.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
        )
        
        notifications.push({
          id: `sub-expiring-${sub.id}`,
          type: 'subscription_expiring',
          title: 'Suscripción próxima a vencer',
          message: `La suscripción de ${sub.usuarios?.nombre || 'usuario'} vence en ${daysRemaining} día${daysRemaining !== 1 ? 's' : ''}`,
          timestamp: sub.updated_at || sub.created_at,
          read: false,
          link: `/admin/accounts`
        })
      }
    } catch (error) {
      console.error('[Admin Notifications API] Error obteniendo suscripciones:', error)
    }

    // 3. Obtener nuevos usuarios (últimos 7 días)
    try {
      const newUsers = await prisma.usuarios.findMany({
        where: {
          created_at: {
            gte: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
          }
        },
        orderBy: {
          created_at: 'desc'
        },
        take: 5
      })

      for (const user of newUsers) {
        notifications.push({
          id: `user-${user.id}`,
          type: 'new_user',
          title: 'Nuevo usuario registrado',
          message: `${user.nombre} se registró en la plataforma`,
          timestamp: user.created_at,
          read: false,
          link: `/admin/accounts`
        })
      }
    } catch (error) {
      console.error('[Admin Notifications API] Error obteniendo usuarios:', error)
    }

    // Ordenar notificaciones por fecha (más recientes primero)
    notifications.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    // Limitar a las 20 más recientes
    const limitedNotifications = notifications.slice(0, 20)

    console.log(`[Admin Notifications API] Notificaciones encontradas: ${limitedNotifications.length}`)

    return NextResponse.json({
      success: true,
      notifications: limitedNotifications,
      unreadCount: limitedNotifications.filter(n => !n.read).length
    })

  } catch (error) {
    console.error('[Admin Notifications API] Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener notificaciones',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

/**
 * PUT /api/admin/notifications
 * Marca notificaciones como leídas
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const { notificationIds } = body

    // En una implementación real, aquí guardaríamos el estado de lectura
    // Por ahora, solo retornamos éxito
    console.log('[Admin Notifications API] Marcando notificaciones como leídas:', notificationIds)

    return NextResponse.json({
      success: true,
      message: 'Notificaciones marcadas como leídas'
    })

  } catch (error) {
    console.error('[Admin Notifications API] Error marcando notificaciones:', error)
    return NextResponse.json(
      { success: false, error: 'Error al marcar notificaciones' },
      { status: 500 }
    )
  }
}

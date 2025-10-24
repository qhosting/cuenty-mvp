
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { EstadoOrden } from '@prisma/client'

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

// PUT - Actualizar estado de la orden
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { status } = body
    const ordenId = parseInt(params.id)

    if (isNaN(ordenId)) {
      return NextResponse.json(
        { success: false, error: 'ID de orden inválido' },
        { status: 400 }
      )
    }

    // Validar estado
    const estadosValidos: EstadoOrden[] = ['pendiente', 'pendiente_pago', 'pagada', 'en_proceso', 'entregada', 'cancelada']
    if (!status || !estadosValidos.includes(status as EstadoOrden)) {
      return NextResponse.json(
        { success: false, error: 'Estado inválido. Estados válidos: ' + estadosValidos.join(', ') },
        { status: 400 }
      )
    }

    // Verificar que la orden existe
    const ordenExistente = await prisma.orden.findUnique({
      where: { idOrden: ordenId }
    })

    if (!ordenExistente) {
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar estado
    const ordenActualizada = await prisma.orden.update({
      where: { idOrden: ordenId },
      data: {
        estado: status as EstadoOrden,
        ...(status === 'pagada' && !ordenExistente.fechaPago && {
          fechaPago: new Date()
        }),
        ...(status === 'entregada' && !ordenExistente.fechaEntrega && {
          fechaEntrega: new Date()
        })
      },
      include: {
        usuario: true,
        items: {
          include: {
            plan: {
              include: {
                servicio: true
              }
            }
          }
        }
      }
    })

    // Transformar a formato esperado
    const primerItem = ordenActualizada.items && ordenActualizada.items.length > 0 ? ordenActualizada.items[0] : null
    const order = {
      id: ordenActualizada.idOrden.toString(),
      usuario_celular: ordenActualizada.celularUsuario,
      usuario_nombre: ordenActualizada.usuario?.nombre || '',
      usuario_email: ordenActualizada.usuario?.email || '',
      servicio_nombre: primerItem?.plan?.servicio?.nombre || 'N/A',
      plan_nombre: primerItem?.plan?.nombrePlan || 'N/A',
      plan_duracion_meses: primerItem?.plan?.duracionMeses || 0,
      total: Number(ordenActualizada.montoTotal),
      estado: ordenActualizada.estado,
      payment_status: 'pending',
      created_at: ordenActualizada.fechaCreacion.toISOString(),
      updated_at: ordenActualizada.fechaCreacion.toISOString(),
      comprobante_url: null
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error: any) {
    console.error('[Admin Orders PUT Status] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar estado de orden', message: error.message },
      { status: 500 }
    )
  }
}

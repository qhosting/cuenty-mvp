
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-middleware'


// Verificar token de autenticación

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, ADMIN_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

// POST - Confirmar pago de la orden
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const adminPayload = await requireAdmin(request)
    if (adminPayload instanceof NextResponse) {
      return adminPayload
    }
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const ordenId = parseInt(params.id)

    if (isNaN(ordenId)) {
      return NextResponse.json(
        { success: false, error: 'ID de orden inválido' },
        { status: 400 }
      )
    }

    // Verificar que la orden existe
    const ordenExistente = await prisma.orden.findUnique({
      where: { idOrden: ordenId },
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

    if (!ordenExistente) {
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Actualizar orden - marcar como pagada y registrar fecha de pago
    const ordenActualizada = await prisma.orden.update({
      where: { idOrden: ordenId },
      data: {
        estado: 'pagada',
        fechaPago: new Date()
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
      payment_status: 'confirmed', // Confirmado
      payment_confirmed_at: ordenActualizada.fechaPago?.toISOString(),
      created_at: ordenActualizada.fechaCreacion.toISOString(),
      updated_at: ordenActualizada.fechaCreacion.toISOString(),
      comprobante_url: null
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error: any) {
    console.error('[Admin Orders POST Confirm Payment] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al confirmar pago', message: error.message },
      { status: 500 }
    )
  }
}

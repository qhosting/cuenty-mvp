
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

// GET - Obtener una orden específica
export async function GET(
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

    // Obtener orden de la base de datos
    const orden = await prisma.orden.findUnique({
      where: { idOrden: ordenId },
      include: {
        usuario: true,
        items: {
          include: {
            plan: {
              include: {
                servicio: true
              }
            },
            cuentaAsignada: true
          }
        }
      }
    })

    if (!orden) {
      return NextResponse.json(
        { success: false, error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Obtener información del primer item
    const primerItem = orden.items && orden.items.length > 0 ? orden.items[0] : null

    // Transformar a formato esperado
    const order = {
      id: orden.idOrden.toString(),
      usuario_celular: orden.celularUsuario,
      usuario_nombre: orden.usuario?.nombre || '',
      usuario_email: orden.usuario?.email || '',
      servicio_nombre: primerItem?.plan?.servicio?.nombre || 'N/A',
      plan_nombre: primerItem?.plan?.nombrePlan || 'N/A',
      plan_duracion_meses: primerItem?.plan?.duracionMeses || 0,
      total: Number(orden.montoTotal),
      estado: orden.estado,
      payment_status: 'pending',
      created_at: orden.fechaCreacion.toISOString(),
      updated_at: orden.fechaCreacion.toISOString(),
      comprobante_url: null,
      items: orden.items.map(item => ({
        id: item.idOrderItem.toString(),
        plan_nombre: item.plan?.nombrePlan || 'N/A',
        servicio_nombre: item.plan?.servicio?.nombre || 'N/A',
        cantidad: item.cantidad,
        precio_unitario: Number(item.precioUnitario),
        subtotal: Number(item.subtotal),
        estado: item.estado,
        cuenta_email: item.cuentaAsignada ? 'Asignada' : 'Pendiente'
      }))
    }

    return NextResponse.json({ success: true, data: order })
  } catch (error: any) {
    console.error('[Admin Orders GET by ID] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener orden', message: error.message },
      { status: 500 }
    )
  }
}

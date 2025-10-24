
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

// GET - Obtener una orden específica
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const ordenId = parseInt(params.id)

    if (isNaN(ordenId)) {
      return NextResponse.json(
        { error: 'ID de orden inválido' },
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
        { error: 'Orden no encontrada' },
        { status: 404 }
      )
    }

    // Obtener información del primer item
    const primerItem = orden.items[0]

    // Transformar a formato esperado
    const order = {
      id: orden.idOrden.toString(),
      usuario_celular: orden.celularUsuario,
      usuario_nombre: orden.usuario.nombre || '',
      usuario_email: orden.usuario.email || '',
      servicio_nombre: primerItem ? primerItem.plan.servicio.nombre : 'N/A',
      plan_nombre: primerItem ? primerItem.plan.nombrePlan : 'N/A',
      plan_duracion_meses: primerItem ? primerItem.plan.duracionMeses : 0,
      total: Number(orden.montoTotal),
      estado: orden.estado,
      payment_status: 'pending',
      created_at: orden.fechaCreacion.toISOString(),
      updated_at: orden.fechaCreacion.toISOString(),
      comprobante_url: null
    }

    return NextResponse.json(order)
  } catch (error: any) {
    console.error('[Admin Orders GET by ID] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener orden', message: error.message },
      { status: 500 }
    )
  }
}

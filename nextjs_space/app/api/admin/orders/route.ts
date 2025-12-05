
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'default-secret'

async function requireAdmin(request: NextRequest) {
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

// GET - Obtener todas las órdenes
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const adminPayload = await requireAdmin(request)
    if (!adminPayload) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener parámetros de filtro
    const searchParams = request.nextUrl.searchParams
    const celular = searchParams.get('celular')
    const estado = searchParams.get('estado')
    const paymentStatus = searchParams.get('payment_status')

    // Construir filtros
    const where: any = {}
    
    if (celular) {
      where.celularUsuario = { contains: celular }
    }
    
    if (estado) {
      where.estado = estado
    }

    if (paymentStatus) {
      // Necesitamos acceder a la tabla ordenes del backend que tiene payment_status
      // Como estamos usando el esquema de nextjs_space, vamos a hacer un query raw
      // O mapear los estados conocidos
    }

    // Obtener órdenes de la base de datos
    const ordenes = await prisma.orden.findMany({
      where,
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
      },
      orderBy: {
        fechaCreacion: 'desc'
      }
    })

    // Transformar a formato esperado por el frontend
    const orders = ordenes.map(orden => {
      // Obtener información del primer item (simplificación)
      const primerItem = orden.items && orden.items.length > 0 ? orden.items[0] : null
      
      return {
        id: orden.idOrden.toString(),
        usuario_celular: orden.celularUsuario,
        usuario_nombre: orden.usuario?.nombre || '',
        usuario_email: orden.usuario?.email || '',
        servicio_nombre: primerItem?.plan?.servicio?.nombre || 'N/A',
        plan_nombre: primerItem?.plan?.nombrePlan || 'N/A',
        plan_duracion_meses: primerItem?.plan?.duracionMeses || 0,
        total: Number(orden.montoTotal),
        estado: orden.estado,
        payment_status: 'pending', // Por defecto, ya que el esquema de nextjs no tiene este campo
        created_at: orden.fechaCreacion.toISOString(),
        updated_at: orden.fechaCreacion.toISOString(), // Usar fechaCreacion por ahora
        comprobante_url: null
      }
    })

    return NextResponse.json({ success: true, data: orders })
  } catch (error: any) {
    console.error('[Admin Orders GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener órdenes', message: error.message },
      { status: 500 }
    )
  }
}

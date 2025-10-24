
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

// GET - Obtener todas las órdenes
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
      const primerItem = orden.items[0]
      
      return {
        id: orden.idOrden.toString(),
        usuario_celular: orden.celularUsuario,
        usuario_nombre: orden.usuario.nombre || '',
        usuario_email: orden.usuario.email || '',
        servicio_nombre: primerItem ? primerItem.plan.servicio.nombre : 'N/A',
        plan_nombre: primerItem ? primerItem.plan.nombrePlan : 'N/A',
        plan_duracion_meses: primerItem ? primerItem.plan.duracionMeses : 0,
        total: Number(orden.montoTotal),
        estado: orden.estado,
        payment_status: 'pending', // Por defecto, ya que el esquema de nextjs no tiene este campo
        created_at: orden.fechaCreacion.toISOString(),
        updated_at: orden.fechaCreacion.toISOString(), // Usar fechaCreacion por ahora
        comprobante_url: null
      }
    })

    return NextResponse.json(orders)
  } catch (error: any) {
    console.error('[Admin Orders GET] Error:', error)
    return NextResponse.json(
      { error: 'Error al obtener órdenes', message: error.message },
      { status: 500 }
    )
  }
}


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

// PUT - Actualizar servicio
export async function PUT(
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

    const body = await request.json()
    const { nombre, descripcion, logo_url, activo } = body
    const servicioId = parseInt(params.id)

    if (isNaN(servicioId)) {
      return NextResponse.json(
        { error: 'ID de servicio inválido' },
        { status: 400 }
      )
    }

    // Validaciones
    if (nombre && nombre.trim().length < 3) {
      return NextResponse.json(
        { error: 'El nombre del servicio debe tener al menos 3 caracteres' },
        { status: 400 }
      )
    }

    // Verificar que el servicio existe
    const servicioExistente = await prisma.servicio.findUnique({
      where: { idServicio: servicioId }
    })

    if (!servicioExistente) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Actualizar servicio
    const servicioActualizado = await prisma.servicio.update({
      where: { idServicio: servicioId },
      data: {
        ...(nombre && { nombre: nombre.trim() }),
        ...(descripcion !== undefined && { descripcion: descripcion.trim() }),
        ...(logo_url !== undefined && { logoUrl: logo_url ? logo_url.trim() : null }),
        ...(activo !== undefined && { activo })
      }
    })

    // Transformar a formato esperado
    const service = {
      id: servicioActualizado.idServicio.toString(),
      nombre: servicioActualizado.nombre,
      descripcion: servicioActualizado.descripcion || '',
      logo_url: servicioActualizado.logoUrl || '',
      activo: servicioActualizado.activo,
      created_at: servicioActualizado.fechaCreacion.toISOString()
    }

    return NextResponse.json(service)
  } catch (error: any) {
    console.error('[Admin Services PUT] Error:', error)
    return NextResponse.json(
      { error: 'Error al actualizar servicio', message: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar servicio
export async function DELETE(
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

    const servicioId = parseInt(params.id)

    if (isNaN(servicioId)) {
      return NextResponse.json(
        { error: 'ID de servicio inválido' },
        { status: 400 }
      )
    }

    // Verificar que el servicio existe
    const servicioExistente = await prisma.servicio.findUnique({
      where: { idServicio: servicioId },
      include: {
        planes: true
      }
    })

    if (!servicioExistente) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si tiene planes asociados
    if (servicioExistente.planes.length > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar el servicio porque tiene planes asociados' },
        { status: 400 }
      )
    }

    // Eliminar servicio
    await prisma.servicio.delete({
      where: { idServicio: servicioId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Admin Services DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Error al eliminar servicio', message: error.message },
      { status: 500 }
    )
  }
}


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

// PUT - Actualizar plan
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
    const { servicio_id, nombre, duracion_meses, precio, slots_disponibles, activo } = body
    const planId = parseInt(params.id)

    if (isNaN(planId)) {
      return NextResponse.json(
        { success: false, error: 'ID de plan inválido' },
        { status: 400 }
      )
    }

    // Validaciones
    if (nombre && nombre.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'El nombre del plan debe tener al menos 3 caracteres' },
        { status: 400 }
      )
    }

    if (duracion_meses && (duracion_meses < 1 || duracion_meses > 36)) {
      return NextResponse.json(
        { success: false, error: 'La duración debe estar entre 1 y 36 meses' },
        { status: 400 }
      )
    }

    if (precio && precio <= 0) {
      return NextResponse.json(
        { success: false, error: 'El precio debe ser mayor a 0' },
        { status: 400 }
      )
    }

    // Verificar que el plan existe
    const planExistente = await prisma.servicePlan.findUnique({
      where: { idPlan: planId },
      include: {
        servicio: true
      }
    })

    if (!planExistente) {
      return NextResponse.json(
        { success: false, error: 'Plan no encontrado' },
        { status: 404 }
      )
    }

    // Si se está cambiando el servicio, verificar que existe
    if (servicio_id && parseInt(servicio_id) !== planExistente.idServicio) {
      const servicioNuevo = await prisma.servicio.findUnique({
        where: { idServicio: parseInt(servicio_id) }
      })

      if (!servicioNuevo) {
        return NextResponse.json(
          { success: false, error: 'El servicio no existe' },
          { status: 404 }
        )
      }
    }

    // Calcular días si cambia la duración
    const duracionDias = duracion_meses ? duracion_meses * 30 : undefined

    // Actualizar plan
    const planActualizado = await prisma.servicePlan.update({
      where: { idPlan: planId },
      data: {
        ...(servicio_id && { idServicio: parseInt(servicio_id) }),
        ...(nombre && { nombrePlan: nombre.trim() }),
        ...(duracion_meses && { duracionMeses: duracion_meses }),
        ...(duracionDias && { duracionDias }),
        ...(precio && { 
          costo: precio,
          precioVenta: precio
        }),
        ...(activo !== undefined && { activo })
      },
      include: {
        servicio: true
      }
    })

    // Transformar a formato esperado
    const plan = {
      id: planActualizado.idPlan.toString(),
      servicio_id: planActualizado.idServicio.toString(),
      servicio_nombre: planActualizado.servicio.nombre,
      nombre: planActualizado.nombrePlan,
      duracion_meses: planActualizado.duracionMeses,
      precio: Number(planActualizado.precioVenta || planActualizado.costo),
      slots_disponibles: slots_disponibles || 4,
      activo: planActualizado.activo,
      created_at: planActualizado.fechaCreacion.toISOString()
    }

    return NextResponse.json({ success: true, data: plan })
  } catch (error: any) {
    console.error('[Admin Plans PUT] Error:', error)
    
    // Manejar error de unique constraint
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Ya existe un plan con esta duración para este servicio' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al actualizar plan', message: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar plan
export async function DELETE(
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

    const planId = parseInt(params.id)

    if (isNaN(planId)) {
      return NextResponse.json(
        { success: false, error: 'ID de plan inválido' },
        { status: 400 }
      )
    }

    // Verificar que el plan existe
    const planExistente = await prisma.servicePlan.findUnique({
      where: { idPlan: planId },
      include: {
        cuentas: true,
        orderItems: true
      }
    })

    if (!planExistente) {
      return NextResponse.json(
        { success: false, error: 'Plan no encontrado' },
        { status: 404 }
      )
    }

    // Verificar si tiene cuentas asociadas
    if (planExistente.cuentas.length > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar el plan porque tiene cuentas asociadas' },
        { status: 400 }
      )
    }

    // Verificar si tiene órdenes asociadas
    if (planExistente.orderItems.length > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar el plan porque tiene órdenes asociadas' },
        { status: 400 }
      )
    }

    // Eliminar plan
    await prisma.servicePlan.delete({
      where: { idPlan: planId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Admin Plans DELETE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar plan', message: error.message },
      { status: 500 }
    )
  }
}

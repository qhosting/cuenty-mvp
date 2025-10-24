
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'cuenty-admin-secret-change-in-production'

// Funciones de encriptación
function encrypt(text: string): string {
  try {
    return Buffer.from(text).toString('base64')
  } catch (error) {
    console.error('Error al encriptar:', error)
    return text
  }
}

function decrypt(encrypted: string): string {
  try {
    return Buffer.from(encrypted, 'base64').toString('utf-8')
  } catch (error) {
    console.error('Error al desencriptar:', error)
    return encrypted
  }
}

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

// PUT - Actualizar cuenta
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
    const { servicio_id, email, password, perfil, slots_totales, slots_usados, activo } = body
    const cuentaId = parseInt(params.id)

    if (isNaN(cuentaId)) {
      return NextResponse.json(
        { success: false, error: 'ID de cuenta inválido' },
        { status: 400 }
      )
    }

    // Verificar que la cuenta existe
    const cuentaExistente = await prisma.inventarioCuenta.findUnique({
      where: { idCuenta: cuentaId },
      include: {
        plan: {
          include: {
            servicio: true
          }
        }
      }
    })

    if (!cuentaExistente) {
      return NextResponse.json(
        { success: false, error: 'Cuenta no encontrada' },
        { status: 404 }
      )
    }

    // Preparar datos de actualización
    const updateData: any = {}

    if (email) {
      updateData.correoEncriptado = encrypt(email.trim())
    }

    if (password) {
      updateData.contrasenaEncriptada = encrypt(password.trim())
    }

    if (perfil) {
      updateData.perfil = perfil.trim()
    }

    if (activo !== undefined) {
      updateData.estado = activo ? 'disponible' : 'bloqueada'
    }

    // Si se cambia el servicio, necesitamos actualizar el plan
    if (servicio_id && parseInt(servicio_id) !== cuentaExistente.plan.servicio.idServicio) {
      const servicioId = parseInt(servicio_id)
      
      // Obtener el primer plan del nuevo servicio
      const planes = await prisma.servicePlan.findMany({
        where: { idServicio: servicioId },
        take: 1
      })

      if (planes.length === 0) {
        return NextResponse.json(
          { success: false, error: 'El servicio no tiene planes asociados' },
          { status: 400 }
        )
      }

      updateData.idPlan = planes[0].idPlan
    }

    // Actualizar cuenta
    const cuentaActualizada = await prisma.inventarioCuenta.update({
      where: { idCuenta: cuentaId },
      data: updateData,
      include: {
        plan: {
          include: {
            servicio: true
          }
        }
      }
    })

    // Transformar a formato esperado
    const account = {
      id: cuentaActualizada.idCuenta.toString(),
      servicio_id: cuentaActualizada.plan.servicio.idServicio.toString(),
      servicio_nombre: cuentaActualizada.plan.servicio.nombre,
      email: decrypt(cuentaActualizada.correoEncriptado),
      password: decrypt(cuentaActualizada.contrasenaEncriptada),
      perfil: cuentaActualizada.perfil || 'Perfil 1',
      slots_totales: slots_totales || 4,
      slots_usados: slots_usados || 0,
      activo: cuentaActualizada.estado === 'disponible' || cuentaActualizada.estado === 'asignada',
      created_at: cuentaActualizada.fechaAgregado.toISOString()
    }

    return NextResponse.json({ success: true, data: account })
  } catch (error: any) {
    console.error('[Admin Accounts PUT] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar cuenta', message: error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar cuenta
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

    const cuentaId = parseInt(params.id)

    if (isNaN(cuentaId)) {
      return NextResponse.json(
        { success: false, error: 'ID de cuenta inválido' },
        { status: 400 }
      )
    }

    // Verificar que la cuenta existe
    const cuentaExistente = await prisma.inventarioCuenta.findUnique({
      where: { idCuenta: cuentaId },
      include: {
        orderItems: true
      }
    })

    if (!cuentaExistente) {
      return NextResponse.json(
        { success: false, error: 'Cuenta no encontrada' },
        { status: 404 }
      )
    }

    // Verificar si tiene órdenes asignadas
    if (cuentaExistente.orderItems.length > 0) {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar la cuenta porque tiene órdenes asignadas' },
        { status: 400 }
      )
    }

    // Eliminar cuenta
    await prisma.inventarioCuenta.delete({
      where: { idCuenta: cuentaId }
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('[Admin Accounts DELETE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar cuenta', message: error.message },
      { status: 500 }
    )
  }
}

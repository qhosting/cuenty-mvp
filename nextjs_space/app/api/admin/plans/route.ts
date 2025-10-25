
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

// GET - Obtener todos los planes
export async function GET(request: NextRequest) {
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

    // Obtener planes de la base de datos con información del servicio
    const planes = await prisma.servicePlan.findMany({
      include: {
        servicio: true
      },
      orderBy: {
        fechaCreacion: 'desc'
      }
    })

    // Transformar a formato esperado por el frontend
    const plans = planes.map(plan => ({
      id: plan.idPlan.toString(),
      servicio_id: plan.idServicio.toString(),
      servicio_nombre: plan.servicio.nombre,
      nombre: plan.nombrePlan,
      duracion_meses: plan.duracionMeses,
      precio: Number(plan.precioVenta || plan.costo),
      slots_disponibles: 4, // Valor por defecto, podría calcularse de inventario
      activo: plan.activo,
      created_at: plan.fechaCreacion.toISOString()
    }))

    return NextResponse.json({ success: true, data: plans })
  } catch (error: any) {
    console.error('[Admin Plans GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener planes', message: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo plan
export async function POST(request: NextRequest) {
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

    const body = await request.json()
    const { servicio_id, nombre, duracion_meses, precio, slots_disponibles, activo } = body

    // Validaciones
    if (!servicio_id) {
      return NextResponse.json(
        { success: false, error: 'El ID del servicio es requerido' },
        { status: 400 }
      )
    }

    if (!nombre || nombre.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'El nombre del plan debe tener al menos 3 caracteres' },
        { status: 400 }
      )
    }

    if (!duracion_meses || duracion_meses < 1 || duracion_meses > 36) {
      return NextResponse.json(
        { success: false, error: 'La duración debe estar entre 1 y 36 meses' },
        { status: 400 }
      )
    }

    if (!precio || precio <= 0) {
      return NextResponse.json(
        { success: false, error: 'El precio debe ser mayor a 0' },
        { status: 400 }
      )
    }

    const servicioId = parseInt(servicio_id)
    if (isNaN(servicioId)) {
      return NextResponse.json(
        { success: false, error: 'ID de servicio inválido' },
        { status: 400 }
      )
    }

    // Verificar que el servicio existe
    const servicioExistente = await prisma.servicio.findUnique({
      where: { idServicio: servicioId }
    })

    if (!servicioExistente) {
      return NextResponse.json(
        { success: false, error: 'El servicio no existe' },
        { status: 404 }
      )
    }

    // Calcular días (considerando meses de 30 días)
    const duracionDias = duracion_meses * 30

    // Crear plan
    const nuevoPlan = await prisma.servicePlan.create({
      data: {
        idServicio: servicioId,
        nombrePlan: nombre.trim(),
        duracionMeses: duracion_meses,
        duracionDias: duracionDias,
        costo: precio,
        margenGanancia: 0,
        precioVenta: precio,
        descripcion: `Plan de ${duracion_meses} ${duracion_meses === 1 ? 'mes' : 'meses'}`,
        activo: activo !== undefined ? activo : true
      },
      include: {
        servicio: true
      }
    })

    // Transformar a formato esperado
    const plan = {
      id: nuevoPlan.idPlan.toString(),
      servicio_id: nuevoPlan.idServicio.toString(),
      servicio_nombre: nuevoPlan.servicio.nombre,
      nombre: nuevoPlan.nombrePlan,
      duracion_meses: nuevoPlan.duracionMeses,
      precio: Number(nuevoPlan.precioVenta || nuevoPlan.costo),
      slots_disponibles: slots_disponibles || 4,
      activo: nuevoPlan.activo,
      created_at: nuevoPlan.fechaCreacion.toISOString()
    }

    return NextResponse.json({ success: true, data: plan }, { status: 201 })
  } catch (error: any) {
    console.error('[Admin Plans POST] Error:', error)
    
    // Manejar error de unique constraint (servicio + duración)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'Ya existe un plan con esta duración para este servicio' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { success: false, error: 'Error al crear plan', message: error.message },
      { status: 500 }
    )
  }
}

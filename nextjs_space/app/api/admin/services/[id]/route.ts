
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

// PUT - Actualizar servicio
export async function PUT(
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
        { success: false, error: 'No autorizado', message: 'Token de autenticación inválido o expirado' },
        { status: 401 }
      )
    }

    // Parsear el body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      return NextResponse.json(
        { success: false, error: 'JSON inválido', message: 'El cuerpo de la solicitud no es un JSON válido' },
        { status: 400 }
      )
    }

    const { nombre, descripcion, logo_url, activo } = body
    const servicioId = parseInt(params.id)

    if (isNaN(servicioId)) {
      return NextResponse.json(
        { success: false, error: 'ID de servicio inválido', message: 'El ID proporcionado no es un número válido' },
        { status: 400 }
      )
    }

    // Validaciones
    if (nombre !== undefined) {
      if (typeof nombre !== 'string') {
        return NextResponse.json(
          { success: false, error: 'El nombre debe ser un texto', message: 'El tipo de dato del nombre no es válido' },
          { status: 400 }
        )
      }
      if (nombre.trim().length < 3) {
        return NextResponse.json(
          { success: false, error: 'El nombre del servicio debe tener al menos 3 caracteres', message: 'El nombre proporcionado es demasiado corto' },
          { status: 400 }
        )
      }
      if (nombre.trim().length > 100) {
        return NextResponse.json(
          { success: false, error: 'El nombre del servicio no puede exceder 100 caracteres', message: 'El nombre proporcionado es demasiado largo' },
          { status: 400 }
        )
      }
    }

    if (descripcion !== undefined && typeof descripcion === 'string' && descripcion.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'La descripción no puede estar vacía', message: 'Debes proporcionar una descripción con contenido' },
        { status: 400 }
      )
    }

    // Verificar que el servicio existe
    const servicioExistente = await prisma.servicio.findUnique({
      where: { idServicio: servicioId }
    })

    if (!servicioExistente) {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado', message: `No existe un servicio con el ID ${servicioId}` },
        { status: 404 }
      )
    }

    // Si se está actualizando el nombre, verificar que no exista otro servicio con ese nombre
    if (nombre && nombre.trim() !== servicioExistente.nombre) {
      const nombreDuplicado = await prisma.servicio.findFirst({
        where: {
          nombre: {
            equals: nombre.trim(),
            mode: 'insensitive'
          },
          idServicio: {
            not: servicioId
          }
        }
      })

      if (nombreDuplicado) {
        return NextResponse.json(
          { success: false, error: 'Ya existe un servicio con ese nombre', message: `El servicio "${nombre.trim()}" ya está registrado en el sistema` },
          { status: 409 }
        )
      }
    }

    // Construir objeto de actualización
    const updateData: any = {}
    if (nombre !== undefined) updateData.nombre = nombre.trim()
    if (descripcion !== undefined) updateData.descripcion = descripcion.trim()
    if (logo_url !== undefined) {
      updateData.logoUrl = logo_url && typeof logo_url === 'string' && logo_url.trim() ? logo_url.trim() : null
    }
    if (activo !== undefined) updateData.activo = Boolean(activo)

    // Actualizar servicio
    const servicioActualizado = await prisma.servicio.update({
      where: { idServicio: servicioId },
      data: updateData
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

    console.log('[Admin Services PUT] Servicio actualizado exitosamente:', service.id)
    return NextResponse.json({ success: true, data: service, message: 'Servicio actualizado exitosamente' })
  } catch (error: any) {
    console.error('[Admin Services PUT] Error:', error)
    
    // Manejo específico de errores de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'El servicio ya existe', message: 'Ya existe un servicio con esos datos en el sistema' },
        { status: 409 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado', message: 'El servicio que intentas actualizar no existe' },
        { status: 404 }
      )
    }

    // Error de conexión a la base de datos
    if (error.message && error.message.includes('connect')) {
      return NextResponse.json(
        { success: false, error: 'Error de conexión a la base de datos', message: 'No se pudo conectar con la base de datos. Verifica la configuración.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al actualizar servicio', message: error.message || 'Error interno del servidor' },
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
    const adminPayload = await requireAdmin(request)
    if (adminPayload instanceof NextResponse) {
      return adminPayload
    }
      return NextResponse.json(
        { success: false, error: 'No autorizado', message: 'Token de autenticación inválido o expirado' },
        { status: 401 }
      )
    }

    const servicioId = parseInt(params.id)

    if (isNaN(servicioId)) {
      return NextResponse.json(
        { success: false, error: 'ID de servicio inválido', message: 'El ID proporcionado no es un número válido' },
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
        { success: false, error: 'Servicio no encontrado', message: `No existe un servicio con el ID ${servicioId}` },
        { status: 404 }
      )
    }

    // Verificar si tiene planes asociados
    if (servicioExistente.planes.length > 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'No se puede eliminar el servicio porque tiene planes asociados', 
          message: `El servicio "${servicioExistente.nombre}" tiene ${servicioExistente.planes.length} plan(es) asociado(s). Elimina los planes primero.` 
        },
        { status: 400 }
      )
    }

    // Eliminar servicio
    await prisma.servicio.delete({
      where: { idServicio: servicioId }
    })

    console.log('[Admin Services DELETE] Servicio eliminado exitosamente:', servicioId)
    return NextResponse.json({ success: true, message: 'Servicio eliminado exitosamente' })
  } catch (error: any) {
    console.error('[Admin Services DELETE] Error:', error)
    
    // Manejo específico de errores de Prisma
    if (error.code === 'P2025') {
      return NextResponse.json(
        { success: false, error: 'Servicio no encontrado', message: 'El servicio que intentas eliminar no existe' },
        { status: 404 }
      )
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'No se puede eliminar el servicio', message: 'El servicio tiene dependencias que deben eliminarse primero' },
        { status: 400 }
      )
    }

    // Error de conexión a la base de datos
    if (error.message && error.message.includes('connect')) {
      return NextResponse.json(
        { success: false, error: 'Error de conexión a la base de datos', message: 'No se pudo conectar con la base de datos. Verifica la configuración.' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al eliminar servicio', message: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

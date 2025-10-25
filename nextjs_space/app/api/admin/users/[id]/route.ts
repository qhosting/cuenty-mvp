import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdmin } from '@/lib/admin-middleware'
import bcrypt from 'bcryptjs'


// Verificar token de autenticación

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, ADMIN_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

// GET - Obtener un usuario específico
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

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido', message: 'El ID proporcionado no es válido' },
        { status: 400 }
      )
    }

    const usuario = await prisma.cliente.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        whatsapp: true,
        emailVerificado: true,
        activo: true,
        fechaCreacion: true,
        fechaActualizacion: true,
        ultimoAcceso: true,
      },
    })

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado', message: `No se encontró el usuario con ID ${id}` },
        { status: 404 }
      )
    }

    return NextResponse.json({ success: true, data: usuario })
  } catch (error: any) {
    console.error('[Admin Users GET by ID] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener usuario', message: error.message },
      { status: 500 }
    )
  }
}

// PUT - Actualizar usuario
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

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido', message: 'El ID proporcionado no es válido' },
        { status: 400 }
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

    const {
      email,
      nombre,
      apellido,
      telefono,
      whatsapp,
      email_verificado,
      activo,
      password,
    } = body

    // Verificar que el usuario existe
    const usuarioExistente = await prisma.cliente.findUnique({
      where: { id },
    })

    if (!usuarioExistente) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado', message: `No se encontró el usuario con ID ${id}` },
        { status: 404 }
      )
    }

    // Si se está actualizando el email, verificar que no esté en uso
    if (email && email.toLowerCase() !== usuarioExistente.email.toLowerCase()) {
      const emailEnUso = await prisma.cliente.findUnique({
        where: { email: email.trim().toLowerCase() },
      })

      if (emailEnUso) {
        return NextResponse.json(
          { success: false, error: 'El email ya está en uso', message: `El email ${email} ya está registrado por otro usuario` },
          { status: 409 }
        )
      }
    }

    // Preparar datos a actualizar
    const dataToUpdate: any = {
      fechaActualizacion: new Date(),
    }

    if (email) {
      // Validar formato de email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(email)) {
        return NextResponse.json(
          { success: false, error: 'El formato del email no es válido', message: 'Por favor proporciona un email válido' },
          { status: 400 }
        )
      }
      dataToUpdate.email = email.trim().toLowerCase()
    }

    if (nombre) {
      if (nombre.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'El nombre no puede estar vacío', message: 'Debes proporcionar un nombre válido' },
          { status: 400 }
        )
      }
      dataToUpdate.nombre = nombre.trim()
    }

    if (apellido) {
      if (apellido.trim().length === 0) {
        return NextResponse.json(
          { success: false, error: 'El apellido no puede estar vacío', message: 'Debes proporcionar un apellido válido' },
          { status: 400 }
        )
      }
      dataToUpdate.apellido = apellido.trim()
    }

    if (telefono !== undefined) {
      dataToUpdate.telefono = telefono ? telefono.trim() : null
    }

    if (whatsapp !== undefined) {
      dataToUpdate.whatsapp = whatsapp ? whatsapp.trim() : null
    }

    if (email_verificado !== undefined) {
      dataToUpdate.emailVerificado = email_verificado
    }

    if (activo !== undefined) {
      dataToUpdate.activo = activo
    }

    // Si se proporciona una nueva contraseña, hashearla
    if (password) {
      if (password.length < 6) {
        return NextResponse.json(
          { success: false, error: 'La contraseña debe tener al menos 6 caracteres', message: 'La contraseña proporcionada es demasiado corta' },
          { status: 400 }
        )
      }
      dataToUpdate.password = await bcrypt.hash(password, 10)
    }

    // Actualizar usuario
    const usuarioActualizado = await prisma.cliente.update({
      where: { id },
      data: dataToUpdate,
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        telefono: true,
        whatsapp: true,
        emailVerificado: true,
        activo: true,
        fechaCreacion: true,
        fechaActualizacion: true,
      },
    })

    console.log('[Admin Users PUT] Usuario actualizado exitosamente:', usuarioActualizado.id)
    return NextResponse.json({
      success: true,
      data: usuarioActualizado,
      message: 'Usuario actualizado exitosamente',
    })
  } catch (error: any) {
    console.error('[Admin Users PUT] Error:', error)

    // Manejo específico de errores de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'El email ya está en uso', message: 'Ya existe otro usuario con ese email' },
        { status: 409 }
      )
    }

    if (error.message && error.message.includes('connect')) {
      return NextResponse.json(
        { success: false, error: 'Error de conexión a la base de datos', message: 'No se pudo conectar con la base de datos' },
        { status: 503 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Error al actualizar usuario', message: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

// DELETE - Desactivar usuario
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
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const id = parseInt(params.id)
    if (isNaN(id)) {
      return NextResponse.json(
        { success: false, error: 'ID inválido', message: 'El ID proporcionado no es válido' },
        { status: 400 }
      )
    }

    // Verificar que el usuario existe
    const usuario = await prisma.cliente.findUnique({
      where: { id },
    })

    if (!usuario) {
      return NextResponse.json(
        { success: false, error: 'Usuario no encontrado', message: `No se encontró el usuario con ID ${id}` },
        { status: 404 }
      )
    }

    // Desactivar usuario en lugar de eliminar
    const usuarioDesactivado = await prisma.cliente.update({
      where: { id },
      data: {
        activo: false,
        fechaActualizacion: new Date(),
      },
      select: {
        id: true,
        email: true,
        nombre: true,
        apellido: true,
        activo: true,
      },
    })

    console.log('[Admin Users DELETE] Usuario desactivado exitosamente:', usuarioDesactivado.id)
    return NextResponse.json({
      success: true,
      data: usuarioDesactivado,
      message: 'Usuario desactivado exitosamente',
    })
  } catch (error: any) {
    console.error('[Admin Users DELETE] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al desactivar usuario', message: error.message },
      { status: 500 }
    )
  }
}

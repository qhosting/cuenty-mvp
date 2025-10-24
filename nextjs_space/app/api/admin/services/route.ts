
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

// GET - Obtener todos los servicios
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = verifyToken(request)
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener servicios de la base de datos
    const servicios = await prisma.servicio.findMany({
      orderBy: {
        fechaCreacion: 'desc'
      }
    })

    // Transformar a formato esperado por el frontend
    const services = servicios.map(servicio => ({
      id: servicio.idServicio.toString(),
      nombre: servicio.nombre,
      descripcion: servicio.descripcion || '',
      logo_url: servicio.logoUrl || '',
      activo: servicio.activo,
      created_at: servicio.fechaCreacion.toISOString()
    }))

    return NextResponse.json({ success: true, data: services })
  } catch (error: any) {
    console.error('[Admin Services GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener servicios', message: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo servicio
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const user = verifyToken(request)
    if (!user) {
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

    // Validaciones
    if (!nombre || typeof nombre !== 'string') {
      return NextResponse.json(
        { success: false, error: 'El nombre del servicio es requerido', message: 'Debes proporcionar un nombre válido para el servicio' },
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

    if (!descripcion || typeof descripcion !== 'string') {
      return NextResponse.json(
        { success: false, error: 'La descripción es requerida', message: 'Debes proporcionar una descripción válida para el servicio' },
        { status: 400 }
      )
    }

    if (descripcion.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'La descripción no puede estar vacía', message: 'Debes proporcionar una descripción con contenido' },
        { status: 400 }
      )
    }

    // Validar que no exista un servicio con el mismo nombre
    const servicioExistente = await prisma.servicio.findFirst({
      where: {
        nombre: {
          equals: nombre.trim(),
          mode: 'insensitive'
        }
      }
    })

    if (servicioExistente) {
      return NextResponse.json(
        { success: false, error: 'Ya existe un servicio con ese nombre', message: `El servicio "${nombre.trim()}" ya está registrado en el sistema` },
        { status: 409 }
      )
    }

    // Crear servicio
    const nuevoServicio = await prisma.servicio.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        logoUrl: logo_url && typeof logo_url === 'string' && logo_url.trim() ? logo_url.trim() : null,
        activo: activo !== undefined ? Boolean(activo) : true
      }
    })

    // Transformar a formato esperado
    const service = {
      id: nuevoServicio.idServicio.toString(),
      nombre: nuevoServicio.nombre,
      descripcion: nuevoServicio.descripcion || '',
      logo_url: nuevoServicio.logoUrl || '',
      activo: nuevoServicio.activo,
      created_at: nuevoServicio.fechaCreacion.toISOString()
    }

    console.log('[Admin Services POST] Servicio creado exitosamente:', service.id)
    return NextResponse.json({ success: true, data: service, message: 'Servicio creado exitosamente' }, { status: 201 })
  } catch (error: any) {
    console.error('[Admin Services POST] Error:', error)
    
    // Manejo específico de errores de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'El servicio ya existe', message: 'Ya existe un servicio con esos datos en el sistema' },
        { status: 409 }
      )
    }

    if (error.code === 'P2003') {
      return NextResponse.json(
        { success: false, error: 'Error de relación en la base de datos', message: 'Hay un problema con las relaciones de datos' },
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
      { success: false, error: 'Error al crear servicio', message: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

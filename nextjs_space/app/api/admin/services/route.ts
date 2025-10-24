
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
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { nombre, descripcion, logo_url, activo } = body

    // Validaciones
    if (!nombre || nombre.trim().length < 3) {
      return NextResponse.json(
        { success: false, error: 'El nombre del servicio debe tener al menos 3 caracteres' },
        { status: 400 }
      )
    }

    if (!descripcion || descripcion.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'La descripción es requerida' },
        { status: 400 }
      )
    }

    // Crear servicio
    const nuevoServicio = await prisma.servicio.create({
      data: {
        nombre: nombre.trim(),
        descripcion: descripcion.trim(),
        logoUrl: logo_url ? logo_url.trim() : null,
        activo: activo !== undefined ? activo : true
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

    return NextResponse.json({ success: true, data: service }, { status: 201 })
  } catch (error: any) {
    console.error('[Admin Services POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear servicio', message: error.message },
      { status: 500 }
    )
  }
}

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

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

// GET - Obtener todos los usuarios (clientes)
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

    // Obtener parámetros de búsqueda
    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const activo = searchParams.get('activo')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    const skip = (page - 1) * limit

    // Construir filtro
    const where: any = {}

    if (search) {
      where.OR = [
        { nombre: { contains: search, mode: 'insensitive' } },
        { apellido: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { telefono: { contains: search } },
      ]
    }

    if (activo !== null && activo !== undefined && activo !== '') {
      where.activo = activo === 'true'
    }

    // Obtener usuarios y total
    const [usuarios, total] = await Promise.all([
      prisma.clientes.findMany({
        where,
        skip,
        take: limit,
        orderBy: { fechaCreacion: 'desc' },
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
          ultimoAcceso: true,
        },
      }),
      prisma.clientes.count({ where }),
    ])

    return NextResponse.json({
      success: true,
      data: usuarios,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error: any) {
    console.error('[Admin Users GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener usuarios', message: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo usuario
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

    const {
      email,
      password,
      nombre,
      apellido,
      telefono,
      whatsapp,
      email_verificado = false,
      activo = true,
    } = body

    // Validaciones
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { success: false, error: 'El email es requerido', message: 'Debes proporcionar un email válido' },
        { status: 400 }
      )
    }

    if (!password || typeof password !== 'string') {
      return NextResponse.json(
        { success: false, error: 'La contraseña es requerida', message: 'Debes proporcionar una contraseña' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { success: false, error: 'La contraseña debe tener al menos 6 caracteres', message: 'La contraseña proporcionada es demasiado corta' },
        { status: 400 }
      )
    }

    if (!nombre || typeof nombre !== 'string' || nombre.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'El nombre es requerido', message: 'Debes proporcionar un nombre válido' },
        { status: 400 }
      )
    }

    if (!apellido || typeof apellido !== 'string' || apellido.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'El apellido es requerido', message: 'Debes proporcionar un apellido válido' },
        { status: 400 }
      )
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, error: 'El formato del email no es válido', message: 'Por favor proporciona un email válido' },
        { status: 400 }
      )
    }

    // Verificar si el email ya existe
    const existente = await prisma.clientes.findUnique({
      where: { email: email.trim().toLowerCase() },
    })

    if (existente) {
      return NextResponse.json(
        { success: false, error: 'El email ya está registrado', message: `El email ${email} ya está en uso por otro usuario` },
        { status: 409 }
      )
    }

    // Hashear contraseña
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario
    const nuevoUsuario = await prisma.clientes.create({
      data: {
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        telefono: telefono ? telefono.trim() : null,
        whatsapp: whatsapp ? whatsapp.trim() : null,
        emailVerificado: email_verificado,
        activo,
        fechaActualizacion: new Date(),
      },
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
      },
    })

    console.log('[Admin Users POST] Usuario creado exitosamente:', nuevoUsuario.id)
    return NextResponse.json(
      { success: true, data: nuevoUsuario, message: 'Usuario creado exitosamente' },
      { status: 201 }
    )
  } catch (error: any) {
    console.error('[Admin Users POST] Error:', error)

    // Manejo específico de errores de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { success: false, error: 'El usuario ya existe', message: 'Ya existe un usuario con ese email' },
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
      { success: false, error: 'Error al crear usuario', message: error.message || 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

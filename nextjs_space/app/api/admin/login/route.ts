
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

// Secreto para firmar los tokens JWT
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'cuenty-admin-secret-change-in-production'

export async function POST(request: NextRequest) {
  try {
    console.log('[Admin Login] Recibida solicitud de login')
    
    // Intentar parsear el body
    let body
    try {
      body = await request.json()
    } catch (parseError) {
      console.error('[Admin Login] Error al parsear el body:', parseError)
      return NextResponse.json(
        { message: 'Error al procesar la solicitud. El formato del body debe ser JSON válido.' },
        { status: 400 }
      )
    }

    const { email, password } = body
    console.log('[Admin Login] Email recibido:', email?.substring(0, 5) + '...')

    // Validar que se enviaron los campos necesarios
    if (!email || !password) {
      console.warn('[Admin Login] Campos faltantes:', { hasEmail: !!email, hasPassword: !!password })
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Validar tipo de datos
    if (typeof email !== 'string' || typeof password !== 'string') {
      console.warn('[Admin Login] Tipos de datos inválidos:', { 
        emailType: typeof email, 
        passwordType: typeof password 
      })
      return NextResponse.json(
        { message: 'Email y contraseña deben ser strings' },
        { status: 400 }
      )
    }

    // Buscar admin en la base de datos por email
    console.log('[Admin Login] Buscando admin en la base de datos...')
    const admin = await prisma.admin.findFirst({
      where: {
        email: email.toLowerCase().trim()
      }
    })

    if (!admin) {
      console.warn('[Admin Login] Admin no encontrado con ese email')
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    console.log('[Admin Login] Admin encontrado, verificando contraseña...')
    
    // Verificar contraseña con bcrypt
    const passwordValida = await bcrypt.compare(password, admin.password)

    if (!passwordValida) {
      console.warn('[Admin Login] Contraseña inválida')
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    console.log('[Admin Login] Credenciales válidas, generando token...')

    // Generar token JWT válido por 24 horas
    const token = jwt.sign(
      { 
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      },
      ADMIN_SECRET,
      { expiresIn: '24h' }
    )

    console.log('[Admin Login] Token generado exitosamente')

    return NextResponse.json({
      success: true,
      token,
      message: 'Login exitoso',
      user: {
        id: admin.id,
        email: admin.email,
        username: admin.username,
        role: 'admin'
      }
    })
  } catch (error) {
    console.error('[Admin Login] Error del servidor:', error)
    return NextResponse.json(
      { 
        message: 'Error del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}


import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Secreto para firmar los tokens JWT
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'cuenty-admin-secret-change-in-production'

// Credenciales de admin (en producción, usar base de datos)
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@cuenty.com',
  password: process.env.ADMIN_PASSWORD || 'admin123'
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Validar que se enviaron los campos necesarios
    if (!email || !password) {
      return NextResponse.json(
        { message: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Verificar credenciales
    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    // Generar token JWT válido por 24 horas
    const token = jwt.sign(
      { 
        email,
        role: 'admin',
        iat: Math.floor(Date.now() / 1000)
      },
      ADMIN_SECRET,
      { expiresIn: '24h' }
    )

    return NextResponse.json({
      success: true,
      token,
      message: 'Login exitoso',
      user: {
        email,
        role: 'admin'
      }
    })
  } catch (error) {
    console.error('Admin login error:', error)
    return NextResponse.json(
      { message: 'Error del servidor' },
      { status: 500 }
    )
  }
}

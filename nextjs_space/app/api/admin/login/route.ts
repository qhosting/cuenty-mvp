
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

// Secreto para firmar los tokens JWT
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'cuenty-admin-secret-change-in-production'

// Credenciales de admin (en producción, usar base de datos)
const ADMIN_CREDENTIALS = {
  email: process.env.ADMIN_EMAIL || 'admin@cuenty.com',
  password: process.env.ADMIN_PASSWORD || 'admin123'
}

// Log de las variables de entorno (solo para debugging, sin mostrar valores sensibles)
console.log('[Admin Login Route] Variables de entorno cargadas:', {
  hasAdminEmail: !!process.env.ADMIN_EMAIL,
  hasAdminPassword: !!process.env.ADMIN_PASSWORD,
  hasAdminSecret: !!process.env.ADMIN_SECRET,
  adminEmailPrefix: process.env.ADMIN_EMAIL?.substring(0, 5) + '...',
})

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

    // Verificar credenciales
    console.log('[Admin Login] Comparando credenciales...')
    console.log('[Admin Login] Email esperado:', ADMIN_CREDENTIALS.email?.substring(0, 5) + '...')
    console.log('[Admin Login] Email recibido:', email?.substring(0, 5) + '...')
    
    if (email !== ADMIN_CREDENTIALS.email || password !== ADMIN_CREDENTIALS.password) {
      console.warn('[Admin Login] Credenciales inválidas')
      return NextResponse.json(
        { message: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    console.log('[Admin Login] Credenciales válidas, generando token...')

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

    console.log('[Admin Login] Token generado exitosamente')

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
    console.error('[Admin Login] Error del servidor:', error)
    return NextResponse.json(
      { 
        message: 'Error del servidor',
        error: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    )
  }
}

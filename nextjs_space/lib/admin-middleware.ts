
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'cuenty-admin-secret-change-in-production'

interface AdminTokenPayload {
  email: string
  role: string
  iat: number
  exp: number
}

/**
 * Verifica si un token de administrador es válido
 */
export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, ADMIN_SECRET) as AdminTokenPayload
    return decoded
  } catch (error) {
    console.error('Token verification error:', error)
    return null
  }
}

/**
 * Middleware para proteger rutas de administrador
 * Retorna null si el token es válido, o una respuesta de error si no lo es
 */
export function adminAuthMiddleware(request: NextRequest): NextResponse | null {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return NextResponse.json(
      { message: 'Token no proporcionado' },
      { status: 401 }
    )
  }

  const token = authHeader.substring(7)
  const payload = verifyAdminToken(token)
  
  if (!payload) {
    return NextResponse.json(
      { message: 'Token inválido o expirado' },
      { status: 401 }
    )
  }

  if (payload.role !== 'admin') {
    return NextResponse.json(
      { message: 'No tienes permisos de administrador' },
      { status: 403 }
    )
  }

  return null // Token válido, continuar
}

/**
 * Función helper para usar en route handlers
 */
export async function requireAdmin(request: NextRequest): Promise<NextResponse | AdminTokenPayload> {
  const error = adminAuthMiddleware(request)
  if (error) return error
  
  const authHeader = request.headers.get('authorization')!
  const token = authHeader.substring(7)
  const payload = verifyAdminToken(token)!
  
  return payload
}

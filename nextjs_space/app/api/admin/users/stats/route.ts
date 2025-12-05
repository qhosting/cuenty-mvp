import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'default-secret'

// Función de autenticación para administradores
async function requireAdmin(request: NextRequest) {
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

// GET - Obtener estadísticas de usuarios
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const adminPayload = await requireAdmin(request)
    if (!adminPayload) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const [totalUsuarios, usuariosActivos, usuariosInactivos, usuariosVerificados] = await Promise.all([
      prisma.cliente.count(),
      prisma.cliente.count({ where: { activo: true } }),
      prisma.cliente.count({ where: { activo: false } }),
      prisma.cliente.count({ where: { emailVerificado: true } }),
    ])

    return NextResponse.json({
      success: true,
      data: {
        total: totalUsuarios,
        activos: usuariosActivos,
        inactivos: usuariosInactivos,
        verificados: usuariosVerificados,
      },
    })
  } catch (error: any) {
    console.error('[Admin Users Stats GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener estadísticas', message: error.message },
      { status: 500 }
    )
  }
}

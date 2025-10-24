

import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import axios from 'axios'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'cuenty-admin-secret-change-in-production'
const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

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

// PATCH - Activar/desactivar configuración de pago
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    // Llamar al backend
    const response = await axios.patch(`${BACKEND_URL}/api/payment-config/${params.id}/toggle`, body, {
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        'Content-Type': 'application/json'
      }
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('[Admin Payment Config PATCH] Error:', error.message)
    return NextResponse.json(
      { success: false, error: 'Error al cambiar estado', message: error.message },
      { status: 500 }
    )
  }
}

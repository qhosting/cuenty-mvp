

import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import jwt from 'jsonwebtoken'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'default-secret'

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

// PUT - Actualizar configuración de pago
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const adminPayload = await requireAdmin(request)
    if (!adminPayload) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()

    // Llamar al backend
    const response = await axios.put(`${BACKEND_URL}/api/payment-config/${params.id}`, body, {
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        'Content-Type': 'application/json'
      }
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('[Admin Payment Config PUT] Error:', error.message)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar configuración', message: error.response?.data?.error || error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar configuración de pago
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Verificar autenticación
    const adminPayload = await requireAdmin(request)
    if (!adminPayload) {
      return NextResponse.json(
        { success: false, error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Llamar al backend
    const response = await axios.delete(`${BACKEND_URL}/api/payment-config/${params.id}`, {
      headers: {
        'Authorization': request.headers.get('authorization') || ''
      }
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('[Admin Payment Config DELETE] Error:', error.message)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar configuración', message: error.message },
      { status: 500 }
    )
  }
}

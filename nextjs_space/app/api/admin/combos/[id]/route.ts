

import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'
import jwt from 'jsonwebtoken'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'
const ADMIN_SECRET = process.env.ADMIN_SECRET || 'default-secret'

// Función para verificar token de autenticación admin
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

// GET - Obtener combo por ID
export async function GET(
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
    const response = await axios.get(`${BACKEND_URL}/api/combos/${params.id}`)

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('[Admin Combos GET by ID] Error:', error.message)
    return NextResponse.json(
      { success: false, error: 'Error al obtener combo', message: error.message },
      { status: error.response?.status || 500 }
    )
  }
}

// PUT - Actualizar combo
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
    const response = await axios.put(`${BACKEND_URL}/api/combos/${params.id}`, body, {
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        'Content-Type': 'application/json'
      }
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('[Admin Combos PUT] Error:', error.message)
    return NextResponse.json(
      { success: false, error: 'Error al actualizar combo', message: error.response?.data?.error || error.message },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar combo
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
    const response = await axios.delete(`${BACKEND_URL}/api/combos/${params.id}`, {
      headers: {
        'Authorization': request.headers.get('authorization') || ''
      }
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('[Admin Combos DELETE] Error:', error.message)
    return NextResponse.json(
      { success: false, error: 'Error al eliminar combo', message: error.message },
      { status: 500 }
    )
  }
}

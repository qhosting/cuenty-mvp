

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

// GET - Obtener todos los combos
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

    // Llamar al backend
    const response = await axios.get(`${BACKEND_URL}/api/combos`, {
      headers: {
        'Authorization': request.headers.get('authorization') || ''
      }
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('[Admin Combos GET] Error:', error.message)
    return NextResponse.json(
      { success: false, error: 'Error al obtener combos', message: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear nuevo combo
export async function POST(request: NextRequest) {
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
    const response = await axios.post(`${BACKEND_URL}/api/combos`, body, {
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        'Content-Type': 'application/json'
      }
    })

    return NextResponse.json(response.data, { status: 201 })
  } catch (error: any) {
    console.error('[Admin Combos POST] Error:', error.message)
    return NextResponse.json(
      { success: false, error: 'Error al crear combo', message: error.response?.data?.error || error.message },
      { status: 500 }
    )
  }
}

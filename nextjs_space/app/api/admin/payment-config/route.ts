

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

// GET - Obtener todas las configuraciones de pago
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

    // Llamar al backend
    const response = await axios.get(`${BACKEND_URL}/api/payment-config`, {
      headers: {
        'Authorization': request.headers.get('authorization') || ''
      }
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('[Admin Payment Config GET] Error:', error.message)
    return NextResponse.json(
      { success: false, error: 'Error al obtener configuraciones de pago', message: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear nueva configuración de pago
export async function POST(request: NextRequest) {
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
    const response = await axios.post(`${BACKEND_URL}/api/payment-config`, body, {
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        'Content-Type': 'application/json'
      }
    })

    return NextResponse.json(response.data, { status: 201 })
  } catch (error: any) {
    console.error('[Admin Payment Config POST] Error:', error.message)
    return NextResponse.json(
      { success: false, error: 'Error al crear configuración de pago', message: error.response?.data?.error || error.message },
      { status: 500 }
    )
  }
}

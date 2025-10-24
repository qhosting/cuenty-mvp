

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

// POST - Calcular totales de un combo
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
    const response = await axios.post(`${BACKEND_URL}/api/combos/calcular-totales`, body, {
      headers: {
        'Authorization': request.headers.get('authorization') || '',
        'Content-Type': 'application/json'
      }
    })

    return NextResponse.json(response.data)
  } catch (error: any) {
    console.error('[Admin Combos Calculate Totals] Error:', error.message)
    return NextResponse.json(
      { success: false, error: 'Error al calcular totales', message: error.message },
      { status: 500 }
    )
  }
}

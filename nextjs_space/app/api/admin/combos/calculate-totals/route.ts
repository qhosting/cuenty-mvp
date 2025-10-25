

import { NextRequest, NextResponse } from 'next/server'
import axios from 'axios'

const BACKEND_URL = process.env.BACKEND_URL || 'http://localhost:5000'

// Verificar token de autenticación

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
    const adminPayload = await requireAdmin(request)
    if (adminPayload instanceof NextResponse) {
      return adminPayload
    }
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

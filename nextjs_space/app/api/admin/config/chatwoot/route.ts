
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient()
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

// GET - Obtener configuración de Chatwoot
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const adminPayload = await requireAdmin(request)
    if (!adminPayload) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    try {
      const result: any[] = await prisma.$queryRaw`SELECT * FROM chatwoot_config WHERE id = 1`
      
      if (result.length === 0) {
        // Si no existe, retornar configuración por defecto
        return NextResponse.json({
          success: true,
          data: {
            chatwoot_url: '',
            access_token: '',
            account_id: ''
          }
        })
      }
      
      return NextResponse.json({
        success: true,
        data: result[0]
      })
    } catch (error: any) {
      // Si la tabla no existe, crear configuración por defecto
      if (error.code === '42P01') {
        return NextResponse.json({
          success: true,
          data: {
            chatwoot_url: '',
            access_token: '',
            account_id: ''
          }
        })
      }
      
      throw error
    }
  } catch (error) {
    console.error('Error al obtener configuración de Chatwoot:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener configuración de Chatwoot' },
      { status: 500 }
    )
  }
}

// POST - Guardar/actualizar configuración de Chatwoot
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const adminPayload = await requireAdmin(request)
    if (!adminPayload) {
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { chatwoot_url, access_token, account_id } = body

    if (!chatwoot_url || !access_token || !account_id) {
      return NextResponse.json(
        { success: false, message: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Crear tabla si no existe
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS chatwoot_config (
        id INTEGER PRIMARY KEY DEFAULT 1,
        chatwoot_url TEXT,
        access_token TEXT,
        account_id VARCHAR(50),
        activo BOOLEAN DEFAULT false,
        fecha_actualizacion TIMESTAMP DEFAULT NOW(),
        CONSTRAINT single_row CHECK (id = 1)
      )
    `
    
    const result: any[] = await prisma.$queryRaw`
      INSERT INTO chatwoot_config (id, chatwoot_url, access_token, account_id, activo, fecha_actualizacion)
      VALUES (1, ${chatwoot_url}, ${access_token}, ${account_id}, true, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        chatwoot_url = ${chatwoot_url},
        access_token = ${access_token},
        account_id = ${account_id},
        activo = true,
        fecha_actualizacion = NOW()
      RETURNING *
    `
    
    return NextResponse.json({
      success: true,
      message: 'Configuración de Chatwoot guardada correctamente',
      data: result[0]
    })
  } catch (error) {
    console.error('Error al guardar configuración de Chatwoot:', error)
    return NextResponse.json(
      { success: false, message: 'Error al guardar configuración de Chatwoot' },
      { status: 500 }
    )
  }
}

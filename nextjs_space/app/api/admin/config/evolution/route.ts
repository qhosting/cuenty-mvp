
import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Verificar token de autenticación

    const token = authHeader.substring(7)
    const decoded = jwt.verify(token, ADMIN_SECRET)
    return decoded
  } catch (error) {
    return null
  }
}

// GET - Obtener configuración de Evolution API
export async function GET(request: NextRequest) {
  try {
    // Verificar autenticación
    const adminPayload = await requireAdmin(request)
    if (adminPayload instanceof NextResponse) {
      return adminPayload
    }
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    try {
      const result: any[] = await prisma.$queryRaw`SELECT * FROM evolution_config WHERE id = 1`
      
      if (result.length === 0) {
        // Si no existe, retornar configuración por defecto
        return NextResponse.json({
          success: true,
          data: {
            api_url: '',
            api_key: '',
            instance_name: ''
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
            api_url: '',
            api_key: '',
            instance_name: ''
          }
        })
      }
      
      throw error
    }
  } catch (error) {
    console.error('Error al obtener configuración de Evolution:', error)
    return NextResponse.json(
      { success: false, message: 'Error al obtener configuración' },
      { status: 500 }
    )
  }
}

// POST - Guardar/actualizar configuración de Evolution API
export async function POST(request: NextRequest) {
  try {
    // Verificar autenticación
    const adminPayload = await requireAdmin(request)
    if (adminPayload instanceof NextResponse) {
      return adminPayload
    }
      return NextResponse.json(
        { success: false, message: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { api_url, api_key, instance_name } = body

    if (!api_url || !api_key || !instance_name) {
      return NextResponse.json(
        { success: false, message: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Crear tabla si no existe
    await prisma.$executeRaw`
      CREATE TABLE IF NOT EXISTS evolution_config (
        id INTEGER PRIMARY KEY DEFAULT 1,
        api_url TEXT,
        api_key TEXT,
        instance_name TEXT,
        activo BOOLEAN DEFAULT false,
        fecha_actualizacion TIMESTAMP DEFAULT NOW(),
        CONSTRAINT single_row CHECK (id = 1)
      )
    `
    
    const result: any[] = await prisma.$queryRaw`
      INSERT INTO evolution_config (id, api_url, api_key, instance_name, activo, fecha_actualizacion)
      VALUES (1, ${api_url}, ${api_key}, ${instance_name}, true, NOW())
      ON CONFLICT (id) 
      DO UPDATE SET 
        api_url = ${api_url},
        api_key = ${api_key},
        instance_name = ${instance_name},
        activo = true,
        fecha_actualizacion = NOW()
      RETURNING *
    `
    
    return NextResponse.json({
      success: true,
      message: 'Configuración de Evolution guardada correctamente',
      data: result[0]
    })
  } catch (error) {
    console.error('Error al guardar configuración de Evolution:', error)
    return NextResponse.json(
      { success: false, message: 'Error al guardar configuración' },
      { status: 500 }
    )
  }
}

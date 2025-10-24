
import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'

const ADMIN_SECRET = process.env.ADMIN_SECRET || 'cuenty-admin-secret-change-in-production'
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'cuenty-encryption-key-32-characters-min'

// Funciones de encriptación simples (deberían usar una librería más robusta en producción)
function encrypt(text: string): string {
  try {
    // Usar una encriptación simple de base64 por ahora
    // En producción, usar crypto.createCipheriv con un key apropiado
    return Buffer.from(text).toString('base64')
  } catch (error) {
    console.error('Error al encriptar:', error)
    return text
  }
}

function decrypt(encrypted: string): string {
  try {
    // Desencriptar desde base64
    return Buffer.from(encrypted, 'base64').toString('utf-8')
  } catch (error) {
    console.error('Error al desencriptar:', error)
    return encrypted
  }
}

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

// GET - Obtener todas las cuentas
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

    // Obtener cuentas de la base de datos
    const cuentas = await prisma.inventarioCuenta.findMany({
      include: {
        plan: {
          include: {
            servicio: true
          }
        }
      },
      orderBy: {
        fechaAgregado: 'desc'
      }
    })

    // Transformar a formato esperado por el frontend
    const accounts = cuentas.map(cuenta => ({
      id: cuenta.idCuenta.toString(),
      servicio_id: cuenta.plan.servicio.idServicio.toString(),
      servicio_nombre: cuenta.plan.servicio.nombre,
      email: decrypt(cuenta.correoEncriptado),
      password: decrypt(cuenta.contrasenaEncriptada),
      pin: cuenta.pin || null,
      perfil: cuenta.perfil || 'Perfil 1',
      slots_totales: 4, // Valor por defecto, podría calcularse
      slots_usados: 0, // Valor por defecto, podría calcularse de orderItems
      activo: cuenta.estado === 'disponible' || cuenta.estado === 'asignada',
      created_at: cuenta.fechaAgregado.toISOString()
    }))

    return NextResponse.json({ success: true, data: accounts })
  } catch (error: any) {
    console.error('[Admin Accounts GET] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al obtener cuentas', message: error.message },
      { status: 500 }
    )
  }
}

// POST - Crear nueva cuenta
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
    const { servicio_id, email, password, pin, perfil, slots_totales, slots_usados, activo } = body

    // Validaciones
    if (!servicio_id) {
      return NextResponse.json(
        { success: false, error: 'El ID del servicio es requerido' },
        { status: 400 }
      )
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { success: false, error: 'El email es requerido' },
        { status: 400 }
      )
    }

    if (!password || !password.trim()) {
      return NextResponse.json(
        { success: false, error: 'La contraseña es requerida' },
        { status: 400 }
      )
    }

    if (!perfil || !perfil.trim()) {
      return NextResponse.json(
        { success: false, error: 'El nombre del perfil es requerido' },
        { status: 400 }
      )
    }

    const servicioId = parseInt(servicio_id)
    if (isNaN(servicioId)) {
      return NextResponse.json(
        { success: false, error: 'ID de servicio inválido' },
        { status: 400 }
      )
    }

    // Obtener el primer plan del servicio (simplificación)
    const planes = await prisma.servicePlan.findMany({
      where: { idServicio: servicioId },
      take: 1
    })

    if (planes.length === 0) {
      return NextResponse.json(
        { success: false, error: 'El servicio no tiene planes asociados' },
        { status: 400 }
      )
    }

    const planId = planes[0].idPlan

    // Crear cuenta
    const nuevaCuenta = await prisma.inventarioCuenta.create({
      data: {
        idPlan: planId,
        correoEncriptado: encrypt(email.trim()),
        contrasenaEncriptada: encrypt(password.trim()),
        perfil: perfil.trim(),
        pin: pin && pin.trim() ? pin.trim() : null,
        notas: null,
        estado: activo ? 'disponible' : 'bloqueada'
      },
      include: {
        plan: {
          include: {
            servicio: true
          }
        }
      }
    })

    // Transformar a formato esperado
    const account = {
      id: nuevaCuenta.idCuenta.toString(),
      servicio_id: nuevaCuenta.plan.servicio.idServicio.toString(),
      servicio_nombre: nuevaCuenta.plan.servicio.nombre,
      email: decrypt(nuevaCuenta.correoEncriptado),
      password: decrypt(nuevaCuenta.contrasenaEncriptada),
      pin: nuevaCuenta.pin || null,
      perfil: nuevaCuenta.perfil || 'Perfil 1',
      slots_totales: slots_totales || 4,
      slots_usados: slots_usados || 0,
      activo: nuevaCuenta.estado === 'disponible' || nuevaCuenta.estado === 'asignada',
      created_at: nuevaCuenta.fechaAgregado.toISOString()
    }

    return NextResponse.json({ success: true, data: account }, { status: 201 })
  } catch (error: any) {
    console.error('[Admin Accounts POST] Error:', error)
    return NextResponse.json(
      { success: false, error: 'Error al crear cuenta', message: error.message },
      { status: 500 }
    )
  }
}

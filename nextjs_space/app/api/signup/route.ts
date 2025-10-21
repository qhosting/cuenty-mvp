
import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

/**
 * Validaciones de entrada
 */
const validarEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: 'Email es requerido' }
  }
  if (typeof email !== 'string') {
    return { valid: false, error: 'Email debe ser una cadena de texto' }
  }
  if (email.length > 100) {
    return { valid: false, error: 'Email no puede exceder 100 caracteres' }
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { valid: false, error: 'Formato de email inválido' }
  }
  return { valid: true }
}

const validarTelefono = (phone: string): { valid: boolean; error?: string } => {
  if (!phone) {
    return { valid: false, error: 'Teléfono es requerido' }
  }
  if (typeof phone !== 'string') {
    return { valid: false, error: 'Teléfono debe ser una cadena de texto' }
  }
  // Eliminar espacios y caracteres especiales para validar
  const phoneClean = phone.replace(/[\s\-\(\)]/g, '')
  if (phoneClean.length < 10 || phoneClean.length > 15) {
    return { valid: false, error: 'Teléfono debe tener entre 10 y 15 dígitos' }
  }
  return { valid: true }
}

const validarPassword = (password: string): { valid: boolean; error?: string } => {
  if (!password || typeof password !== 'string') {
    return { valid: false, error: 'Password es requerido' }
  }
  if (password.length < 6) {
    return { valid: false, error: 'Password debe tener al menos 6 caracteres' }
  }
  if (password.length > 100) {
    return { valid: false, error: 'Password no puede exceder 100 caracteres' }
  }
  return { valid: true }
}

const validarNombre = (name: string): { valid: boolean; error?: string } => {
  if (!name || typeof name !== 'string') {
    return { valid: false, error: 'Nombre es requerido' }
  }
  if (name.trim().length < 2) {
    return { valid: false, error: 'Nombre debe tener al menos 2 caracteres' }
  }
  if (name.length > 100) {
    return { valid: false, error: 'Nombre no puede exceder 100 caracteres' }
  }
  return { valid: true }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password } = body

    // Validar todos los campos
    const nombreValidation = validarNombre(name)
    if (!nombreValidation.valid) {
      return NextResponse.json(
        { error: nombreValidation.error },
        { status: 400 }
      )
    }

    const emailValidation = validarEmail(email)
    if (!emailValidation.valid) {
      return NextResponse.json(
        { error: emailValidation.error },
        { status: 400 }
      )
    }

    const phoneValidation = validarTelefono(phone)
    if (!phoneValidation.valid) {
      return NextResponse.json(
        { error: phoneValidation.error },
        { status: 400 }
      )
    }

    const passwordValidation = validarPassword(password)
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.error },
        { status: 400 }
      )
    }

    // Limpiar el teléfono (eliminar espacios y caracteres especiales, mantener el +)
    const phoneClean = phone.replace(/[\s\-\(\)]/g, '')

    // Verificar si el usuario ya existe usando el modelo Usuario de Prisma
    const existingUser = await prisma.usuario.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase().trim() },
          { celular: phoneClean }
        ]
      }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El usuario ya existe con este email o teléfono' },
        { status: 400 }
      )
    }

    // Hash de la contraseña con bcrypt (10 rounds es seguro y eficiente)
    const hashedPassword = await bcrypt.hash(password, 10)

    // Crear usuario con contraseña hasheada
    const nuevoUsuario = await prisma.usuario.create({
      data: {
        celular: phoneClean,
        nombre: name.trim(),
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        verificado: false // Por defecto no verificado, se puede verificar después
      },
      select: {
        celular: true,
        nombre: true,
        email: true,
        verificado: true,
        fechaCreacion: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Usuario creado exitosamente',
      user: nuevoUsuario
    }, { status: 201 })
  } catch (error: any) {
    console.error('Error creating user:', error)
    
    // Manejar errores específicos de Prisma
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'El usuario ya existe con este teléfono' },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        error: 'Error al crear el usuario',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

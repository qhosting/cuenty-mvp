
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    // Save contact form to database
    const contactForm = await prisma.contactForm.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: 'PENDING'
      }
    })

    return NextResponse.json(
      { 
        message: 'Mensaje enviado exitosamente. Te contactaremos pronto.',
        id: contactForm.id
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { message: 'Error al enviar el mensaje' },
      { status: 500 }
    )
  }
}

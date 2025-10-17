
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json(
        { message: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    try {
      // Save contact form to database
      const contactForm = await prisma.contactForm.create({
        data: {
          name,
          email,
          phone: phone || null,
          subject: subject || 'Consulta general',
          message,
          status: 'PENDING'
        }
      })

      // Also send to backend API if available
      if (process.env.BACKEND_URL) {
        try {
          await fetch(`${process.env.BACKEND_URL}/api/contact`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              nombre: name,
              email,
              asunto: subject || 'Consulta general',
              mensaje: message
            })
          })
        } catch (backendError) {
          console.warn('Backend contact API not available:', backendError)
        }
      }

      return NextResponse.json(
        { 
          message: 'Mensaje enviado exitosamente. Te contactaremos pronto.',
          id: contactForm.id
        },
        { status: 201 }
      )
    } catch (dbError) {
      // If database fails, try backend API directly
      if (process.env.BACKEND_URL) {
        const backendResponse = await fetch(`${process.env.BACKEND_URL}/api/contact`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            nombre: name,
            email,
            asunto: subject || 'Consulta general',
            mensaje: message
          })
        })

        if (backendResponse.ok) {
          const data = await backendResponse.json()
          return NextResponse.json(data, { status: 201 })
        }
      }
      throw dbError
    }
  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json(
      { message: 'Error al enviar el mensaje' },
      { status: 500 }
    )
  }
}

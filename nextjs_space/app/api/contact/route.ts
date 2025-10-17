
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, subject, message } = body

    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

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

    return NextResponse.json({
      message: 'Mensaje enviado correctamente',
      id: contactForm.id
    })
  } catch (error) {
    console.error('Error creating contact form:', error)
    return NextResponse.json(
      { error: 'Error al enviar el mensaje' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')

    const where = status ? { status } : {}

    const contacts = await prisma.contactForm.findMany({
      where,
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(contacts)
  } catch (error) {
    console.error('Error fetching contacts:', error)
    return NextResponse.json(
      { error: 'Error fetching contacts' },
      { status: 500 }
    )
  }
}

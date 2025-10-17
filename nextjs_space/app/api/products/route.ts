
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const duration = searchParams.get('duration')

    const where: any = { isActive: true }
    
    if (category && category !== 'all') {
      where.category = category
    }
    
    if (duration) {
      where.duration = parseInt(duration)
    }

    const products = await prisma.product.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { duration: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error fetching products' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, price, duration, category, features } = body

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        duration: parseInt(duration),
        category,
        features: features || [],
        isActive: true
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error creating product' },
      { status: 500 }
    )
  }
}


import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    let config = await prisma.siteConfig.findFirst()
    
    if (!config) {
      // Create default config if none exists
      config = await prisma.siteConfig.create({
        data: {}
      })
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error fetching site config:', error)
    return NextResponse.json({ error: 'Failed to fetch site config' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    
    let config = await prisma.siteConfig.findFirst()
    
    if (!config) {
      config = await prisma.siteConfig.create({ data })
    } else {
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data
      })
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('Error updating site config:', error)
    return NextResponse.json({ error: 'Failed to update site config' }, { status: 500 })
  }
}

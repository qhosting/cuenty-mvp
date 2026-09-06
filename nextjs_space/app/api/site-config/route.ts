import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Default fallback configuration in case DB is unreachable
const defaultConfig = {
  logoUrl: null,
  footerLogoUrl: null,
  logoSize: 'medium' as const,
  siteName: 'CUENTY',
  siteDescription: 'Plataforma de suscripciones compartidas',
  whatsappNumber: 'message/IOR2WUU66JVMM1'
}

export async function GET(request: NextRequest) {
  try {
    let config = await prisma.siteConfig.findFirst()
    
    if (!config) {
      // Create initial configuration record if none exists
      config = await prisma.siteConfig.create({
        data: {}
      })
    }
    
    return NextResponse.json(config)
  } catch (error) {
    console.error('[Site Config] Error fetching from database:', error)
    return NextResponse.json(defaultConfig)
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    let config = await prisma.siteConfig.findFirst()
    
    if (!config) {
      config = await prisma.siteConfig.create({
        data: {
          logoUrl: body.logoUrl || null,
          footerLogoUrl: body.footerLogoUrl || null,
          logoSize: body.logoSize || 'medium',
          ...(body.heroTitle && { heroTitle: body.heroTitle }),
          ...(body.heroSubtitle && { heroSubtitle: body.heroSubtitle }),
          ...(body.whatsappNumber && { whatsappNumber: body.whatsappNumber }),
          ...(body.supportEmail && { supportEmail: body.supportEmail })
        }
      })
    } else {
      config = await prisma.siteConfig.update({
        where: { id: config.id },
        data: {
          ...(body.logoUrl !== undefined && { logoUrl: body.logoUrl }),
          ...(body.footerLogoUrl !== undefined && { footerLogoUrl: body.footerLogoUrl }),
          ...(body.logoSize !== undefined && { logoSize: body.logoSize }),
          ...(body.heroTitle !== undefined && { heroTitle: body.heroTitle }),
          ...(body.heroSubtitle !== undefined && { heroSubtitle: body.heroSubtitle }),
          ...(body.whatsappNumber !== undefined && { whatsappNumber: body.whatsappNumber }),
          ...(body.supportEmail !== undefined && { supportEmail: body.supportEmail })
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Configuración guardada exitosamente',
      data: config
    })
  } catch (error) {
    console.error('[Site Config] Error saving to database:', error)
    return NextResponse.json(
      { success: false, message: 'Error al guardar configuración' },
      { status: 500 }
    )
  }
}

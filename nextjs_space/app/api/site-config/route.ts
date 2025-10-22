
import { NextRequest, NextResponse } from 'next/server'

// Default site configuration
const defaultConfig = {
  logoUrl: null, // No custom logo by default, will use Isotipo
  footerLogoUrl: null,
  logoSize: 'medium' as const,
  siteName: 'CUENTY',
  siteDescription: 'Plataforma de suscripciones compartidas',
}

export async function GET(request: NextRequest) {
  try {
    // TODO: Fetch from database when ready
    // For now, return default configuration
    return NextResponse.json(defaultConfig)
  } catch (error) {
    console.error('[Site Config] Error:', error)
    return NextResponse.json(defaultConfig) // Always return default config on error
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Save to database when ready
    const body = await request.json()
    
    // Validate the configuration
    const config = {
      logoUrl: body.logoUrl || null,
      footerLogoUrl: body.footerLogoUrl || null,
      logoSize: body.logoSize || 'medium',
      siteName: body.siteName || 'CUENTY',
      siteDescription: body.siteDescription || 'Plataforma de suscripciones compartidas',
    }
    
    return NextResponse.json({
      success: true,
      message: 'Configuración guardada exitosamente',
      data: config
    })
  } catch (error) {
    console.error('[Site Config] Error saving:', error)
    return NextResponse.json(
      { success: false, message: 'Error al guardar configuración' },
      { status: 500 }
    )
  }
}

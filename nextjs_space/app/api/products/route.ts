
import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Mock data - In production, this would come from your backend API
const mockProducts = [
  {
    id: 1,
    name: 'Netflix Premium',
    description: '4K UHD, 4 pantallas simultáneas, sin anuncios',
    price: 89,
    duration: 30,
    category: 'Netflix',
    isActive: true,
    features: ['4K Ultra HD', '4 Pantallas', 'Sin Publicidad', 'Descargas']
  },
  {
    id: 2,
    name: 'Disney+ Premium',
    description: 'Contenido Disney, Pixar, Marvel, Star Wars',
    price: 69,
    duration: 30,
    category: 'Disney+',
    isActive: true,
    features: ['4K HDR', 'Sin Límites', 'Todo Disney', 'Estrenar Primero']
  },
  {
    id: 3,
    name: 'HBO Max',
    description: 'Series exclusivas, películas y documentales',
    price: 79,
    duration: 30,
    category: 'HBO Max',
    isActive: true,
    features: ['Contenido Exclusivo', 'Sin Anuncios', 'Máxima Calidad', 'Estrenos']
  }
]

export async function GET() {
  try {
    // In production, fetch from your existing backend
    // const response = await fetch(`${process.env.BACKEND_URL}/api/productos`)
    // const products = await response.json()
    
    return NextResponse.json({ productos: mockProducts })
  } catch (error) {
    console.error('Products fetch error:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

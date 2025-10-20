

'use client'

import { useEffect, useState } from 'react'
import { Play, Music, Sparkles, Star, ArrowRight, Clock, Shield, Zap } from 'lucide-react'
import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
  features: string[]
}

export function ProductShowcase() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      console.log('[ProductShowcase] Cargando productos destacados...')
      
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 10000)
      
      const response = await fetch('/api/products', {
        signal: controller.signal,
        cache: 'no-store',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        }
      })
      
      clearTimeout(timeout)
      
      if (!response.ok) {
        console.error('[ProductShowcase] Error de respuesta:', response.status)
        throw new Error(`Error del servidor: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.error) {
        throw new Error(data.error)
      }
      
      if (!Array.isArray(data)) {
        throw new Error('La respuesta no es un array de productos')
      }
      
      // Mostrar solo productos de 1 mes para el showcase principal
      const monthlyProducts = data.filter((p: Product) => p.duration === 30)
      // Limitar a 8 productos para el showcase
      const showcaseProducts = monthlyProducts.slice(0, 8)
      
      console.log(`[ProductShowcase] Productos cargados: ${showcaseProducts.length}`)
      setProducts(showcaseProducts)
    } catch (error) {
      console.error('[ProductShowcase] Error fetching products:', error)
      // En caso de error, mostrar array vacío (el componente no se mostrará)
      setProducts([])
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = filter === 'all' 
    ? products
    : products.filter(product => product.category?.toLowerCase().includes(filter.toLowerCase()))

  const getServiceIcon = (name: string) => {
    const service = name.toLowerCase()
    if (service.includes('spotify')) return Music
    if (service.includes('netflix') || service.includes('disney') || service.includes('hbo') || service.includes('prime')) return Play
    return Sparkles
  }

  if (loading) {
    return (
      <section className="py-24 bg-gradient-to-b from-slate-950 to-slate-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="h-12 bg-slate-800/50 rounded animate-pulse mb-6 max-w-md mx-auto"></div>
            <div className="h-6 bg-slate-800/50 rounded animate-pulse max-w-2xl mx-auto"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="bg-slate-800/50 rounded-xl p-6 animate-pulse">
                <div className="w-full h-32 bg-slate-700 rounded-lg mb-4"></div>
                <div className="h-6 bg-slate-700 rounded mb-2"></div>
                <div className="h-4 bg-slate-700 rounded mb-4"></div>
                <div className="h-10 bg-slate-700 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Si no hay productos después de cargar, no mostrar nada
  if (!loading && filteredProducts.length === 0) {
    console.log('[ProductShowcase] No hay productos para mostrar, ocultando sección')
    return null
  }

  return (
    <section id="productos" className="py-24 bg-gradient-to-b from-slate-950 to-slate-900 relative">
      {/* Background decoration */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            <span className="bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent">
              Ofertas
            </span>
            {' '}Destacadas
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto mb-8">
            Las mejores cuentas premium a precios increíbles. Entrega inmediata y soporte 24/7.
          </p>

          {/* Quick Filters */}
          <div className="flex justify-center mb-12">
            <div className="flex flex-wrap gap-2 bg-slate-800/30 backdrop-blur-sm p-2 rounded-xl border border-slate-700/50">
              {[
                { key: 'all', label: 'Todos', icon: Sparkles },
                { key: 'streaming', label: 'Streaming', icon: Play },
                { key: 'music', label: 'Música', icon: Music },
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all duration-300 font-medium ${
                    filter === key
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white scale-105'
                      : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-16">
          {filteredProducts.map((product, index) => {
            const IconComponent = getServiceIcon(product.name)
            const serviceName = product.name?.split(' - ')[0] || product.name
            
            return (
              <div
                key={product.id}
                className="group relative bg-gradient-to-b from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-xl border border-slate-700/50 hover:border-blue-500/50 transition-all duration-500 hover:scale-105 overflow-hidden"
                style={{
                  animationDelay: `${index * 0.1}s`
                }}
              >
                {/* Popular badge for first product */}
                {index === 0 && (
                  <div className="absolute top-4 right-4 z-10">
                    <div className="flex items-center space-x-1 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-2 py-1 rounded-full text-xs font-semibold animate-pulse">
                      <Star className="w-3 h-3 fill-current" />
                      <span>Más Popular</span>
                    </div>
                  </div>
                )}

                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                <div className="relative p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30 group-hover:from-blue-500/30 group-hover:to-purple-500/30 transition-colors">
                        <IconComponent className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-bold text-white text-lg group-hover:text-blue-300 transition-colors">
                          {serviceName}
                        </h3>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                          <span className="text-xs text-slate-400 ml-1">(4.9)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm mb-4 line-clamp-2 group-hover:text-slate-200 transition-colors">
                    {product.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-2 mb-6">
                    {product.features?.slice(0, 3)?.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2 text-xs text-slate-400">
                        <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse"></div>
                        <span className="group-hover:text-slate-300 transition-colors">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Duration & Features */}
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-4 text-xs">
                      <div className="flex items-center space-x-1 text-slate-400">
                        <Clock className="w-3 h-3" />
                        <span>{product.duration} días</span>
                      </div>
                      <div className="flex items-center space-x-1 text-green-400">
                        <Zap className="w-3 h-3" />
                        <span>Inmediato</span>
                      </div>
                    </div>
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white group-hover:text-green-400 transition-colors">
                        {formatPrice(Number(product.price))}
                      </div>
                      <div className="text-xs text-slate-400">por mes</div>
                    </div>
                    <Link
                      href={`/catalogo/${product.id}`}
                      className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-all duration-300 text-sm font-medium group-hover:scale-105"
                    >
                      <span>Comprar</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  </div>
                </div>

                {/* Bottom glow effect */}
                <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 to-purple-500 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </div>
            )
          })}
        </div>

        {/* CTA section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-slate-800/40 to-slate-900/40 backdrop-blur-sm rounded-2xl border border-slate-700/50 p-8 relative overflow-hidden">
            {/* Background decoration */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5"></div>
            
            <div className="relative">
              <div className="flex justify-center mb-4">
                <div className="flex items-center space-x-2 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-500/30 rounded-full px-4 py-2">
                  <Shield className="w-4 h-4 text-green-400" />
                  <span className="text-green-400 text-sm font-medium">+100 productos disponibles</span>
                </div>
              </div>

              <h3 className="text-3xl font-bold text-white mb-4">
                ¿Necesitas algo más específico?
              </h3>
              <p className="text-slate-300 mb-8 max-w-md mx-auto">
                Explora nuestro catálogo completo con más de 100 opciones de cuentas premium.
              </p>
              <Link
                href="/catalogo"
                className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-lg hover:from-blue-700 hover:to-purple-700 transition-colors font-semibold text-lg hover:scale-105 transform duration-300"
              >
                <span>Explorar Catálogo Completo</span>
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}


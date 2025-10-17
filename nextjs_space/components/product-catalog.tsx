
'use client'

import { useEffect, useState } from 'react'
import { Play, Music, Sparkles, Star, ArrowRight } from 'lucide-react'
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

export function ProductCatalog() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      const data = await response.json()
      
      // Mostrar solo productos de 1 mes para el catálogo principal
      const monthlyProducts = data.filter((p: Product) => p.duration === 30)
      setProducts(monthlyProducts)
    } catch (error) {
      console.error('Error fetching products:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = filter === 'all' 
    ? products
    : products.filter(product => product.category === filter)

  const getServiceName = (name: string) => {
    return name.split(' - ')[0]
  }

  const getServiceIcon = (name: string) => {
    const service = name.toLowerCase()
    if (service.includes('spotify')) return Music
    if (service.includes('netflix') || service.includes('disney') || service.includes('hbo') || service.includes('prime')) return Play
    return Sparkles
  }

  if (loading) {
    return (
      <section id="productos" className="py-24 bg-slate-900/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Nuestros <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Productos</span>
            </h2>
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

  return (
    <section id="productos" className="py-24 bg-slate-900/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Nuestros <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Productos</span>
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Accede a las mejores plataformas de streaming y entretenimiento con cuentas premium a precios increíbles.
          </p>
        </div>

        {/* Category filters */}
        <div className="flex justify-center mb-12">
          <div className="flex flex-wrap gap-2 bg-slate-800/50 backdrop-blur-sm p-2 rounded-xl border border-slate-700">
            {[
              { key: 'all', label: 'Todos', icon: Sparkles },
              { key: 'streaming', label: 'Streaming', icon: Play },
              { key: 'music', label: 'Música', icon: Music },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                  filter === key
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                    : 'text-slate-300 hover:text-white hover:bg-slate-700/50'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Products grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
          {filteredProducts.map((product) => {
            const IconComponent = getServiceIcon(product.name)
            const serviceName = getServiceName(product.name)
            
            return (
              <div
                key={product.id}
                className="group relative bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:scale-105"
              >
                {/* Card content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                        <IconComponent className="w-6 h-6 text-blue-400" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-white text-lg">{serviceName}</h3>
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star key={i} className="w-3 h-3 text-yellow-400 fill-current" />
                          ))}
                          <span className="text-xs text-slate-400 ml-1">(4.9)</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                    {product.description}
                  </p>

                  {/* Features */}
                  <div className="space-y-1 mb-6">
                    {product.features.slice(0, 3).map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs text-slate-400">
                        <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                        <span>{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Price and CTA */}
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-2xl font-bold text-white">{formatPrice(Number(product.price))}</div>
                      <div className="text-xs text-slate-400">por mes</div>
                    </div>
                    <Link
                      href={`/catalogo/${product.id}`}
                      className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors text-sm font-medium"
                    >
                      <span>Ver Planes</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* CTA section */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
            <h3 className="text-2xl font-bold text-white mb-4">¿No encuentras lo que buscas?</h3>
            <p className="text-slate-300 mb-6 max-w-md mx-auto">
              Contáctanos y te ayudaremos a encontrar la cuenta perfecta para ti.
            </p>
            <Link
              href="/catalogo"
              className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-medium"
            >
              <span>Ver Catálogo Completo</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

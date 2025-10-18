
'use client'

import { useEffect, useState } from 'react'
import { Filter, Grid, List, Search, Play, Music, Sparkles, Star, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { formatPrice, formatDuration } from '@/lib/utils'

interface Product {
  id: string
  name: string
  description: string
  price: number
  duration: number
  category: string
  features: string[]
}

export default function CatalogoPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    category: 'all',
    duration: 'all',
    search: ''
  })
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')

  useEffect(() => {
    let mounted = true
    
    const fetchProducts = async () => {
      try {
        console.log('[Catalogo] Iniciando carga de productos...')
        
        // Timeout de seguridad: 10 segundos máximo
        const controller = new AbortController()
        const timeout = setTimeout(() => controller.abort(), 10000)
        
        const response = await fetch('/api/products', {
          signal: controller.signal,
          cache: 'no-store'
        })
        
        clearTimeout(timeout)
        
        if (!response.ok) {
          throw new Error(`Error: ${response.status} ${response.statusText}`)
        }
        
        const data = await response.json()
        
        // Verificar si hay un error en la respuesta
        if (data.error) {
          throw new Error(data.error)
        }
        
        if (mounted) {
          console.log(`[Catalogo] Productos cargados: ${data.length}`)
          setProducts(data)
          setError(null)
        }
      } catch (error) {
        console.error('[Catalogo] Error fetching products:', error)
        if (mounted) {
          // En caso de error, mostrar un array vacío en lugar de quedarse en loading
          setProducts([])
          setError(error instanceof Error ? error.message : 'Error al cargar productos')
        }
      } finally {
        if (mounted) {
          setLoading(false)
        }
      }
    }

    fetchProducts()
    
    return () => {
      mounted = false
    }
  }, [])

  useEffect(() => {
    filterProducts()
  }, [products, filters])

  const filterProducts = () => {
    let filtered = products

    // Filtrar por categoría
    if (filters.category !== 'all') {
      filtered = filtered.filter(product => product.category === filters.category)
    }

    // Filtrar por duración
    if (filters.duration !== 'all') {
      const duration = parseInt(filters.duration)
      filtered = filtered.filter(product => product.duration === duration)
    }

    // Filtrar por búsqueda
    if (filters.search) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.description.toLowerCase().includes(filters.search.toLowerCase())
      )
    }

    setFilteredProducts(filtered)
  }

  const getServiceName = (name: string) => {
    return name.split(' - ')[0]
  }

  const getServiceIcon = (name: string) => {
    const service = name.toLowerCase()
    if (service.includes('spotify')) return Music
    return Play
  }

  const categories = [
    { key: 'all', label: 'Todos', icon: Sparkles },
    { key: 'streaming', label: 'Streaming', icon: Play },
    { key: 'music', label: 'Música', icon: Music }
  ]

  const durations = [
    { key: 'all', label: 'Todas las duraciones' },
    { key: '30', label: '1 Mes' },
    { key: '90', label: '3 Meses' },
    { key: '180', label: '6 Meses' },
    { key: '365', label: '1 Año' }
  ]

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h1 className="text-4xl font-bold text-white mb-4">
                Catálogo de <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Servicios</span>
              </h1>
              <p className="text-xl text-slate-300">
                Explora todos nuestros servicios de streaming premium
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {[...Array(12)].map((_, i) => (
                <div key={i} className="bg-slate-800/50 rounded-xl p-6 animate-pulse">
                  <div className="w-full h-32 bg-slate-700 rounded-lg mb-4"></div>
                  <div className="h-6 bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded mb-4"></div>
                  <div className="h-10 bg-slate-700 rounded"></div>
                </div>
              ))}
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Catálogo de <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">Servicios</span>
            </h1>
            <p className="text-xl text-slate-300 max-w-3xl mx-auto">
              Explora todos nuestros servicios de streaming premium con diferentes planes y duraciones
            </p>
          </div>

          {/* Filters and Search */}
          <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 mb-8">
            <div className="flex flex-col lg:flex-row gap-6">
              {/* Search */}
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Buscar servicios..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:border-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Category Filter */}
              <div className="flex flex-wrap gap-2">
                {categories.map(({ key, label, icon: Icon }) => (
                  <button
                    key={key}
                    onClick={() => setFilters(prev => ({ ...prev, category: key }))}
                    className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors font-medium ${
                      filters.category === key
                        ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white'
                        : 'bg-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-600/50'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{label}</span>
                  </button>
                ))}
              </div>

              {/* Duration Filter */}
              <select
                value={filters.duration}
                onChange={(e) => setFilters(prev => ({ ...prev, duration: e.target.value }))}
                className="px-4 py-2 bg-slate-700/50 border border-slate-600 rounded-lg text-white focus:border-blue-500 focus:outline-none"
              >
                {durations.map(({ key, label }) => (
                  <option key={key} value={key}>{label}</option>
                ))}
              </select>

              {/* View Mode */}
              <div className="flex bg-slate-700/50 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'grid' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Grid className="w-4 h-4" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded transition-colors ${
                    viewMode === 'list' ? 'bg-blue-500 text-white' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <List className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Results count */}
          <div className="mb-6">
            <p className="text-slate-300">
              Mostrando {filteredProducts.length} {filteredProducts.length === 1 ? 'servicio' : 'servicios'}
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <div className="flex items-center space-x-2 text-red-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">Error al cargar productos: {error}</span>
              </div>
            </div>
          )}

          {/* Products Grid */}
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <div className="bg-slate-800/50 rounded-xl p-8 max-w-md mx-auto">
                <Search className="w-16 h-16 text-slate-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-white mb-2">
                  {error ? 'No hay productos disponibles' : 'No se encontraron resultados'}
                </h3>
                <p className="text-slate-300 mb-4">
                  {error 
                    ? 'Por favor, intenta recargar la página'
                    : 'Intenta cambiar los filtros o términos de búsqueda'
                  }
                </p>
                <button
                  onClick={() => {
                    if (error) {
                      window.location.reload()
                    } else {
                      setFilters({ category: 'all', duration: 'all', search: '' })
                    }
                  }}
                  className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
                >
                  {error ? 'Recargar página' : 'Limpiar filtros'}
                </button>
              </div>
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6'
              : 'space-y-4'
            }>
              {filteredProducts.map((product) => {
                const IconComponent = getServiceIcon(product.name)
                const serviceName = getServiceName(product.name)
                
                if (viewMode === 'list') {
                  return (
                    <div
                      key={product.id}
                      className="bg-gradient-to-r from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 p-6"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="p-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg border border-blue-500/30">
                            <IconComponent className="w-8 h-8 text-blue-400" />
                          </div>
                          <div>
                            <h3 className="text-xl font-semibold text-white">{serviceName}</h3>
                            <p className="text-slate-300">{formatDuration(product.duration)}</p>
                            <p className="text-sm text-slate-400 mt-1">{product.description}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-2xl font-bold text-white mb-2">{formatPrice(Number(product.price))}</div>
                          <Link
                            href={`/catalogo/${product.id}`}
                            className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors text-sm font-medium"
                          >
                            <span>Ver Detalles</span>
                            <ArrowRight className="w-4 h-4" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  )
                }

                return (
                  <div
                    key={product.id}
                    className="group relative bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 hover:shadow-xl hover:shadow-blue-500/10 hover:scale-105"
                  >
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
                        <div className="text-right">
                          <div className="text-xs text-blue-400 font-medium">{formatDuration(product.duration)}</div>
                        </div>
                      </div>

                      <p className="text-slate-300 text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>

                      <div className="space-y-1 mb-6">
                        {product.features.slice(0, 3).map((feature, index) => (
                          <div key={index} className="flex items-center space-x-2 text-xs text-slate-400">
                            <div className="w-1 h-1 bg-green-400 rounded-full"></div>
                            <span>{feature}</span>
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-2xl font-bold text-white">{formatPrice(Number(product.price))}</div>
                          <div className="text-xs text-slate-400">por {formatDuration(product.duration).toLowerCase()}</div>
                        </div>
                        <Link
                          href={`/catalogo/${product.id}`}
                          className="flex items-center space-x-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors text-sm font-medium"
                        >
                          <span>Ver Detalles</span>
                          <ArrowRight className="w-4 h-4" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { Star, Shield, Clock, Check, ArrowRight, Play, Music, ShoppingCart } from 'lucide-react'
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

export default function ProductDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { data: session } = useSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [addingToCart, setAddingToCart] = useState(false)

  useEffect(() => {
    if (params?.id) {
      fetchProduct(params.id as string)
    }
  }, [params?.id])

  const fetchProduct = async (id: string) => {
    try {
      const [productResponse, allProductsResponse] = await Promise.all([
        fetch(`/api/products/${id}`),
        fetch('/api/products')
      ])

      if (productResponse.ok) {
        const productData = await productResponse.json()
        setProduct(productData)

        // Obtener productos relacionados (mismo servicio, diferentes duraciones)
        if (allProductsResponse.ok) {
          const allProducts = await allProductsResponse.json()
          const serviceName = productData.name.split(' - ')[0]
          const related = allProducts.filter((p: Product) => 
            p.id !== productData.id && 
            p.name.startsWith(serviceName)
          )
          setRelatedProducts(related)
        }
      } else {
        router.push('/catalogo')
      }
    } catch (error) {
      console.error('Error fetching product:', error)
      router.push('/catalogo')
    } finally {
      setLoading(false)
    }
  }

  const handleAddToCart = async () => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    setAddingToCart(true)
    try {
      // Por ahora, redirigir directamente al checkout
      router.push(`/checkout?product=${product?.id}`)
    } catch (error) {
      console.error('Error adding to cart:', error)
    } finally {
      setAddingToCart(false)
    }
  }

  const getServiceIcon = (name: string) => {
    const service = name.toLowerCase()
    if (service.includes('spotify')) return Music
    return Play
  }

  const getServiceName = (name: string) => {
    return name.split(' - ')[0]
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-800/50 rounded-xl p-8 animate-pulse">
              <div className="h-8 bg-slate-700 rounded mb-4 w-1/3"></div>
              <div className="h-4 bg-slate-700 rounded mb-6 w-2/3"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <div className="h-64 bg-slate-700 rounded-lg mb-4"></div>
                </div>
                <div>
                  <div className="h-6 bg-slate-700 rounded mb-4"></div>
                  <div className="h-4 bg-slate-700 rounded mb-2"></div>
                  <div className="h-4 bg-slate-700 rounded mb-6"></div>
                  <div className="h-12 bg-slate-700 rounded"></div>
                </div>
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  if (!product) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-3xl font-bold text-white mb-4">Producto no encontrado</h1>
            <p className="text-slate-300 mb-8">El producto que buscas no existe o ya no está disponible.</p>
            <button
              onClick={() => router.push('/catalogo')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
            >
              Ver Catálogo
            </button>
          </div>
        </main>
        <Footer />
      </>
    )
  }

  const IconComponent = getServiceIcon(product.name)
  const serviceName = getServiceName(product.name)

  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Breadcrumb */}
          <div className="mb-8">
            <nav className="flex space-x-2 text-sm text-slate-300">
              <button onClick={() => router.push('/')} className="hover:text-white transition-colors">
                Inicio
              </button>
              <span>/</span>
              <button onClick={() => router.push('/catalogo')} className="hover:text-white transition-colors">
                Catálogo
              </button>
              <span>/</span>
              <span className="text-white">{serviceName}</span>
            </nav>
          </div>

          {/* Product Detail */}
          <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8 mb-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Product Image/Icon */}
              <div className="flex items-center justify-center">
                <div className="bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl p-16 border border-blue-500/30">
                  <IconComponent className="w-32 h-32 text-blue-400" />
                </div>
              </div>

              {/* Product Info */}
              <div>
                <div className="flex items-center space-x-2 mb-4">
                  <div className="px-3 py-1 bg-blue-500/20 text-blue-400 rounded-full text-sm font-medium">
                    {product.category === 'streaming' ? 'Streaming' : 'Música'}
                  </div>
                  <div className="px-3 py-1 bg-purple-500/20 text-purple-400 rounded-full text-sm font-medium">
                    {formatDuration(product.duration)}
                  </div>
                </div>

                <h1 className="text-4xl font-bold text-white mb-4">{serviceName}</h1>
                
                <div className="flex items-center space-x-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  <span className="text-slate-300 ml-2">(4.9) • 1,234 reseñas</span>
                </div>

                <p className="text-slate-300 text-lg leading-relaxed mb-8">
                  {product.description}
                </p>

                {/* Features */}
                <div className="space-y-3 mb-8">
                  <h3 className="text-xl font-semibold text-white">¿Qué incluye?</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {product.features.map((feature, index) => (
                      <div key={index} className="flex items-center space-x-2">
                        <Check className="w-5 h-5 text-green-400" />
                        <span className="text-slate-300">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Guarantee badges */}
                <div className="grid grid-cols-3 gap-4 mb-8">
                  <div className="text-center">
                    <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                    <div className="text-sm text-slate-300">100% Seguro</div>
                  </div>
                  <div className="text-center">
                    <Clock className="w-8 h-8 text-blue-400 mx-auto mb-2" />
                    <div className="text-sm text-slate-300">Entrega Inmediata</div>
                  </div>
                  <div className="text-center">
                    <Check className="w-8 h-8 text-purple-400 mx-auto mb-2" />
                    <div className="text-sm text-slate-300">Garantía Total</div>
                  </div>
                </div>

                {/* Price and Purchase */}
                <div className="bg-slate-900/50 rounded-xl p-6 border border-slate-600">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <div className="text-3xl font-bold text-white">{formatPrice(Number(product.price))}</div>
                      <div className="text-slate-400">por {formatDuration(product.duration).toLowerCase()}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-green-400 font-medium">¡Disponible ahora!</div>
                      <div className="text-xs text-slate-400">Entrega inmediata</div>
                    </div>
                  </div>
                  
                  <button
                    onClick={handleAddToCart}
                    disabled={addingToCart}
                    className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
                  >
                    <ShoppingCart className="w-5 h-5" />
                    <span>{addingToCart ? 'Procesando...' : 'Comprar Ahora'}</span>
                    <ArrowRight className="w-5 h-5" />
                  </button>
                  
                  <div className="mt-4 text-center">
                    <div className="text-xs text-slate-400">
                      Pago seguro • Garantía de devolución • Soporte 24/7
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Related Products */}
          {relatedProducts.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Otros planes disponibles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {relatedProducts.map((relatedProduct) => (
                  <div
                    key={relatedProduct.id}
                    className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 hover:border-blue-500/50 transition-all duration-300 p-6"
                  >
                    <div className="flex items-center space-x-3 mb-4">
                      <IconComponent className="w-8 h-8 text-blue-400" />
                      <div>
                        <h3 className="font-semibold text-white">{serviceName}</h3>
                        <div className="text-sm text-blue-400">{formatDuration(relatedProduct.duration)}</div>
                      </div>
                    </div>
                    
                    <div className="text-2xl font-bold text-white mb-4">
                      {formatPrice(Number(relatedProduct.price))}
                    </div>
                    
                    <button
                      onClick={() => router.push(`/catalogo/${relatedProduct.id}`)}
                      className="w-full bg-slate-700/50 hover:bg-slate-600/50 text-white py-2 px-4 rounded-lg transition-colors text-sm font-medium"
                    >
                      Ver Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* How it works */}
          <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-2xl border border-slate-700 p-8">
            <h2 className="text-2xl font-bold text-white mb-6 text-center">¿Cómo funciona?</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                { step: '1', title: 'Compra', desc: 'Selecciona tu plan y realiza el pago' },
                { step: '2', title: 'Recibe', desc: 'Te enviamos las credenciales por WhatsApp' },
                { step: '3', title: 'Accede', desc: 'Inicia sesión en la plataforma' },
                { step: '4', title: 'Disfruta', desc: '¡Comienza a ver tu contenido favorito!' }
              ].map((item) => (
                <div key={item.step} className="text-center">
                  <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg mx-auto mb-3">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-white mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-300">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

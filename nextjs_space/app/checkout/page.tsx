
'use client'

import { useEffect, useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { CreditCard, Check, Shield, Clock, ArrowLeft, Copy, ExternalLink } from 'lucide-react'
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
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

interface Order {
  id: string
  totalAmount: number
  status: string
  createdAt: string
}

function CheckoutContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session } = useSession()
  const [product, setProduct] = useState<Product | null>(null)
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [step, setStep] = useState<'review' | 'payment' | 'success'>('review')

  const productId = searchParams?.get('product')

  useEffect(() => {
    if (!session) {
      router.push('/auth/login')
      return
    }

    if (productId) {
      fetchProduct(productId)
    } else {
      router.push('/catalogo')
    }
  }, [session, productId, router])

  const fetchProduct = async (id: string) => {
    try {
      const response = await fetch(`/api/products/${id}`)
      if (response.ok) {
        const data = await response.json()
        setProduct(data)
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

  const createOrder = async () => {
    if (!product || !session) return

    setCreating(true)
    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          productId: product.id,
          paymentMethod: 'bank_transfer'
        })
      })

      if (response.ok) {
        const orderData = await response.json()
        setOrder(orderData)
        setStep('payment')
      } else {
        alert('Error al crear la orden. Intenta de nuevo.')
      }
    } catch (error) {
      console.error('Error creating order:', error)
      alert('Error al crear la orden. Intenta de nuevo.')
    } finally {
      setCreating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copiado al portapapeles')
  }

  const confirmPayment = () => {
    setStep('success')
  }

  if (!session) {
    return null
  }

  if (loading) {
    return (
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="bg-slate-800/50 rounded-xl p-8 animate-pulse">
              <div className="h-8 bg-slate-700 rounded mb-6 w-1/3"></div>
              <div className="h-32 bg-slate-700 rounded"></div>
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
            <h1 className="text-3xl font-bold text-white mb-4">Error</h1>
            <p className="text-slate-300 mb-8">No se pudo cargar la información del producto.</p>
            <button
              onClick={() => router.push('/catalogo')}
              className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors"
            >
              Volver al Catálogo
            </button>
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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => step === 'review' ? router.back() : setStep('review')}
              className="flex items-center space-x-2 text-slate-300 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Volver</span>
            </button>
            <h1 className="text-3xl font-bold text-white">
              {step === 'review' && 'Revisar Compra'}
              {step === 'payment' && 'Instrucciones de Pago'}
              {step === 'success' && '¡Compra Exitosa!'}
            </h1>
          </div>

          {/* Progress indicator */}
          <div className="mb-8">
            <div className="flex items-center justify-center space-x-8">
              {[
                { key: 'review', label: 'Revisar', active: step === 'review', completed: ['payment', 'success'].includes(step) },
                { key: 'payment', label: 'Pagar', active: step === 'payment', completed: step === 'success' },
                { key: 'success', label: 'Listo', active: step === 'success', completed: false }
              ].map((stepItem, index) => (
                <div key={stepItem.key} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold ${
                    stepItem.completed 
                      ? 'bg-green-500 text-white'
                      : stepItem.active
                        ? 'bg-blue-500 text-white'
                        : 'bg-slate-700 text-slate-300'
                  }`}>
                    {stepItem.completed ? <Check className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className={`ml-2 font-medium ${
                    stepItem.active ? 'text-white' : 'text-slate-400'
                  }`}>
                    {stepItem.label}
                  </span>
                  {index < 2 && (
                    <div className={`w-16 h-0.5 mx-4 ${
                      stepItem.completed ? 'bg-green-500' : 'bg-slate-700'
                    }`} />
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main content */}
            <div className="lg:col-span-2">
              {step === 'review' && (
                <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8">
                  <h2 className="text-2xl font-semibold text-white mb-6">Confirmación de compra</h2>
                  
                  <div className="space-y-6">
                    <div>
                      <h3 className="font-semibold text-white mb-2">Información del cliente</h3>
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <p className="text-slate-300">Nombre: {session.user?.name}</p>
                        <p className="text-slate-300">Email: {session.user?.email}</p>
                        <p className="text-slate-300">Teléfono: {session.user?.phone}</p>
                      </div>
                    </div>

                    <div>
                      <h3 className="font-semibold text-white mb-2">Método de entrega</h3>
                      <div className="bg-slate-900/50 rounded-lg p-4">
                        <p className="text-slate-300">📱 WhatsApp: {session.user?.phone}</p>
                        <p className="text-sm text-slate-400 mt-1">
                          Las credenciales se enviarán a este número inmediatamente después del pago confirmado.
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-600">
                      <div className="text-center">
                        <Shield className="w-8 h-8 text-green-400 mx-auto mb-2" />
                        <div className="text-sm text-slate-300">Pago Seguro</div>
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

                    <button
                      onClick={createOrder}
                      disabled={creating}
                      className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-slate-900 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-semibold"
                    >
                      {creating ? 'Procesando...' : 'Proceder al Pago'}
                    </button>
                  </div>
                </div>
              )}

              {step === 'payment' && order && (
                <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8">
                  <h2 className="text-2xl font-semibold text-white mb-6">Instrucciones de Pago</h2>
                  
                  <div className="space-y-6">
                    <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
                      <h3 className="font-semibold text-blue-400 mb-2">Orden #{order.id.slice(-8).toUpperCase()}</h3>
                      <p className="text-slate-300 text-sm">
                        Tu orden ha sido creada exitosamente. Sigue las instrucciones de pago para completar la compra.
                      </p>
                    </div>

                    <div>
                      <h3 className="font-semibold text-white mb-4">Transferencia Bancaria / SPEI</h3>
                      <div className="bg-slate-900/50 rounded-lg p-6 space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Banco:</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-medium">BBVA Bancomer</span>
                            <button
                              onClick={() => copyToClipboard('BBVA Bancomer')}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Cuenta:</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-mono">012180001234567890</span>
                            <button
                              onClick={() => copyToClipboard('012180001234567890')}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">CLABE:</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-mono">012180001234567890</span>
                            <button
                              onClick={() => copyToClipboard('012180001234567890')}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Titular:</span>
                          <span className="text-white font-medium">CUENTY MEXICO SA DE CV</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-300">Referencia:</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-white font-mono">#{order.id.slice(-8).toUpperCase()}</span>
                            <button
                              onClick={() => copyToClipboard(order.id.slice(-8).toUpperCase())}
                              className="text-blue-400 hover:text-blue-300"
                            >
                              <Copy className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-4 border-t border-slate-700">
                          <span className="text-slate-300">Monto a transferir:</span>
                          <span className="text-xl font-bold text-white">{formatPrice(Number(order.totalAmount))}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
                      <h4 className="font-semibold text-yellow-400 mb-2">Importante:</h4>
                      <ul className="text-slate-300 text-sm space-y-1">
                        <li>• Incluye la referencia en tu transferencia</li>
                        <li>• El pago debe ser por el monto exacto</li>
                        <li>• Las credenciales se envían inmediatamente después de confirmar el pago</li>
                        <li>• El proceso puede tomar hasta 15 minutos en horarios pico</li>
                      </ul>
                    </div>

                    <div className="flex space-x-4">
                      <button
                        onClick={confirmPayment}
                        className="flex-1 bg-gradient-to-r from-green-500 to-green-600 text-white py-3 px-6 rounded-lg hover:from-green-600 hover:to-green-700 transition-colors font-semibold"
                      >
                        Ya realicé el pago
                      </button>
                      <button
                        onClick={() => {
                          const message = encodeURIComponent(`Hola, necesito ayuda con mi orden ${order.id.slice(-8).toUpperCase()}. Monto: ${formatPrice(Number(order.totalAmount))}`)
                          const whatsappUrl = `https://wa.me/message/IOR2WUU66JVMM1?text=${message}`
                          window.open(whatsappUrl, '_blank')
                        }}
                        className="flex items-center space-x-2 bg-slate-700 hover:bg-slate-600 text-white py-3 px-6 rounded-lg transition-colors font-semibold"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Ayuda</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {step === 'success' && order && (
                <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8 text-center">
                  <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white mb-4">¡Pago confirmado!</h2>
                  <p className="text-slate-300 mb-6">
                    Tu compra ha sido procesada exitosamente. Las credenciales de acceso se han enviado a tu WhatsApp.
                  </p>
                  
                  <div className="bg-slate-900/50 rounded-lg p-6 mb-6">
                    <h3 className="font-semibold text-white mb-4">¿Qué sigue?</h3>
                    <div className="space-y-3 text-left">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">1</div>
                        <span className="text-slate-300">Revisa tu WhatsApp: {session?.user?.phone}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">2</div>
                        <span className="text-slate-300">Usa las credenciales para acceder a {product.name}</span>
                      </div>
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-white text-xs font-bold">3</div>
                        <span className="text-slate-300">¡Disfruta de tu contenido premium!</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4">
                    <button
                      onClick={() => router.push('/dashboard/orders')}
                      className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 px-6 rounded-lg hover:from-blue-600 hover:to-purple-700 transition-colors font-semibold"
                    >
                      Ver mis órdenes
                    </button>
                    <button
                      onClick={() => router.push('/catalogo')}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-3 px-6 rounded-lg transition-colors font-semibold"
                    >
                      Seguir comprando
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Order summary sidebar */}
            <div>
              <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-6 sticky top-8">
                <h3 className="font-semibold text-white mb-4">Resumen de la orden</h3>
                
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-center justify-center">
                      <CreditCard className="w-6 h-6 text-blue-400" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-white">{product.name}</h4>
                      <p className="text-sm text-slate-400">{product.description}</p>
                    </div>
                  </div>

                  <div className="border-t border-slate-600 pt-4">
                    <div className="flex justify-between text-slate-300 mb-2">
                      <span>Subtotal:</span>
                      <span>{formatPrice(Number(product.price))}</span>
                    </div>
                    <div className="flex justify-between text-slate-300 mb-2">
                      <span>Descuentos:</span>
                      <span>$0.00</span>
                    </div>
                    <div className="border-t border-slate-600 pt-2">
                      <div className="flex justify-between text-white font-semibold text-lg">
                        <span>Total:</span>
                        <span>{formatPrice(Number(product.price))}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-3">
                    <p className="text-green-400 text-sm text-center">
                      ✓ Entrega inmediata garantizada
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="animate-pulse">
              <div className="h-8 bg-slate-700 rounded mb-6 w-1/3 mx-auto"></div>
              <div className="h-32 bg-slate-800/50 rounded-xl"></div>
            </div>
          </div>
        </main>
        <Footer />
      </>
    }>
      <CheckoutContent />
    </Suspense>
  )
}

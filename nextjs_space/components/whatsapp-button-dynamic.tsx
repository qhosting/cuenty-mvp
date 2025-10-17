

'use client'

import { useState, useEffect } from 'react'
import { MessageCircle, Zap } from 'lucide-react'

export function WhatsAppButton() {
  const [mounted, setMounted] = useState(false)
  const [whatsappNumber, setWhatsappNumber] = useState('')

  useEffect(() => {
    setMounted(true)
    
    // Load WhatsApp number from site config
    const loadWhatsAppNumber = async () => {
      try {
        const response = await fetch('/api/site-config')
        if (response.ok) {
          const config = await response.json()
          setWhatsappNumber(config.whatsappNumber || '')
        }
      } catch (error) {
        console.error('Failed to load WhatsApp number:', error)
        // Fallback to hardcoded number if API fails
        setWhatsappNumber('message/IOR2WUU66JVMM1')
      }
    }
    
    loadWhatsAppNumber()
  }, [])

  if (!mounted || !whatsappNumber) {
    return null
  }

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('¡Hola! Me interesa conocer más sobre CUENTY y sus servicios de streaming premium. 🎬')
    const whatsappUrl = whatsappNumber.startsWith('message/') 
      ? `https://wa.me/${whatsappNumber}?text=${message}`
      : `https://wa.me/${whatsappNumber}?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 cursor-pointer group"
      onClick={handleWhatsAppClick}
    >
      <div className="relative">
        {/* Pulse animation rings */}
        <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-20 scale-110"></div>
        <div className="absolute inset-0 bg-green-500 rounded-full animate-ping opacity-10 scale-125"></div>
        
        {/* Button */}
        <div className="relative bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-110 transition-all duration-300 hover:from-green-600 hover:to-green-700">
          <MessageCircle className="w-7 h-7" />
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-slate-900 text-white text-sm px-4 py-3 rounded-xl opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap shadow-lg border border-slate-700 transform translate-y-2 group-hover:translate-y-0">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-green-400" />
            <span className="font-medium">¡Chatea con nosotros!</span>
          </div>
          <div className="text-xs text-slate-400 mt-1">Respuesta inmediata</div>
          <div className="absolute -bottom-2 right-4 w-3 h-3 bg-slate-900 border-r border-b border-slate-700 rotate-45"></div>
        </div>
      </div>
    </div>
  )
}


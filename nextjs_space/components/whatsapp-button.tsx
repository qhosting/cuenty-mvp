
'use client'

import { MessageCircle, Zap } from 'lucide-react'

export function WhatsAppButton() {
  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('¡Hola! Me interesa conocer más sobre CUENTY y sus servicios de streaming premium. 🎬')
    const whatsappUrl = `https://wa.me/message/IOR2WUU66JVMM1?text=${message}`
    window.open(whatsappUrl, '_blank')
  }

  return (
    <div 
      className="fixed bottom-6 right-6 z-50 cursor-pointer group"
      onClick={handleWhatsAppClick}
    >
      <div className="relative">
        {/* Pulse animation */}
        <div className="absolute inset-0 bg-green-500 rounded-full animate-pulse opacity-20 scale-110"></div>
        
        {/* Button */}
        <div className="relative bg-gradient-to-r from-green-500 to-green-600 text-white p-4 rounded-full shadow-lg hover:shadow-xl transform hover:scale-110 transition-all duration-300 hover:from-green-600 hover:to-green-700">
          <MessageCircle className="w-6 h-6" />
        </div>
        
        {/* Tooltip */}
        <div className="absolute bottom-16 right-0 bg-gray-900 text-white text-sm px-3 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            <span>¡Chatea con nosotros!</span>
          </div>
          <div className="absolute -bottom-1 right-4 w-2 h-2 bg-gray-900 rotate-45"></div>
        </div>
      </div>
    </div>
  )
}


'use client'

import React from 'react'

interface IsotipoProps {
  size?: number
  color?: string
  className?: string
  variant?: 'default' | 'minimal' | 'gradient'
}

export function Isotipo({ 
  size = 40, 
  color = '#60B5FF', 
  className = '',
  variant = 'default'
}: IsotipoProps) {
  
  const getColorScheme = () => {
    switch (variant) {
      case 'minimal':
        return {
          primary: color,
          secondary: color,
          accent: color
        }
      case 'gradient':
        return {
          primary: 'url(#cuenty-gradient)',
          secondary: 'url(#cuenty-gradient-secondary)',
          accent: 'url(#cuenty-gradient-accent)'
        }
      default:
        return {
          primary: color,
          secondary: `${color}80`, // 50% opacity
          accent: `${color}CC`      // 80% opacity
        }
    }
  }

  const colors = getColorScheme()
  
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 100 100" 
      className={className}
      role="img"
      aria-label="CUENTY isotipo"
    >
      {/* Definir gradientes para variante gradient */}
      {variant === 'gradient' && (
        <defs>
          <linearGradient id="cuenty-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60B5FF" />
            <stop offset="50%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="cuenty-gradient-secondary" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#60B5FF" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.6" />
          </linearGradient>
          <linearGradient id="cuenty-gradient-accent" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#EF4444" />
          </linearGradient>
        </defs>
      )}

      {/* Letra C estilizada como base */}
      <path
        d="M50 10 
           C 75 10, 90 25, 90 50
           C 90 75, 75 90, 50 90
           C 30 90, 15 75, 15 50
           C 15 35, 25 25, 35 25
           L 35 35
           C 30 35, 25 40, 25 50
           C 25 65, 35 75, 50 75
           C 65 75, 75 65, 75 50
           C 75 35, 65 25, 50 25
           Z"
        fill={colors.primary}
        opacity="0.9"
      />

      {/* Círculo interior representando reproducir/streaming */}
      <circle
        cx="50"
        cy="50"
        r="15"
        fill={colors.secondary}
        opacity="0.8"
      />

      {/* Triángulo de play en el centro */}
      <path
        d="M 45 42 
           L 45 58 
           L 60 50 
           Z"
        fill={colors.accent}
      />

      {/* Puntos decorativos que representan cuentas/usuarios */}
      <circle cx="70" cy="30" r="3" fill={colors.secondary} opacity="0.7" />
      <circle cx="30" cy="70" r="3" fill={colors.secondary} opacity="0.7" />
      
      {/* Líneas de conexión sutiles */}
      <path
        d="M 35 25 Q 45 20, 55 25"
        stroke={colors.accent}
        strokeWidth="2"
        fill="none"
        opacity="0.5"
      />
    </svg>
  )
}

// Componente de ejemplo para mostrar las variantes disponibles
export function IsotipoShowcase() {
  return (
    <div className="flex items-center space-x-8 p-6 bg-slate-100 dark:bg-slate-800 rounded-lg">
      <div className="text-center space-y-2">
        <Isotipo size={60} variant="default" />
        <p className="text-xs text-slate-600 dark:text-slate-400">Default</p>
      </div>
      <div className="text-center space-y-2">
        <Isotipo size={60} variant="gradient" />
        <p className="text-xs text-slate-600 dark:text-slate-400">Gradient</p>
      </div>
      <div className="text-center space-y-2">
        <Isotipo size={60} variant="minimal" color="#10B981" />
        <p className="text-xs text-slate-600 dark:text-slate-400">Minimal</p>
      </div>
      <div className="text-center space-y-2">
        <Isotipo size={60} color="#EF4444" />
        <p className="text-xs text-slate-600 dark:text-slate-400">Custom Color</p>
      </div>
    </div>
  )
}

/*
GUÍA DE PERSONALIZACIÓN DEL ISOTIPO CUENTY

El isotipo es completamente editable através de props:

1. SIZE (Tamaño):
   <Isotipo size={32} />  // Pequeño
   <Isotipo size={48} />  // Mediano  
   <Isotipo size={64} />  // Grande

2. COLOR (Color personalizado):
   <Isotipo color="#60B5FF" />    // Azul (predeterminado)
   <Isotipo color="#10B981" />    // Verde
   <Isotipo color="#EF4444" />    // Rojo
   <Isotipo color="#8B5CF6" />    // Púrpura

3. VARIANT (Variantes de estilo):
   <Isotipo variant="default" />   // Colores con transparencia
   <Isotipo variant="gradient" />  // Gradiente multicolor
   <Isotipo variant="minimal" />   // Un solo color sólido

4. CLASSNAME (Clases CSS adicionales):
   <Isotipo className="hover:scale-110 transition-transform" />

EJEMPLOS DE USO COMÚN:

// En header (mediano, color de marca)
<Isotipo size={40} variant="gradient" />

// En footer (pequeño, color sutil)
<Isotipo size={32} color="#64748B" />

// Como botón (con efectos hover)
<Isotipo size={48} className="hover:scale-105 transition-transform cursor-pointer" />

// Favicon/PWA (tamaño mínimo)
<Isotipo size={24} variant="minimal" />

ELEMENTOS DEL DISEÑO:
- C estilizada: Representa CUENTY
- Círculo con play: Simboliza streaming/reproducción
- Puntos decorativos: Representan cuentas/usuarios
- Líneas de conexión: Simbolizan conectividad

El isotipo funciona perfectamente en fondos claros y oscuros.
*/

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Isotipo } from '@/components/isotipo'

interface DynamicLogoProps {
  size?: 'small' | 'medium' | 'large'
  showText?: boolean
  linkTo?: string
  className?: string
  variant?: 'header' | 'footer' | 'auth'
}

interface SiteConfig {
  logoUrl?: string
  footerLogoUrl?: string
  logoSize: 'small' | 'medium' | 'large'
}

export function DynamicLogo({ 
  size = 'medium', 
  showText = true, 
  linkTo = '/',
  className = '',
  variant = 'header'
}: DynamicLogoProps) {
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const response = await fetch('/api/site-config')
        if (response.ok) {
          const data = await response.json()
          setConfig(data)
        } else {
          setError(true)
        }
      } catch (err) {
        console.error('Failed to load logo config:', err)
        setError(true)
      } finally {
        setLoading(false)
      }
    }
    
    loadConfig()
  }, [])

  // Determine which logo to use based on variant
  const getLogoUrl = () => {
    if (!config) return null
    
    switch (variant) {
      case 'footer':
        return config.footerLogoUrl || config.logoUrl
      case 'auth':
      case 'header':
      default:
        return config.logoUrl
    }
  }

  // Size configurations
  const sizeConfig = {
    small: { 
      width: 96, 
      height: 24, 
      isotipoSize: 32,
      textSize: 'text-lg'
    },
    medium: { 
      width: 128, 
      height: 32, 
      isotipoSize: 40,
      textSize: 'text-xl'
    },
    large: { 
      width: 160, 
      height: 40, 
      isotipoSize: 48,
      textSize: 'text-2xl'
    }
  }

  // Use config size if available, otherwise use prop size
  const effectiveSize = config?.logoSize || size
  const dimensions = sizeConfig[effectiveSize]
  const logoUrl = getLogoUrl()

  // Loading state
  if (loading) {
    return (
      <div className={`flex items-center space-x-3 ${className}`}>
        <div 
          className="bg-slate-700 animate-pulse rounded" 
          style={{ width: dimensions.width, height: dimensions.height }}
        />
      </div>
    )
  }

  // Content to render
  // Para auth pages, centramos el contenido
  const isAuthVariant = variant === 'auth'
  const contentClasses = isAuthVariant 
    ? "flex items-center justify-center space-x-3" 
    : "flex items-center space-x-3"
  
  const logoContent = (
    <div className={contentClasses}>
      {logoUrl && !error ? (
        // Custom logo from database
        <div className="relative" style={{ width: dimensions.width, height: dimensions.height }}>
          <Image
            src={logoUrl}
            alt="CUENTY Logo"
            fill
            className="object-contain"
            priority={variant === 'header'}
            onError={() => setError(true)}
          />
        </div>
      ) : (
        // Fallback to Isotipo SVG
        <>
          <Isotipo 
            size={dimensions.isotipoSize} 
            variant="gradient"
            className="transition-transform hover:scale-105"
          />
          {showText && (
            <span className={`text-white font-bold ${dimensions.textSize}`}>
              CUENTY
            </span>
          )}
        </>
      )}
    </div>
  )

  // Wrap with link if linkTo is provided
  if (linkTo) {
    return (
      <Link href={linkTo} className={className}>
        {logoContent}
      </Link>
    )
  }

  return <div className={className}>{logoContent}</div>
}

// Specialized variants for common use cases
export function HeaderLogo() {
  return (
    <DynamicLogo 
      variant="header"
      showText={true}
      linkTo="/"
      className="transition-opacity hover:opacity-80"
    />
  )
}

export function FooterLogo() {
  return (
    <DynamicLogo 
      variant="footer"
      showText={true}
      linkTo="/"
      className="transition-opacity hover:opacity-80"
    />
  )
}

export function AuthPageLogo() {
  return (
    <div className="flex justify-center w-full">
      <DynamicLogo 
        variant="auth"
        size="large"
        showText={false}
        linkTo="/"
        className="transition-transform hover:scale-105"
      />
    </div>
  )
}

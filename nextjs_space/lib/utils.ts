
import { type ClassValue, clsx } from "clsx"

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN'
  }).format(price)
}

export function formatDuration(days: number): string {
  if (days === 30) return '1 Mes'
  if (days === 90) return '3 Meses' 
  if (days === 180) return '6 Meses'
  if (days === 365) return '1 Año'
  return `${days} días`
}

export function getServiceIcon(category: string): string {
  const icons: Record<string, string> = {
    netflix: 'tv',
    disney: 'sparkles',
    hbo: 'crown',
    prime: 'play',
    spotify: 'music',
    youtube: 'video',
    appletv: 'apple',
    paramount: 'mountain'
  }
  
  const service = category.toLowerCase().replace(/[^a-z]/g, '').substring(0, 7)
  return icons[service] || 'play'
}

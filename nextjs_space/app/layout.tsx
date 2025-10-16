
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { SessionProvider } from '@/components/providers/session-provider'
import { WhatsAppButton } from '@/components/whatsapp-button'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'CUENTY - Cuentas de Streaming Premium',
  description: 'La mejor plataforma para obtener cuentas de streaming premium como Netflix, Disney+, HBO Max y más. Precios accesibles y entrega inmediata.',
  keywords: 'streaming, Netflix, Disney+, HBO Max, cuentas premium, CUENTY',
  authors: [{ name: 'CUENTY Team' }],
  openGraph: {
    title: 'CUENTY - Cuentas de Streaming Premium',
    description: 'La mejor plataforma para obtener cuentas de streaming premium',
    url: 'https://cuenty.com',
    siteName: 'CUENTY',
    type: 'website',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 min-h-screen`}>
        <SessionProvider>
          {children}
          <WhatsAppButton />
        </SessionProvider>
      </body>
    </html>
  )
}

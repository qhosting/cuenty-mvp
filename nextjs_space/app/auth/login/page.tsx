
import { LoginForm } from '@/components/auth/login-form'
import { Header } from '@/components/header'
import Image from 'next/image'

export default function LoginPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 pt-20">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <div className="relative w-32 h-8 mx-auto mb-6">
              <Image
                src="/images/CUENTY.png"
                alt="CUENTY Logo"
                fill
                className="object-contain"
                priority
              />
            </div>
            <h2 className="text-3xl font-bold text-white">
              Inicia Sesión
            </h2>
            <p className="mt-2 text-white/70">
              Accede a tu cuenta de CUENTY
            </p>
          </div>
          <LoginForm />
        </div>
      </div>
    </div>
  )
}

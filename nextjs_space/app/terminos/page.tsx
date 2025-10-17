
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function TerminosPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8">
            <h1 className="text-4xl font-bold text-white mb-8">Términos y Condiciones</h1>
            
            <div className="prose prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">1. Aceptación de Términos</h2>
                <p className="text-slate-300 mb-4">
                  Al acceder y utilizar CUENTY, usted acepta estar sujeto a estos términos y condiciones de uso, 
                  todas las leyes y regulaciones aplicables, y acepta que es responsable del cumplimiento de 
                  cualquier ley local aplicable.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">2. Descripción del Servicio</h2>
                <p className="text-slate-300 mb-4">
                  CUENTY proporciona acceso a cuentas premium de servicios de streaming y entretenimiento. 
                  Todos los servicios se proporcionan "tal como están" y están sujetos a disponibilidad.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">3. Política de Pagos y Reembolsos</h2>
                <p className="text-slate-300 mb-4">
                  Los pagos deben realizarse en su totalidad antes de la entrega del servicio. 
                  Ofrecemos garantía de reembolso en caso de que el servicio no funcione según lo prometido.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">4. Uso Responsable</h2>
                <p className="text-slate-300 mb-4">
                  El usuario se compromete a utilizar los servicios de manera responsable y legal. 
                  Está prohibido el uso indebido, la reventa o el compartir las credenciales con terceros.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">5. Limitación de Responsabilidad</h2>
                <p className="text-slate-300 mb-4">
                  CUENTY no será responsable de daños indirectos, incidentales, especiales o consecuenciales 
                  que resulten del uso o la incapacidad de usar el servicio.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">6. Contacto</h2>
                <p className="text-slate-300">
                  Para cualquier pregunta sobre estos términos, puede contactarnos a través de WhatsApp 
                  o por email a soporte@cuenty.com.
                </p>
              </section>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  )
}

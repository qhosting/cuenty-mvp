
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Servicio - CUENTY',
  description: 'Términos y condiciones de uso de la plataforma CUENTY'
}

export default function TermsPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card">
            <h1 className="text-4xl font-bold text-white mb-8">Términos de Servicio</h1>
            
            <div className="space-y-6 text-white/80">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Aceptación de Términos</h2>
                <p>
                  Al acceder y utilizar CUENTY, aceptas estar sujeto a estos Términos de Servicio y a todas las leyes
                  y regulaciones aplicables. Si no estás de acuerdo con alguno de estos términos, no utilices este servicio.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. Descripción del Servicio</h2>
                <p>
                  CUENTY es una plataforma que facilita el acceso a cuentas premium de servicios de streaming y
                  entretenimiento digital. Actuamos como intermediarios entre proveedores y usuarios finales.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. Uso del Servicio</h2>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Debes ser mayor de 18 años para utilizar este servicio</li>
                  <li>Debes proporcionar información precisa y actualizada</li>
                  <li>Eres responsable de mantener la confidencialidad de tu cuenta</li>
                  <li>No debes compartir las credenciales de las cuentas adquiridas</li>
                  <li>No debes utilizar el servicio para actividades ilegales</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Pagos y Reembolsos</h2>
                <p>
                  Los pagos se procesan de manera segura a través de nuestros proveedores de pago. Los reembolsos
                  están sujetos a nuestra política de garantía de 7 días en caso de problemas técnicos verificables.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Garantías y Soporte</h2>
                <p>
                  Ofrecemos soporte 24/7 para resolver cualquier problema relacionado con las cuentas adquiridas.
                  Nos comprometemos a proporcionar cuentas funcionales y reemplazarlas en caso de inconvenientes.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Limitación de Responsabilidad</h2>
                <p>
                  CUENTY no se hace responsable por interrupciones del servicio causadas por los proveedores
                  originales de las plataformas de streaming. Nuestra responsabilidad se limita al valor
                  pagado por el servicio.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Modificaciones</h2>
                <p>
                  Nos reservamos el derecho de modificar estos términos en cualquier momento. Los cambios
                  entrarán en vigor inmediatamente después de su publicación en el sitio web.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">8. Contacto</h2>
                <p>
                  Para cualquier pregunta sobre estos Términos de Servicio, contáctanos en:
                  <br />
                  <strong>Email:</strong> soporte@cuenty.com
                  <br />
                  <strong>WhatsApp:</strong> +52 55 1234 5678
                </p>
              </section>

              <div className="mt-8 pt-8 border-t border-white/10">
                <p className="text-sm text-white/60">
                  Última actualización: Octubre 2025
                </p>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}

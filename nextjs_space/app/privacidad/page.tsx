
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'

export default function PrivacidadPage() {
  return (
    <>
      <Header />
      <main className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-b from-slate-800/50 to-slate-900/50 backdrop-blur-sm rounded-xl border border-slate-700 p-8">
            <h1 className="text-4xl font-bold text-white mb-8">Política de Privacidad</h1>
            
            <div className="prose prose-invert max-w-none">
              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">1. Información que Recopilamos</h2>
                <p className="text-slate-300 mb-4">
                  Recopilamos información que usted nos proporciona directamente, como su nombre, 
                  email, número de teléfono y información de pago cuando se registra en nuestros servicios.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">2. Cómo Usamos su Información</h2>
                <p className="text-slate-300 mb-4">
                  Utilizamos su información para:
                </p>
                <ul className="list-disc list-inside text-slate-300 mb-4 space-y-2">
                  <li>Procesar y entregar sus pedidos</li>
                  <li>Comunicarnos con usted sobre su cuenta y servicios</li>
                  <li>Proporcionar soporte al cliente</li>
                  <li>Mejorar nuestros servicios</li>
                </ul>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">3. Compartir Información</h2>
                <p className="text-slate-300 mb-4">
                  No vendemos, intercambiamos ni transferimos a terceros su información personal. 
                  Solo compartimos información cuando es necesario para procesar su pedido o cuando 
                  es requerido por la ley.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">4. Seguridad de Datos</h2>
                <p className="text-slate-300 mb-4">
                  Implementamos medidas de seguridad apropiadas para proteger su información personal 
                  contra acceso no autorizado, alteración, divulgación o destrucción.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">5. Cookies</h2>
                <p className="text-slate-300 mb-4">
                  Utilizamos cookies para mejorar su experiencia en nuestro sitio web. 
                  Puede configurar su navegador para rechazar cookies, pero esto puede afectar 
                  la funcionalidad del sitio.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">6. Sus Derechos</h2>
                <p className="text-slate-300 mb-4">
                  Usted tiene derecho a acceder, rectificar, cancelar u oponerse al tratamiento 
                  de sus datos personales. Para ejercer estos derechos, contáctenos a través de 
                  nuestros canales oficiales.
                </p>
              </section>

              <section className="mb-8">
                <h2 className="text-2xl font-semibold text-white mb-4">7. Contacto</h2>
                <p className="text-slate-300">
                  Si tiene preguntas sobre esta política de privacidad, puede contactarnos en 
                  soporte@cuenty.com o a través de WhatsApp.
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

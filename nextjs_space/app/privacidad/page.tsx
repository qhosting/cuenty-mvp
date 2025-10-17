
import { Header } from '@/components/header'
import { Footer } from '@/components/footer'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad - CUENTY',
  description: 'Política de privacidad y protección de datos de CUENTY'
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 pb-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="card">
            <h1 className="text-4xl font-bold text-white mb-8">Política de Privacidad</h1>
            
            <div className="space-y-6 text-white/80">
              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">1. Información que Recopilamos</h2>
                <p className="mb-4">
                  En CUENTY, recopilamos la siguiente información para brindarte un mejor servicio:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li><strong>Información Personal:</strong> Nombre, email, teléfono</li>
                  <li><strong>Información de Pago:</strong> Procesada de forma segura por nuestros proveedores</li>
                  <li><strong>Información de Uso:</strong> Páginas visitadas, interacciones con el sitio</li>
                  <li><strong>Información Técnica:</strong> Dirección IP, tipo de navegador, sistema operativo</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">2. Cómo Utilizamos tu Información</h2>
                <p className="mb-4">
                  Utilizamos tu información para:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Procesar y gestionar tus pedidos</li>
                  <li>Proporcionarte soporte al cliente</li>
                  <li>Enviarte notificaciones importantes sobre tu cuenta</li>
                  <li>Mejorar nuestros servicios y experiencia de usuario</li>
                  <li>Cumplir con obligaciones legales</li>
                  <li>Prevenir fraudes y garantizar la seguridad</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">3. Protección de Datos</h2>
                <p>
                  Implementamos medidas de seguridad técnicas y organizativas para proteger tu información personal:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>Encriptación SSL/TLS para todas las transmisiones de datos</li>
                  <li>Almacenamiento seguro en servidores protegidos</li>
                  <li>Acceso limitado solo a personal autorizado</li>
                  <li>Monitoreo regular de seguridad y auditorías</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">4. Compartir Información</h2>
                <p>
                  No vendemos ni compartimos tu información personal con terceros, excepto:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4 mt-4">
                  <li>Proveedores de servicios que nos ayudan a operar el negocio</li>
                  <li>Cuando sea requerido por ley o proceso legal</li>
                  <li>Para proteger nuestros derechos legales</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">5. Cookies y Tecnologías Similares</h2>
                <p>
                  Utilizamos cookies para mejorar tu experiencia. Las cookies son pequeños archivos que se almacenan
                  en tu dispositivo y nos ayudan a recordar tus preferencias y analizar el uso del sitio.
                  Puedes configurar tu navegador para rechazar cookies, aunque esto puede limitar algunas funcionalidades.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">6. Tus Derechos</h2>
                <p className="mb-4">
                  Tienes derecho a:
                </p>
                <ul className="list-disc list-inside space-y-2 ml-4">
                  <li>Acceder a tu información personal</li>
                  <li>Rectificar datos inexactos</li>
                  <li>Solicitar la eliminación de tus datos</li>
                  <li>Oponerte al procesamiento de tus datos</li>
                  <li>Solicitar la portabilidad de tus datos</li>
                  <li>Retirar el consentimiento en cualquier momento</li>
                </ul>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">7. Retención de Datos</h2>
                <p>
                  Conservamos tu información personal solo durante el tiempo necesario para cumplir con los
                  propósitos descritos en esta política, o según lo requiera la ley.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">8. Menores de Edad</h2>
                <p>
                  Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos
                  conscientemente información de menores de edad.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">9. Cambios a esta Política</h2>
                <p>
                  Podemos actualizar esta Política de Privacidad ocasionalmente. Te notificaremos sobre
                  cambios significativos mediante un aviso en nuestro sitio web o por email.
                </p>
              </section>

              <section>
                <h2 className="text-2xl font-semibold text-white mb-4">10. Contacto</h2>
                <p>
                  Si tienes preguntas sobre esta Política de Privacidad o cómo manejamos tus datos,
                  contáctanos en:
                  <br />
                  <strong>Email:</strong> privacidad@cuenty.com
                  <br />
                  <strong>WhatsApp:</strong> +52 55 1234 5678
                  <br />
                  <strong>Dirección:</strong> Ciudad de México, México
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

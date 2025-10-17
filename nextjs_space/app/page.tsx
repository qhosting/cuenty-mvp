
import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section-ecommerce'
import { ProductShowcase } from '@/components/product-showcase'
import { WhyChooseUs } from '@/components/why-choose-us'
import { HowItWorks } from '@/components/how-it-works-ecommerce'
import { ServicesSection } from '@/components/services-section'
import { Footer } from '@/components/footer'
import { WhatsAppButton } from '@/components/whatsapp-button-dynamic'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950">
      <Header />
      <HeroSection />
      <ServicesSection />
      <ProductShowcase />
      <WhyChooseUs />
      <HowItWorks />
      <Footer />
      <WhatsAppButton />
    </main>
  )
}

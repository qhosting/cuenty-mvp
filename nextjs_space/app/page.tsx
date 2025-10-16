
import { Header } from '@/components/header'
import { HeroSection } from '@/components/hero-section'
import { ProductCatalog } from '@/components/product-catalog'
import { FeaturesSection } from '@/components/features-section'
import { HowItWorksSection } from '@/components/how-it-works-section'
import { FAQSection } from '@/components/faq-section'
import { Footer } from '@/components/footer'

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <Header />
      <HeroSection />
      <ProductCatalog />
      <FeaturesSection />
      <HowItWorksSection />
      <FAQSection />
      <Footer />
    </main>
  )
}

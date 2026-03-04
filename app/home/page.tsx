import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import HeroSection from '@/components/HeroSection'
import FeatureGrid from '@/components/FeatureGrid'
import HowItWorks from '@/components/HowItWorks'
import AIHighlight from '@/components/AIHighlight'
import CTASection from '@/components/CTASection'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-krishi-bg">
      <Navbar />
      <HeroSection />
      <FeatureGrid />
      <HowItWorks />
      <AIHighlight />
      <CTASection />
      <Footer />
    </div>
  )
}

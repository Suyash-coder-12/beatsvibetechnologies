import Navigation from "@/components/navigation"
import Hero from "@/components/hero"
import Features from "@/components/features"
import CoursesPreview from "@/components/courses-preview"
import Testimonials from "@/components/testimonials"
import Newsletter from "@/components/newsletter"
import Footer from "@/components/footer"

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-background via-background to-background">
      <Navigation />
      <Hero />
      <Features />
      <CoursesPreview />
      <Testimonials />
      <Newsletter />
      <Footer />
    </div>
  )
}

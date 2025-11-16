import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function AboutPage() {
  const values = [
    { title: "Excellence", description: "We deliver high-quality education and real-world training." },
    { title: "Innovation", description: "We stay ahead of tech trends and adapt our curriculum." },
    { title: "Impact", description: "We transform lives through tech education and opportunity." },
    { title: "Integrity", description: "We maintain transparency and honesty in all our dealings." },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-12 md:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">About BeatsVibe</h1>
          <p className="text-lg text-foreground/60">
            Learn about our mission, vision, and the team behind BeatsVibe Technologies.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-4">Our Mission</h2>
              <p className="text-foreground/70 leading-relaxed mb-4">
                To empower individuals with cutting-edge tech skills and real-world experience, enabling them to build
                meaningful careers and make a positive impact in the tech industry.
              </p>
              <h2 className="text-3xl font-bold text-foreground mb-4 mt-8">Our Vision</h2>
              <p className="text-foreground/70 leading-relaxed">
                To be the world's leading platform for tech education, where knowledge meets opportunity, and dreams
                transform into successful careers.
              </p>
            </div>
            <div className="bg-gradient-to-br from-primary/20 to-secondary/20 rounded-lg h-96" />
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">Our Values</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
              <div key={index} className="p-6 rounded-lg border border-border bg-card">
                <h3 className="text-xl font-semibold text-foreground mb-2">{value.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{value.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

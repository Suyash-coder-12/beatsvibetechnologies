import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function CareerSupportPage() {
  const services = [
    {
      title: "Resume & Profile Optimization",
      description:
        "Get your resume reviewed and optimized by career experts. Learn how to showcase your projects and skills effectively.",
      icon: "📄",
    },
    {
      title: "Interview Preparation",
      description:
        "Mock interviews, technical question practice, and behavioral interview coaching from experienced professionals.",
      icon: "🎯",
    },
    {
      title: "Mentorship Program",
      description:
        "Get paired with industry mentors who guide your career path, provide feedback, and open networking opportunities.",
      icon: "🤝",
    },
    {
      title: "Job Placement Assistance",
      description:
        "Access to our network of partner companies and exclusive job opportunities tailored to your skills.",
      icon: "🚀",
    },
    {
      title: "LinkedIn & Personal Branding",
      description: "Build a strong online presence. Learn how to market yourself and network effectively on LinkedIn.",
      icon: "💼",
    },
    {
      title: "Salary Negotiation",
      description: "Master the art of negotiation. Understand market rates and learn strategies to get the best offer.",
      icon: "💰",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-12 md:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Career Support</h1>
          <p className="text-lg text-foreground/60 max-w-2xl">
            We don't just teach skills—we help you launch your tech career. Our comprehensive career support programs
            are designed to accelerate your professional growth.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {services.map((service, index) => (
              <div
                key={index}
                className="p-6 rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <div className="text-4xl mb-4">{service.icon}</div>
                <h3 className="text-lg font-semibold text-foreground mb-2">{service.title}</h3>
                <p className="text-sm text-foreground/60 leading-relaxed">{service.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">Our Placement Success</h2>
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">95%</div>
              <p className="text-foreground/60">Placement Rate</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">12,000+</div>
              <p className="text-foreground/60">Students Placed</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">8.5 LPA</div>
              <p className="text-foreground/60">Average Salary</p>
            </div>
            <div>
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2">500+</div>
              <p className="text-foreground/60">Partner Companies</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

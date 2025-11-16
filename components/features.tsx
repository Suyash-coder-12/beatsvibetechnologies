export default function Features() {
  const features = [
    {
      title: "Learn from Experts",
      description: "Industry professionals teach cutting-edge tech skills with real-world applications.",
      icon: "🎓",
    },
    {
      title: "Real-World Projects",
      description: "Build portfolio projects that matter and showcase your skills to employers.",
      icon: "⚙️",
    },
    {
      title: "Career Support",
      description: "Resume building, placement assistance, and mentorship programs included.",
      icon: "🚀",
    },
    {
      title: "Live Training",
      description: "Interactive live sessions with Q&A to accelerate your learning journey.",
      icon: "💬",
    },
  ]

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Why Choose BeatsVibe?</h2>
          <p className="text-lg text-foreground/60 max-w-2xl mx-auto">
            We provide comprehensive tech education with career advancement at every step.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/20 transition-all transform hover:scale-105 duration-300 animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="text-4xl mb-4">{feature.icon}</div>
              <h3 className="text-lg font-semibold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm text-foreground/60">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

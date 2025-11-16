import { Star } from 'lucide-react'

export default function Testimonials() {
  const testimonials = [
    {
      name: "Aisha Patel",
      role: "Data Analyst",
      company: "Tech Corp",
      text: "BeatsVibe transformed my career. The courses were practical and the mentorship was invaluable. I landed my dream job within 3 months!",
      rating: 5,
    },
    {
      name: "Marcus Johnson",
      role: "Full Stack Developer",
      company: "StartUp Inc",
      text: "The real-world projects in the Web Development course gave me portfolio pieces I could show employers. Highly recommended!",
      rating: 5,
    },
    {
      name: "Sofia Chen",
      role: "ML Engineer",
      company: "AI Solutions",
      text: "The Machine Learning program covered everything from basics to advanced techniques. The instructors are truly experts in their field.",
      rating: 5,
    },
    {
      name: "James Wilson",
      role: "Junior Developer",
      company: "Digital Agency",
      text: "Starting from zero coding knowledge, BeatsVibe made it easy to learn programming. The support team is always there to help.",
      rating: 5,
    },
  ]

  return (
    <section className="py-20 md:py-28 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 animate-fadeInUp">
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Success Stories</h2>
          <p className="text-lg text-foreground/60">Hear from our students who transformed their careers</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={index}
              className="p-6 rounded-lg border border-border bg-card hover:border-primary/30 hover:shadow-lg hover:shadow-primary/20 transition-all transform hover:scale-105 duration-300 animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className="flex gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={16} className="fill-yellow-400 text-yellow-400" />
                ))}
              </div>
              <p className="text-sm text-foreground/70 mb-4 leading-relaxed">"{testimonial.text}"</p>
              <div>
                <p className="font-semibold text-foreground">{testimonial.name}</p>
                <p className="text-xs text-foreground/60">
                  {testimonial.role} at {testimonial.company}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { CheckCircle } from "lucide-react"

export default function InternshipsPage() {
  const programs = [
    {
      title: "Data Analytics Internship",
      duration: "3 months",
      stipend: "$500/month",
      description: "Work with real datasets and analytics tools in a professional environment.",
      benefits: [
        "Mentorship from senior analysts",
        "Real projects for partner companies",
        "Industry certificate",
        "Job placement assistance",
      ],
    },
    {
      title: "Web Development Internship",
      duration: "3 months",
      stipend: "$600/month",
      description: "Contribute to live web projects and build production-level applications.",
      benefits: [
        "Full-stack development experience",
        "Code review and feedback",
        "Portfolio project",
        "Potential full-time offer",
      ],
    },
    {
      title: "Machine Learning Internship",
      duration: "4 months",
      stipend: "$700/month",
      description: "Develop ML models and solutions for real business problems.",
      benefits: ["Advanced ML project", "Research paper publication", "Expert mentorship", "Career development"],
    },
    {
      title: "Full-Stack Development Internship",
      duration: "3 months",
      stipend: "$650/month",
      description: "Comprehensive internship covering frontend, backend, and deployment.",
      benefits: [
        "End-to-end project development",
        "DevOps and deployment training",
        "Team collaboration experience",
        "Networking opportunities",
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-12 md:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Internship Programs</h1>
          <p className="text-lg text-foreground/60 max-w-2xl">
            Gain real-world experience with our industry-recognized internship programs. Work on live projects while
            getting mentored by experienced professionals.
          </p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 gap-8">
            {programs.map((program, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card p-8 hover:border-primary/50 hover:shadow-lg transition-all"
              >
                <h3 className="text-2xl font-bold text-foreground mb-2">{program.title}</h3>
                <div className="flex gap-4 mb-4 text-sm text-foreground/60">
                  <span>📅 {program.duration}</span>
                  <span>💰 {program.stipend}</span>
                </div>
                <p className="text-foreground/70 mb-6 leading-relaxed">{program.description}</p>
                <div className="space-y-3 mb-6">
                  <h4 className="font-semibold text-foreground">Program Benefits:</h4>
                  {program.benefits.map((benefit, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-foreground/70">
                      <CheckCircle size={18} className="text-primary flex-shrink-0" />
                      <span>{benefit}</span>
                    </div>
                  ))}
                </div>
                <button className="w-full px-6 py-2 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium">
                  Apply Now
                </button>
              </div>
            ))}
          </div>

          <div className="mt-16 rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 p-12">
            <h3 className="text-2xl font-bold text-foreground mb-4">Internship Application Requirements</h3>
            <ul className="space-y-2 text-foreground/70">
              <li>✓ Completion of relevant course or equivalent experience</li>
              <li>✓ Portfolio or GitHub profile showcasing your projects</li>
              <li>✓ Technical interview with our team</li>
              <li>✓ Commitment to 3-4 months of full-time work</li>
              <li>✓ Strong communication and teamwork skills</li>
            </ul>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

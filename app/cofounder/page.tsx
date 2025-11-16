"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function CoFounderPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-background py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fadeInUp">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent mb-4">
              Our Co-Founder
            </h1>
            <p className="text-xl text-gray-400">Meet the strategic mind driving innovation</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="animate-slideInRight">
              <div className="bg-gradient-to-br from-accent/20 to-primary/20 border border-border rounded-lg p-12 h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-accent to-primary rounded-full mb-4">
                    <span className="text-4xl font-bold text-white">NR</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 animate-fadeInUp">
              <div>
                <h2 className="text-4xl font-bold mb-2">Nishant Rathod</h2>
                <p className="text-accent font-semibold text-lg mb-4">Co-Founder & CTO</p>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed">
                Nishant Rathod is a tech innovator and software architect who brings technical expertise and strategic vision to BeatsVibe Technologies. With a strong background in software development and system design, he ensures the platform delivers the best learning experience.
              </p>

              <p className="text-gray-300 text-lg leading-relaxed">
                As CTO, Nishant leads the technical roadmap and platform development, implementing cutting-edge technologies to create a seamless learning environment. His commitment to excellence drives continuous improvement and innovation at BeatsVibe.
              </p>

              <div className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {["Software Architecture", "Full Stack Development", "Cloud Technologies", "System Design", "Tech Leadership"].map(
                    (skill) => (
                      <span
                        key={skill}
                        className="px-4 py-2 bg-accent/20 border border-accent/50 text-accent rounded-full text-sm font-medium"
                      >
                        {skill}
                      </span>
                    )
                  )}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-lg p-8 mb-20 animate-fadeInUp" style={{ animationDelay: "0.2s" }}>
            <h3 className="text-2xl font-bold mb-4">Technical Philosophy</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              "Technology should empower people, not complicate their lives. At BeatsVibe, we build with simplicity, scalability, and security at the core. Our platform is designed to adapt to learners' needs, providing personalized experiences through intelligent technology. I'm passionate about creating systems that not only work well but inspire and educate the next generation of developers."
            </p>
          </div>

          <div className="text-center animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-2xl font-bold mb-4">Connect with Nishant</h3>
            <p className="text-gray-400 mb-6">Reach out to discuss technical innovations and platform developments</p>
            <div className="flex justify-center gap-4">
              <a href="mailto:info@beatsvibetechnologies.com" className="px-6 py-3 bg-gradient-to-r from-accent to-primary text-white font-semibold rounded-lg hover:opacity-90 transition">
                Send Email
              </a>
              <a href="tel:+917796759625" className="px-6 py-3 border border-accent text-accent font-semibold rounded-lg hover:bg-accent/10 transition">
                Call Us
              </a>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

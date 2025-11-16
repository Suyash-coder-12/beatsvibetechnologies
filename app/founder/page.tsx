"use client"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function FounderPage() {
  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-background py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-20 animate-fadeInUp">
            <h1 className="text-5xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-4">
              Our Founder
            </h1>
            <p className="text-xl text-gray-400">Meet the visionary behind BeatsVibe Technologies</p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
            <div className="animate-slideInRight">
              <div className="bg-gradient-to-br from-primary/20 to-accent/20 border border-border rounded-lg p-12 h-96 flex items-center justify-center">
                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-32 h-32 bg-gradient-to-r from-primary to-accent rounded-full mb-4">
                    <span className="text-4xl font-bold text-white">Suyash Rathod</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-6 animate-fadeInUp">
              <div>
                <h2 className="text-4xl font-bold mb-2">Suyash Rathod</h2>
                <p className="text-primary font-semibold text-lg mb-4">Founder & CEO</p>
              </div>

              <p className="text-gray-300 text-lg leading-relaxed">
                Suyash Rathod is a visionary entrepreneur and tech enthusiast with a passion for making quality education accessible to everyone. With years of experience in the technology sector, he founded BeatsVibe Technologies to revolutionize tech education.
              </p>

              <p className="text-gray-300 text-lg leading-relaxed">
                His mission is to empower aspiring developers and data professionals with world-class training, practical experience, and real-world projects. Under his leadership, BeatsVibe has helped thousands of students launch successful careers in technology.
              </p>

              <div className="pt-6">
                <h3 className="text-xl font-semibold mb-4">Expertise</h3>
                <div className="flex flex-wrap gap-2">
                  {["Web Development", "Entrepreneurship", "Tech Education", "Business Strategy", "Innovation"].map(
                    (skill) => (
                      <span
                        key={skill}
                        className="px-4 py-2 bg-primary/20 border border-primary/50 text-primary rounded-full text-sm font-medium"
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
            <h3 className="text-2xl font-bold mb-4">Vision</h3>
            <p className="text-gray-300 text-lg leading-relaxed">
              "I believe that quality tech education should not be limited by geography or financial constraints. My vision is to create a platform where anyone, anywhere can learn cutting-edge technologies, gain practical skills, and build successful careers. BeatsVibe Technologies is more than just an educational platform—it's a movement to democratize tech education and create opportunities for the next generation of innovators and problem-solvers."
            </p>
          </div>

          <div className="text-center animate-fadeInUp" style={{ animationDelay: "0.4s" }}>
            <h3 className="text-2xl font-bold mb-4">Connect with Suyash</h3>
            <p className="text-gray-400 mb-6">Follow our founder's journey and insights in tech education</p>
            <div className="flex justify-center gap-4">
              <a href="mailto:info@beatsvibetechnologies.com" className="px-6 py-3 bg-gradient-to-r from-primary to-accent text-white font-semibold rounded-lg hover:opacity-90 transition">
                Send Email
              </a>
              <a href="tel:+919022016169" className="px-6 py-3 border border-primary text-primary font-semibold rounded-lg hover:bg-primary/10 transition">
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

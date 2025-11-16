"use client"

import type React from "react"

import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { useState } from "react"
import { Mail, Phone, MapPin } from "lucide-react"

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setFormData({ name: "", email: "", phone: "", subject: "", message: "" })
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-12 md:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Get in Touch</h1>
          <p className="text-lg text-foreground/60">Have questions? We'd love to hear from you. Contact us anytime.</p>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8 mb-12">
            <div className="p-6 rounded-lg border border-border bg-card text-center">
              <Mail className="mx-auto mb-4 text-primary" size={32} />
              <h3 className="font-semibold text-foreground mb-2">Email</h3>
              <p className="text-sm text-foreground/60">support@beatsvibe.com</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card text-center">
              <Phone className="mx-auto mb-4 text-primary" size={32} />
              <h3 className="font-semibold text-foreground mb-2">Phone</h3>
              <p className="text-sm text-foreground/60">+1 (555) 123-4567</p>
            </div>
            <div className="p-6 rounded-lg border border-border bg-card text-center">
              <MapPin className="mx-auto mb-4 text-primary" size={32} />
              <h3 className="font-semibold text-foreground mb-2">Address</h3>
              <p className="text-sm text-foreground/60">123 Tech Street, San Francisco, CA</p>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-2xl font-bold text-foreground mb-6">Send us a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <input
                  type="text"
                  name="name"
                  placeholder="Your Name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="email"
                  name="email"
                  placeholder="Your Email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Your Phone"
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <select
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  <option value="">Select Subject</option>
                  <option value="course">Course Inquiry</option>
                  <option value="internship">Internship Application</option>
                  <option value="career">Career Support</option>
                  <option value="other">Other</option>
                </select>
                <textarea
                  name="message"
                  placeholder="Your Message"
                  value={formData.message}
                  onChange={handleChange}
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-lg border border-border bg-card text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50"
                />
                <button
                  type="submit"
                  className="w-full px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium"
                >
                  Send Message
                </button>
              </form>
              {submitted && <p className="text-sm text-green-600 mt-4">✓ Thank you! We'll get back to you soon.</p>}
            </div>

            <div className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-lg p-8 border border-primary/20 h-fit">
              <h3 className="text-xl font-bold text-foreground mb-4">Business Hours</h3>
              <div className="space-y-2 text-foreground/70 mb-8">
                <p>Monday - Friday: 9:00 AM - 6:00 PM (EST)</p>
                <p>Saturday: 10:00 AM - 4:00 PM (EST)</p>
                <p>Sunday: Closed</p>
              </div>

              <h3 className="text-xl font-bold text-foreground mb-4">Quick FAQ</h3>
              <ul className="space-y-3 text-sm text-foreground/60">
                <li>• Response time: Within 24 hours</li>
                <li>• Payment plans available</li>
                <li>• Money-back guarantee (30 days)</li>
                <li>• Free trial courses available</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

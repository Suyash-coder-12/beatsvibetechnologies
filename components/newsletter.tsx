"use client"

import type React from "react"

import { useState } from "react"
import { Mail } from 'lucide-react'

export default function Newsletter() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)
    setEmail("")
    setTimeout(() => setSubmitted(false), 3000)
  }

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-lg bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 p-12 text-center animate-fadeInUp hover:border-primary/40 transition-all duration-300">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Stay Updated</h2>
          <p className="text-foreground/60 mb-8 max-w-xl mx-auto">
            Subscribe to our newsletter for the latest courses, tips, and career opportunities.
          </p>

          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto">
            <div className="flex-1 relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-foreground/40" size={20} />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full pl-10 pr-4 py-3 rounded-full border border-border bg-card text-foreground placeholder:text-foreground/40 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium whitespace-nowrap hover:scale-105 duration-300"
            >
              Subscribe
            </button>
          </form>

          {submitted && <p className="text-sm text-green-600 mt-4 animate-fadeInUp">✓ Thank you! Check your email for confirmation.</p>}
        </div>
      </div>
    </section>
  )
}

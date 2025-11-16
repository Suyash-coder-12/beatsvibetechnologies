"use client"

import Link from "next/link"
import { ArrowRight } from 'lucide-react'

export default function Hero() {
  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-secondary/10" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="space-y-6 animate-fadeInUp">
          <div className="inline-block px-4 py-2 rounded-full bg-accent/10 border border-accent/20">
            <p className="text-sm text-accent">Welcome to Your Future</p>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold text-foreground leading-tight">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">
              Empower Your Future
            </span>
            <br />
            with Tech Skills that Matter
          </h1>

          <p className="text-lg text-foreground/70 max-w-2xl mx-auto leading-relaxed">
            Learn Data Analytics, Programming, Web Development, Machine Learning, and more. Join industry experts and
            real-world internships to transform your passion into a career.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
            <Link
              href="/courses"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors font-medium gap-2 hover:scale-105 duration-300"
            >
              Explore Courses
              <ArrowRight size={20} />
            </Link>
            <Link
              href="/internships"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors font-medium"
            >
              Join Internship
            </Link>
            <Link
              href="/signin"
              className="inline-flex items-center justify-center px-8 py-3 rounded-full border border-primary/30 text-primary hover:bg-primary/5 transition-colors font-medium"
            >
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}

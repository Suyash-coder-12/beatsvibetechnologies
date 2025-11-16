import Link from "next/link"
import { ArrowRight } from 'lucide-react'

export default function CoursesPreview() {
  const courses = [
    {
      title: "Data Analytics",
      description: "Master data analysis, visualization, and insights using Python and SQL.",
      level: "Beginner to Advanced",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Web Development",
      description: "Build modern web applications with React, Next.js, and full-stack technologies.",
      level: "Beginner to Intermediate",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Machine Learning",
      description: "Learn AI/ML fundamentals, algorithms, and practical implementations with TensorFlow.",
      level: "Intermediate to Advanced",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Programming Fundamentals",
      description: "Start your coding journey with Python, JavaScript, and core programming concepts.",
      level: "Beginner",
      color: "from-orange-500 to-red-500",
    },
  ]

  return (
    <section className="py-20 md:py-28">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-12">
          <div className="animate-fadeInUp">
            <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Featured Courses</h2>
            <p className="text-lg text-foreground/60">Choose from our range of industry-focused courses</p>
          </div>
          <Link
            href="/courses"
            className="hidden md:inline-flex items-center gap-2 text-primary hover:gap-3 transition-all font-medium"
          >
            View All Courses
            <ArrowRight size={20} />
          </Link>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {courses.map((course, index) => (
            <div
              key={index}
              className="group cursor-pointer rounded-lg border border-border bg-card hover:border-primary/50 transition-all overflow-hidden hover:shadow-lg hover:shadow-primary/20 transform hover:scale-105 duration-300 animate-fadeInUp"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div
                className={`h-32 bg-gradient-to-r ${course.color} opacity-20 group-hover:opacity-30 transition-opacity`}
              />
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-2">{course.title}</h3>
                <p className="text-sm text-foreground/60 mb-4 leading-relaxed">{course.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                    {course.level}
                  </span>
                  <ArrowRight
                    size={18}
                    className="text-primary/40 group-hover:text-primary group-hover:translate-x-1 transition-all"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>

        <Link
          href="/courses"
          className="md:hidden mt-8 block w-full px-6 py-3 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 transition-colors text-center font-medium"
        >
          View All Courses
        </Link>
      </div>
    </section>
  )
}

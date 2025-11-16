import Navigation from "@/components/navigation"
import Footer from "@/components/footer"
import { ArrowRight } from "lucide-react"

export default function CoursesPage() {
  const categories = [
    { id: "data", name: "Data Analytics", icon: "📊" },
    { id: "web", name: "Web Development", icon: "🌐" },
    { id: "ml", name: "Machine Learning", icon: "🤖" },
    { id: "programming", name: "Programming", icon: "💻" },
  ]

  const courses = [
    {
      category: "data",
      title: "Data Analytics Fundamentals",
      description: "Learn data manipulation, analysis, and visualization with Python and SQL.",
      duration: "8 weeks",
      level: "Beginner",
      price: "$299",
      students: "2,500+",
    },
    {
      category: "data",
      title: "Advanced Data Analytics",
      description: "Master statistical analysis, predictive modeling, and business intelligence.",
      duration: "10 weeks",
      level: "Advanced",
      price: "$399",
      students: "1,200+",
    },
    {
      category: "web",
      title: "React & Next.js Mastery",
      description: "Build modern web applications with React, Next.js, and full-stack development.",
      duration: "12 weeks",
      level: "Intermediate",
      price: "$349",
      students: "3,100+",
    },
    {
      category: "web",
      title: "Web Design & Development",
      description: "Complete guide to creating beautiful, responsive websites from design to deployment.",
      duration: "10 weeks",
      level: "Beginner",
      price: "$279",
      students: "2,800+",
    },
    {
      category: "ml",
      title: "Machine Learning Fundamentals",
      description: "Introduction to ML algorithms, model building, and practical implementations.",
      duration: "10 weeks",
      level: "Intermediate",
      price: "$449",
      students: "1,600+",
    },
    {
      category: "ml",
      title: "Deep Learning & Neural Networks",
      description: "Advanced deep learning techniques, CNNs, RNNs, and computer vision applications.",
      duration: "12 weeks",
      level: "Advanced",
      price: "$499",
      students: "900+",
    },
    {
      category: "programming",
      title: "Python for Beginners",
      description: "Start your programming journey with Python fundamentals and best practices.",
      duration: "6 weeks",
      level: "Beginner",
      price: "$199",
      students: "4,200+",
    },
    {
      category: "programming",
      title: "JavaScript & Web Technologies",
      description: "Master JavaScript, DOM manipulation, and modern web technologies.",
      duration: "8 weeks",
      level: "Beginner",
      price: "$249",
      students: "3,500+",
    },
  ]

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <section className="py-12 md:py-16 border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">Our Courses</h1>
          <p className="text-lg text-foreground/60">
            Choose from our comprehensive range of tech courses taught by industry experts.
          </p>
        </div>
      </section>

      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
            {categories.map((cat) => (
              <button
                key={cat.id}
                className="p-4 rounded-lg border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-center"
              >
                <div className="text-3xl mb-2">{cat.icon}</div>
                <p className="font-medium text-foreground text-sm">{cat.name}</p>
              </button>
            ))}
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {courses.map((course, index) => (
              <div
                key={index}
                className="rounded-lg border border-border bg-card hover:border-primary/50 hover:shadow-lg transition-all p-6 flex flex-col"
              >
                <div className="mb-4">
                  <span className="inline-block px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                    {course.level}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-foreground mb-2 leading-snug">{course.title}</h3>
                <p className="text-sm text-foreground/60 mb-4 flex-grow leading-relaxed">{course.description}</p>
                <div className="space-y-2 text-xs text-foreground/60 mb-4 pb-4 border-b border-border">
                  <div className="flex justify-between">
                    <span>Duration:</span>
                    <span className="font-medium">{course.duration}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Students:</span>
                    <span className="font-medium">{course.students}</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold text-primary">{course.price}</span>
                  <button className="p-2 rounded-full hover:bg-primary/10 text-primary transition-colors">
                    <ArrowRight size={20} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  )
}

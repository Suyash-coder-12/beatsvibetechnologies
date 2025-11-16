"use client"

import { useEffect, useState } from "react"
import { useRouter } from 'next/navigation'
import Navigation from "@/components/navigation"
import Footer from "@/components/footer"

export default function Dashboard() {
  const router = useRouter()
  const [user, setUser] = useState<{ email: string } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      setUser(JSON.parse(storedUser))
      setLoading(false)
    } else {
      router.push("/signin")
    }
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem("user")
    router.push("/")
  }

  if (loading) {
    return (
      <>
        <Navigation />
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-pulse text-xl text-gray-400">Loading...</div>
        </div>
        <Footer />
      </>
    )
  }

  return (
    <>
      <Navigation />
      <div className="min-h-screen bg-gradient-to-b from-background via-background to-background py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="animate-fadeInUp">
            <div className="flex justify-between items-center mb-8">
              <div>
                <h1 className="text-4xl font-bold mb-2">Welcome back!</h1>
                <p className="text-gray-400 text-lg">Signed in as {user?.email}</p>
              </div>
              <button
                onClick={handleLogout}
                className="px-6 py-3 bg-red-600/20 border border-red-600/50 text-red-400 font-semibold rounded-lg hover:bg-red-600/30 transition"
              >
                Logout
              </button>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              {[
                { title: "Courses Enrolled", value: "5", icon: "📚" },
                { title: "Hours Learned", value: "124", icon: "⏱️" },
                { title: "Certificates", value: "2", icon: "🏆" },
              ].map((stat, idx) => (
                <div key={idx} className="bg-card border border-border rounded-lg p-6">
                  <div className="text-3xl mb-2">{stat.icon}</div>
                  <h3 className="text-gray-400 text-sm mb-1">{stat.title}</h3>
                  <p className="text-3xl font-bold">{stat.value}</p>
                </div>
              ))}
            </div>

            <div className="bg-card border border-border rounded-lg p-8">
              <h2 className="text-2xl font-bold mb-6">Your Courses</h2>
              <div className="space-y-4">
                {["Web Development Bootcamp", "Data Analytics Pro", "ML/AI Fundamentals"].map((course, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-background rounded-lg border border-border">
                    <div>
                      <h3 className="font-semibold">{course}</h3>
                      <p className="text-gray-400 text-sm">Progress: {Math.floor(Math.random() * 100)}%</p>
                    </div>
                    <div className="w-48 bg-background rounded-full h-2">
                      <div className="bg-gradient-to-r from-primary to-accent h-2 rounded-full" style={{ width: Math.floor(Math.random() * 100) + "%" }}></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  )
}

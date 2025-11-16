import Link from "next/link"
import { Mail, Phone, Linkedin, Twitter, Facebook } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-foreground/5 border-t border-border py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8 mb-8">
          <div>
            <h3 className="font-bold text-lg text-foreground mb-4">BeatsVibe</h3>
            <p className="text-sm text-foreground/60 leading-relaxed">
              Empowering the next generation of tech professionals with world-class education and real-world experience.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/founder" className="text-foreground/60 hover:text-primary transition">
                  Founder
                </Link>
              </li>
              <li>
                <Link href="/cofounder" className="text-foreground/60 hover:text-primary transition">
                  Co-Founder
                </Link>
              </li>
              <li>
                <Link href="/courses" className="text-foreground/60 hover:text-primary transition">
                  Courses
                </Link>
              </li>
              <li>
                <Link href="/internships" className="text-foreground/60 hover:text-primary transition">
                  Internships
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-foreground/60 hover:text-primary transition">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-foreground/60 hover:text-primary transition">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Learn</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/courses?cat=data" className="text-foreground/60 hover:text-primary transition">
                  Data Analytics
                </Link>
              </li>
              <li>
                <Link href="/courses?cat=web" className="text-foreground/60 hover:text-primary transition">
                  Web Development
                </Link>
              </li>
              <li>
                <Link href="/courses?cat=ml" className="text-foreground/60 hover:text-primary transition">
                  Machine Learning
                </Link>
              </li>
              <li>
                <Link href="/courses?cat=programming" className="text-foreground/60 hover:text-primary transition">
                  Programming
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-foreground mb-4">Connect</h4>
            <div className="flex gap-4 mb-4">
              <Link href="#" className="text-foreground/60 hover:text-primary" aria-label="LinkedIn">
                <Linkedin size={20} />
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-primary" aria-label="Twitter">
                <Twitter size={20} />
              </Link>
              <Link href="#" className="text-foreground/60 hover:text-primary" aria-label="Facebook">
                <Facebook size={20} />
              </Link>
            </div>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2 text-foreground/60">
                <Mail size={16} />
                <a href="mailto:info@beatsvibetechnologies.com" className="hover:text-primary transition">
                  info@beatsvibetechnologies.com
                </a>
              </div>
              <div className="flex items-start gap-2 text-foreground/60">
                <Phone size={16} className="mt-1 flex-shrink-0" />
                <div>
                  <div><a href="tel:+919022016169" className="hover:text-primary transition">+91 9022016169</a></div>
                  <div><a href="tel:+917796759625" className="hover:text-primary transition">+91 7796759625</a></div>
                </div>
              </div>
              <div className="text-foreground/60 text-xs leading-relaxed">
                In front of Lokmat Building, Near Sneh nagar bus stop, Navrang 27, Chatrapati Square, Nagpur, Maharashtra, India
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-border pt-8 text-center text-sm text-foreground/60">
          <p>&copy; 2025 BeatsVibe Technologies. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

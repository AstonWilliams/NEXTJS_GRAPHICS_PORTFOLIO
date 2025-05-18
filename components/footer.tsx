"use client"

import Link from "next/link"
import { Instagram, Twitter, Dribbble, Linkedin, Mail, ArrowUp } from "lucide-react"

export default function Footer() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <footer className="bg-zinc-900 pt-20 pb-10">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-16">
          <div>
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-orange-500 rounded-sm flex items-center justify-center">
                <span className="text-white font-bold">D</span>
              </div>
              <span className="text-xl font-bold text-white">DesignSpace</span>
            </div>
            <p className="text-zinc-400 mb-6">
              Innovative graphic design solutions for brands and businesses looking to make an impact.
            </p>
            <div className="flex gap-4">
              <Link
                href="https://instagram.com"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-orange-500 transition-colors"
              >
                <Instagram size={18} />
              </Link>
              <Link
                href="https://twitter.com"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-orange-500 transition-colors"
              >
                <Twitter size={18} />
              </Link>
              <Link
                href="https://dribbble.com"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-orange-500 transition-colors"
              >
                <Dribbble size={18} />
              </Link>
              <Link
                href="https://linkedin.com"
                className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-white hover:bg-orange-500 transition-colors"
              >
                <Linkedin size={18} />
              </Link>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Navigation</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-zinc-400 hover:text-white transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-zinc-400 hover:text-white transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/typography" className="text-zinc-400 hover:text-white transition-colors">
                  Typography
                </Link>
              </li>
              <li>
                <Link href="/print" className="text-zinc-400 hover:text-white transition-colors">
                  Print
                </Link>
              </li>
              <li>
                <Link href="/digital" className="text-zinc-400 hover:text-white transition-colors">
                  Digital Design
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-zinc-400 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Services</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/services/branding" className="text-zinc-400 hover:text-white transition-colors">
                  Branding
                </Link>
              </li>
              <li>
                <Link href="/services/web-design" className="text-zinc-400 hover:text-white transition-colors">
                  Web Design
                </Link>
              </li>
              <li>
                <Link href="/services/print-design" className="text-zinc-400 hover:text-white transition-colors">
                  Print Design
                </Link>
              </li>
              <li>
                <Link href="/services/packaging" className="text-zinc-400 hover:text-white transition-colors">
                  Packaging
                </Link>
              </li>
              <li>
                <Link href="/services/illustration" className="text-zinc-400 hover:text-white transition-colors">
                  Illustration
                </Link>
              </li>
              <li>
                <Link href="/services/motion-graphics" className="text-zinc-400 hover:text-white transition-colors">
                  Motion Graphics
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6">Contact</h3>
            <p className="flex items-center gap-2 text-zinc-400 mb-4">
              <Mail size={18} className="text-orange-500" />
              hello@designspace.com
            </p>
            <p className="text-zinc-400 mb-6">Available for freelance projects on Fiverr and Upwork.</p>
            <Link
              href="/contact"
              className="px-6 py-3 bg-orange-500 hover:bg-orange-600 rounded-full transition-colors inline-block"
            >
              Get in Touch
            </Link>
          </div>
        </div>

        <div className="border-t border-zinc-800 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-zinc-500 text-sm mb-4 md:mb-0">
            © {new Date().getFullYear()} DesignSpace. All rights reserved.
          </p>
          <button
            onClick={scrollToTop}
            className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors"
          >
            Back to top <ArrowUp size={16} />
          </button>
        </div>
      </div>
    </footer>
  )
}

"use client"

import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { motion } from "framer-motion"

// Define a type for star properties
interface Star {
  top: string
  left: string
  opacity: number
  width: string
  height: string
}

export default function Hero() {
  const parallaxRef = useRef<HTMLDivElement>(null)
  const [stars, setStars] = useState<Star[]>([])

  // Generate stars on client-side only to avoid hydration mismatch
  useEffect(() => {
    const generatedStars = Array.from({ length: 20 }, () => ({
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      opacity: Math.random() * 0.7 + 0.3,
      width: `${Math.random() * 3 + 1}px`,
      height: `${Math.random() * 3 + 1}px`,
    }))

    setStars(generatedStars)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!parallaxRef.current) return

      const starElements = parallaxRef.current.querySelectorAll(".star")
      const x = e.clientX / window.innerWidth
      const y = e.clientY / window.innerHeight

      starElements.forEach((star, index) => {
        const speed = 1 + index * 0.1
        const htmlStar = star as HTMLElement
        htmlStar.style.transform = `translate(${x * speed * 50}px, ${y * speed * 50}px)`
      })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <section className="relative h-screen flex items-center justify-center overflow-hidden">
      <div ref={parallaxRef} className="absolute inset-0 z-0">
        {stars.map((star, i) => (
          <div
            key={i}
            className="star absolute w-1 h-1 bg-white rounded-full opacity-70"
            style={{
              top: star.top,
              left: star.left,
              opacity: star.opacity,
              width: star.width,
              height: star.height,
            }}
          />
        ))}
      </div>

      <div className="container mx-auto px-4 text-center z-10">
        <motion.h1
          className="text-5xl md:text-7xl font-bold mb-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <span className="text-zinc-400">Welcome to </span>
          <span className="text-white">DesignSpace</span>
        </motion.h1>

        <motion.h2
          className="text-2xl md:text-4xl font-medium mb-8 text-zinc-300"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Your Creative Design Portfolio
        </motion.h2>

        <motion.p
          className="text-lg md:text-xl text-zinc-400 max-w-3xl mx-auto mb-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          Showcasing innovative design solutions across typography, print, and digital media. Explore a collection of
          creative works where imagination meets precision.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <Link
            href="/projects"
            className="px-8 py-3 bg-orange-500 hover:bg-orange-600 rounded-full transition-colors text-white font-medium"
          >
            Explore Projects
          </Link>
          <Link
            href="/about"
            className="px-8 py-3 bg-transparent border border-white/30 hover:bg-white/10 rounded-full transition-colors text-white font-medium"
          >
            About Me
          </Link>
        </motion.div>
      </div>

      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent z-10"></div>
    </section>
  )
}

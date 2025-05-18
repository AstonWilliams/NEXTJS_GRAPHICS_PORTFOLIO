"use client"

import { useEffect, useRef, useState } from "react"

interface Star {
  x: number
  y: number
  size: number
  opacity: number
  speed: number
  color: string
}

export default function StarfieldBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const starsRef = useRef<Star[]>([])
  const animationFrameRef = useRef<number>(0)
  const [isClient, setIsClient] = useState(false)

  useEffect(() => {
    setIsClient(true)
  }, [])

  useEffect(() => {
    if (!isClient) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas to full screen
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    // Initialize stars
    const initStars = () => {
      starsRef.current = []
      const starCount = Math.floor((window.innerWidth * window.innerHeight) / 1000)

      // Star colors with slight variations
      const starColors = [
        "rgba(255, 255, 255, 1)",
        "rgba(240, 240, 255, 1)",
        "rgba(255, 240, 240, 1)",
        "rgba(240, 255, 240, 1)",
        "rgba(200, 200, 255, 1)",
      ]

      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * canvas.width,
          y: Math.random() * canvas.height,
          size: Math.random() * 2 + 0.1,
          opacity: Math.random() * 0.8 + 0.2,
          speed: Math.random() * 0.05 + 0.01,
          color: starColors[Math.floor(Math.random() * starColors.length)],
        })
      }
    }

    // Create occasional shooting stars
    const createShootingStar = () => {
      if (Math.random() > 0.995) {
        const startX = Math.random() * canvas.width
        const startY = (Math.random() * canvas.height) / 3
        const length = Math.random() * 80 + 50
        const angle = Math.PI / 4 + (Math.random() * Math.PI) / 4
        const speed = Math.random() * 15 + 10

        const shootingStar = {
          x: startX,
          y: startY,
          length,
          angle,
          speed,
          opacity: 1,
          active: true,
        }

        const animateShootingStar = () => {
          if (!shootingStar.active) return

          ctx.save()
          ctx.beginPath()
          ctx.moveTo(shootingStar.x, shootingStar.y)

          const endX = shootingStar.x + Math.cos(shootingStar.angle) * shootingStar.length
          const endY = shootingStar.y + Math.sin(shootingStar.angle) * shootingStar.length

          ctx.lineTo(endX, endY)

          const gradient = ctx.createLinearGradient(shootingStar.x, shootingStar.y, endX, endY)
          gradient.addColorStop(0, `rgba(255, 255, 255, ${shootingStar.opacity})`)
          gradient.addColorStop(1, "rgba(255, 255, 255, 0)")

          ctx.strokeStyle = gradient
          ctx.lineWidth = 2
          ctx.stroke()
          ctx.restore()

          // Move shooting star
          shootingStar.x += Math.cos(shootingStar.angle) * shootingStar.speed
          shootingStar.y += Math.sin(shootingStar.angle) * shootingStar.speed

          // Fade out
          shootingStar.opacity -= 0.02

          if (shootingStar.x > canvas.width || shootingStar.y > canvas.height || shootingStar.opacity <= 0) {
            shootingStar.active = false
          }
        }

        const shootingStarInterval = setInterval(() => {
          if (!shootingStar.active) {
            clearInterval(shootingStarInterval)
          } else {
            animateShootingStar()
          }
        }, 20)
      }
    }

    // Create nebula effect
    const drawNebula = () => {
      const nebulaCount = 3

      for (let i = 0; i < nebulaCount; i++) {
        const x = Math.random() * canvas.width
        const y = Math.random() * canvas.height
        const radius = Math.random() * 150 + 50

        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius)

        // Random color for nebula
        const hue = Math.random() * 60 + 220 // Blue to purple range
        const saturation = Math.random() * 30 + 70
        const lightness = Math.random() * 20 + 10

        gradient.addColorStop(0, `hsla(${hue}, ${saturation}%, ${lightness}%, 0.03)`)
        gradient.addColorStop(1, `hsla(${hue}, ${saturation}%, ${lightness}%, 0)`)

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(x, y, radius, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    const animate = () => {
      if (!ctx || !canvas) return

      // Clear with slight fade effect for trails
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw stars
      starsRef.current.forEach((star) => {
        ctx.beginPath()
        ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2)

        // Create a glow effect
        const gradient = ctx.createRadialGradient(star.x, star.y, 0, star.x, star.y, star.size * 2)
        gradient.addColorStop(0, star.color)
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.fillStyle = gradient
        ctx.fill()

        // Twinkle effect
        star.opacity = Math.max(0.2, Math.min(1, star.opacity + (Math.random() - 0.5) * 0.05))

        // Move star
        star.y += star.speed

        // Reset star if it goes off screen
        if (star.y > canvas.height) {
          star.y = 0
          star.x = Math.random() * canvas.width
        }
      })

      // Occasionally add shooting stars
      createShootingStar()

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    // Add nebula on init
    const initBackground = () => {
      ctx.fillStyle = "black"
      ctx.fillRect(0, 0, canvas.width, canvas.height)
      drawNebula()
    }

    window.addEventListener("resize", () => {
      resizeCanvas()
      initStars()
      initBackground()
    })

    resizeCanvas()
    initStars()
    initBackground()
    animate()

    return () => {
      window.removeEventListener("resize", resizeCanvas)
      cancelAnimationFrame(animationFrameRef.current)
    }
  }, [isClient])

  if (!isClient) {
    return null // Return nothing during SSR
  }

  return <canvas ref={canvasRef} className="fixed top-0 left-0 w-full h-full -z-10" style={{ pointerEvents: "none" }} />
}

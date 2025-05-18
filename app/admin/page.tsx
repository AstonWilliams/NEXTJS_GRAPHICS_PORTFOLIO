"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Lock, AlertTriangle } from "lucide-react"
import { getDeviceId } from "@/lib/auth-utils"

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({
    username: "",
    password: "",
  })
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [loginAttempts, setLoginAttempts] = useState(0)
  const [isLocked, setIsLocked] = useState(false)
  const [lockTimer, setLockTimer] = useState(0)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      // No token, no need to verify
      setIsCheckingAuth(false)
      return
    }

    // Get device ID
    const deviceId = getDeviceId()

    // Verify token validity only once
    const verifyToken = async () => {
      try {
        const apiUrl =
          process.env.NEXT_PUBLIC_DJANGO_API_URL || process.env.DJANGO_API_URL || "http://localhost:8000/api"
        const response = await fetch(`${apiUrl}/token/verify/`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token, deviceId }),
          cache: "no-store",
        })

        if (response.ok) {
          router.push("/admin/dashboard")
        } else {
          // Token is invalid, try to refresh
          const refreshToken = localStorage.getItem("refreshToken")
          if (refreshToken) {
            try {
              const refreshResponse = await fetch(`${apiUrl}/token/refresh/`, {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ refresh: refreshToken }),
                cache: "no-store",
              })

              if (refreshResponse.ok) {
                const data = await refreshResponse.json()
                localStorage.setItem("authToken", data.access)
                router.push("/admin/dashboard")
                return
              }
            } catch (error) {
              console.error("Error refreshing token:", error)
            }
          }

          // If we get here, both token verification and refresh failed
          localStorage.removeItem("authToken")
          localStorage.removeItem("refreshToken")
          localStorage.removeItem("user")
        }
      } catch (error) {
        console.error("Error verifying token:", error)
      } finally {
        setIsCheckingAuth(false)
      }
    }

    verifyToken()
  }, [router])

  // Handle login timeout countdown
  useEffect(() => {
    let interval: NodeJS.Timeout

    if (isLocked && lockTimer > 0) {
      interval = setInterval(() => {
        setLockTimer((prev) => prev - 1)
      }, 1000)
    } else if (lockTimer === 0 && isLocked) {
      setIsLocked(false)
    }

    return () => clearInterval(interval)
  }, [isLocked, lockTimer])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Check if account is locked
    if (isLocked) {
      setError(`Too many failed attempts. Please try again in ${lockTimer} seconds.`)
      return
    }

    setIsLoading(true)
    setError("")

    try {
      console.log("Submitting login form:", { username: formData.username, password: "***" })

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      const data = await response.json()
      console.log("Login response:", data)

      if (!data.success) {
        // Increment login attempts
        const newAttempts = loginAttempts + 1
        setLoginAttempts(newAttempts)

        // Lock account after 5 failed attempts
        if (newAttempts >= 5) {
          setIsLocked(true)
          setLockTimer(60) // Lock for 60 seconds
          throw new Error("Too many failed attempts. Account locked for 60 seconds.")
        }

        throw new Error(data.message || "Authentication failed")
      }

      // Reset login attempts on successful login
      setLoginAttempts(0)

      // Store token in localStorage or cookies
      localStorage.setItem("authToken", data.access)
      localStorage.setItem("refreshToken", data.refresh)
      localStorage.setItem("user", JSON.stringify(data.user))

      router.push("/admin/dashboard")
    } catch (error) {
      console.error("Login error:", error)
      setError(error instanceof Error ? error.message : "Invalid credentials. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (isCheckingAuth) {
    return (
      <main className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-orange-500"></div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-black text-white flex items-center justify-center relative">
      <div className="absolute inset-0 z-0">
        <div id="stars-container" className="absolute inset-0 overflow-hidden"></div>
      </div>

      <div className="w-full max-w-md p-8 relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-zinc-900/60 backdrop-blur-md rounded-2xl p-8 shadow-xl border border-zinc-800/50"
        >
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center">
              <Lock className="w-8 h-8 text-orange-500" />
            </div>
          </div>

          <h1 className="text-2xl font-bold text-center mb-6">Admin Access</h1>

          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="bg-red-500/10 border border-red-500/20 text-red-500 px-4 py-3 rounded-lg text-sm flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{error}</span>
              </div>
            )}

            {isLocked && (
              <div className="bg-orange-500/10 border border-orange-500/20 text-orange-500 px-4 py-3 rounded-lg text-sm">
                Account temporarily locked. Please wait {lockTimer} seconds before trying again.
              </div>
            )}

            <div>
              <label htmlFor="username" className="block text-sm font-medium mb-2">
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                disabled={isLocked || isLoading}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
                placeholder="Enter admin username"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Password
              </label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                disabled={isLocked || isLoading}
                className="w-full px-4 py-3 bg-zinc-800/80 border border-zinc-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 disabled:opacity-60"
                placeholder="Enter admin password"
              />
            </div>

            <div className="text-sm text-zinc-400">
              <p>Default credentials:</p>
              <p>Username: admin</p>
              <p>Password: admin123</p>
            </div>

            <button
              type="submit"
              disabled={isLoading || isLocked}
              className={`w-full px-4 py-3 bg-orange-500 hover:bg-orange-600 rounded-lg transition-colors flex items-center justify-center disabled:opacity-60 disabled:hover:bg-orange-500`}
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-white"></div>
              ) : (
                "Login"
              )}
            </button>
          </form>

          <p className="text-zinc-500 text-sm text-center mt-6">This area is restricted to administrators only.</p>
        </motion.div>
      </div>
    </main>
  )
}

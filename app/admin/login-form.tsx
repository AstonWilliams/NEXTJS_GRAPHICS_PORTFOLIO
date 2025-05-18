"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

export default function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      console.log("Submitting login form:", { username, password: "***" })

      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, password }),
      })

      // Handle non-JSON responses
      const text = await response.text()
      let data

      try {
        data = JSON.parse(text)
      } catch (e) {
        console.error("Failed to parse response as JSON:", text)
        setError("Server returned an invalid response. Please try again later.")
        setIsLoading(false)
        return
      }

      console.log("Login response:", data)

      if (data.success) {
        // Store auth data in localStorage
        localStorage.setItem("authToken", data.access)
        localStorage.setItem("refreshToken", data.refresh)
        localStorage.setItem("user", JSON.stringify(data.user))

        // Redirect to dashboard
        router.push("/admin/dashboard")
      } else {
        setError(data.message || "Invalid credentials")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("An error occurred during login. Please try again.")
    }

    setIsLoading(false)
  }

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>

      {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label htmlFor="username" className="block text-sm font-medium mb-1">
            Username
          </label>
          <input
            id="username"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <div className="mb-6">
          <label htmlFor="password" className="block text-sm font-medium mb-1">
            Password
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-2 border rounded focus:ring focus:ring-blue-300"
            required
          />
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="mt-4 text-sm text-center text-gray-600 dark:text-gray-400">
        <p>Default credentials:</p>
        <p>Username: admin</p>
        <p>Password: admin123</p>
      </div>
    </div>
  )
}

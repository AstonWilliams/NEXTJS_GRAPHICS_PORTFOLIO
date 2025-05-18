"use client"
import LoginForm from "./login-form"
import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getDeviceId } from "@/lib/auth-utils"

export default function AdminPage() {
  const router = useRouter()

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      // No token, no need to verify
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
      }
    }

    verifyToken()
  }, [router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">Admin Access</h1>
        </div>

        <LoginForm />
      </div>
    </div>
  )
}

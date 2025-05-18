import { v4 as uuidv4 } from "uuid"

// Add a timestamp to track when tokens were last verified
export interface TokenVerificationState {
  lastVerified: number
  isVerifying: boolean
}

const lastTokenVerification: Record<string, TokenVerificationState> = {}

// Modified to not use next/headers
export async function getAuthToken(): Promise<string | null> {
  // First try to get token from localStorage
  if (typeof window !== "undefined") {
    return localStorage.getItem("authToken")
  }

  return null
}

export async function refreshToken(refreshToken: string): Promise<string | null> {
  try {
    // Use the actual network address when accessing from other devices
    const apiUrl =
      typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? `http://${window.location.hostname}:8000/api`
        : process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://127.0.0.1:8000/api"

    console.log("Refreshing token with API URL:", apiUrl)

    const response = await fetch(`${apiUrl}/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "no-cache", // Don't cache refresh token requests
      },
      body: JSON.stringify({ refresh: refreshToken }),
      cache: "no-store",
    })

    if (!response.ok) {
      return null
    }

    const data = await response.json()
    return data.access
  } catch (error) {
    console.error("Error refreshing token:", error)
    return null
  }
}

// Add a utility function to check if a token is valid
export async function isTokenValid(token: string): Promise<boolean> {
  // Check if we've verified this token recently (within 5 minutes)
  const now = Date.now()
  const tokenState = lastTokenVerification[token] || { lastVerified: 0, isVerifying: false }

  // If we've verified this token recently, consider it valid
  if (now - tokenState.lastVerified < 5 * 60 * 1000) {
    return true
  }

  // If we're already verifying this token, don't start another verification
  if (tokenState.isVerifying) {
    return true
  }

  try {
    // Mark this token as being verified
    lastTokenVerification[token] = { ...tokenState, isVerifying: true }

    // Use the actual network address when accessing from other devices
    const apiUrl =
      typeof window !== "undefined" && window.location.hostname !== "localhost"
        ? `http://${window.location.hostname}:8000/api`
        : process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://127.0.0.1:8000/api"

    console.log("Verifying token with API URL:", apiUrl)

    const response = await fetch(`${apiUrl}/token/verify/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Cache-Control": "max-age=300", // Cache for 5 minutes
      },
      body: JSON.stringify({ token }),
      cache: "no-store",
    })

    const isValid = response.ok
    if (isValid) {
      // Update the last verification time
      lastTokenVerification[token] = { lastVerified: now, isVerifying: false }
    } else {
      lastTokenVerification[token] = { lastVerified: tokenState.lastVerified, isVerifying: false }
    }

    return isValid
  } catch (error) {
    console.error("Error verifying token:", error)
    lastTokenVerification[token] = { lastVerified: tokenState.lastVerified, isVerifying: false }
    return false
  }
}

// Add a utility function to handle token refresh
export async function getValidToken(token: string, refreshToken: string): Promise<string | null> {
  // First check if the current token is valid
  const isValid = await isTokenValid(token)

  if (isValid) {
    return token
  }

  // If not valid, try to refresh
  const newToken = await refreshToken(refreshToken)

  // Update verification timestamp for the new token
  if (newToken) {
    lastTokenVerification[newToken] = { lastVerified: Date.now(), isVerifying: false }
  }

  return newToken
}

// Clean up old tokens periodically to prevent memory leaks
if (typeof window !== "undefined") {
  setInterval(
    () => {
      const now = Date.now()
      const expirationTime = 60 * 60 * 1000 // 1 hour

      Object.keys(lastTokenVerification).forEach((token) => {
        if (now - lastTokenVerification[token].lastVerified > expirationTime) {
          delete lastTokenVerification[token]
        }
      })
    },
    30 * 60 * 1000,
  ) // Run cleanup every 30 minutes
}

// Generate a unique device ID for the current browser
export function getDeviceId(): string {
  if (typeof window === "undefined") {
    return "server-side"
  }

  // Check if device ID already exists in localStorage
  let deviceId = localStorage.getItem("deviceId")

  // If not, generate a new one and store it
  if (!deviceId) {
    deviceId = uuidv4()
    localStorage.setItem("deviceId", deviceId)
  }

  return deviceId
}

// Get the refresh token from localStorage
export function getRefreshToken(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  return localStorage.getItem("refreshToken")
}

// Set the authentication token in localStorage
export function setAuthToken(token: string): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem("authToken", token)
}

// Set the refresh token in localStorage
export function setRefreshToken(token: string): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem("refreshToken", token)
}

// Clear all authentication data from localStorage
export function clearAuthData(): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem("authToken")
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("user")
}

// Check if the user is authenticated
export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  return !!localStorage.getItem("authToken")
}

// Get the user data from localStorage
export function getUser(): any {
  if (typeof window === "undefined") {
    return null
  }

  const userJson = localStorage.getItem("user")
  if (!userJson) {
    return null
  }

  try {
    return JSON.parse(userJson)
  } catch (error) {
    console.error("Error parsing user data:", error)
    return null
  }
}

// Set the user data in localStorage
export function setUser(user: any): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem("user", JSON.stringify(user))
}

import { v4 as uuidv4 } from "uuid"

// Client-side only implementation
export function getDeviceId(): string {
  if (typeof window === "undefined") {
    return "server-side"
  }

  let deviceId = localStorage.getItem("deviceId")
  if (!deviceId) {
    deviceId = uuidv4()
    localStorage.setItem("deviceId", deviceId)
  }

  return deviceId
}

export function getAuthToken(): string | null {
  if (typeof window === "undefined") {
    return null
  }

  return localStorage.getItem("authToken")
}

export function getTokenFromRequest(request: Request): string | null {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

export function setAuthToken(token: string): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.setItem("authToken", token)
}

export function clearAuthToken(): void {
  if (typeof window === "undefined") {
    return
  }

  localStorage.removeItem("authToken")
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false
  }

  return !!localStorage.getItem("authToken")
}

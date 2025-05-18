export function getDeviceId(): string {
  if (typeof window === "undefined") {
    return "server"
  }
  let deviceId = localStorage.getItem("deviceId")
  if (!deviceId) {
    deviceId = generateId()
    localStorage.setItem("deviceId", deviceId)
  }
  return deviceId
}

function generateId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function getTokenFromRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return null
}

// Export both function names for backward compatibility
export async function getAuthToken(request: Request): Promise<string | null> {
  return getTokenFromRequest(request)
}

// Add other auth utility functions
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
  localStorage.removeItem("refreshToken")
  localStorage.removeItem("user")
}

export function isAuthenticated(): boolean {
  if (typeof window === "undefined") {
    return false
  }
  return !!localStorage.getItem("authToken")
}

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

export function setUser(user: any): void {
  if (typeof window === "undefined") {
    return
  }
  localStorage.setItem("user", JSON.stringify(user))
}

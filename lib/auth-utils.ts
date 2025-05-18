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

export async function getAuthToken(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization")
  if (authHeader && authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7)
  }
  return null
}

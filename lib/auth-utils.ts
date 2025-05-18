import { cookies } from "next/headers"
import { v4 as uuidv4 } from "uuid"

export async function getDeviceId(): Promise<string> {
  const cookieStore = cookies()
  let deviceId = cookieStore.get("deviceId")?.value

  if (!deviceId) {
    deviceId = uuidv4()
    cookieStore.set("deviceId", deviceId)
  }

  return deviceId
}

export async function getTokenFromRequest(request: Request): Promise<string | null> {
  const authHeader = request.headers.get("Authorization")
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null
  }
  return authHeader.substring(7) // Remove 'Bearer ' prefix
}

import { NextResponse } from "next/server"
import { getAuthToken } from "@/lib/auth-utils"

export async function GET(request: Request) {
  try {
    const token = await getAuthToken(request)
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const searchParams = new URL(request.url).searchParams
    const isRead = searchParams.get("is_read")

    // Build query parameters
    const queryParams = new URLSearchParams()
    if (isRead !== null) {
      queryParams.append("is_read", isRead === "true" ? "true" : "false")
    }

    // Make the API call to Django backend
    const response = await fetch(`${process.env.DJANGO_API_URL}/messages/?${queryParams.toString()}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data.results || data)
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

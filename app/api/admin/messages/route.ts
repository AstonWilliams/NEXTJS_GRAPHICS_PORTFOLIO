import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    // Get the authorization token from the request headers
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Use relative URL for Vercel deployment
    const url = "/api/messages/"

    console.log("Fetching messages from:", url)

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store", // Disable caching
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      throw new Error(`Failed to fetch messages: ${response.status}`)
    }

    // Check if response is empty
    const text = await response.text()
    if (!text) {
      console.log("Empty response received from API")
      return NextResponse.json([]) // Return empty array
    }

    try {
      const data = JSON.parse(text)
      return NextResponse.json(data)
    } catch (e) {
      console.error("Error parsing JSON:", e)
      return NextResponse.json([]) // Return empty array on parse error
    }
  } catch (error) {
    console.error("Error fetching messages:", error)
    return NextResponse.json({ error: "Failed to fetch messages" }, { status: 500 })
  }
}

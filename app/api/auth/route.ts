import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    console.log("Attempting authentication with:", { username, password: "***" })

    // Use the actual server hostname when not on localhost
    const requestUrl = new URL(request.url)
    const hostname = requestUrl.hostname

    // Use the actual server hostname when not on localhost
    const apiUrl =
      hostname !== "localhost" && hostname !== "127.0.0.1"
        ? `https://${hostname}/api`
        : process.env.DJANGO_API_URL || "http://127.0.0.1:8000/api"

    console.log("Using API URL:", apiUrl)

    const response = await fetch(`${apiUrl}/token/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    })

    console.log("Auth response status:", response.status)

    // Check if the response is empty
    const text = await response.text()
    if (!text) {
      return NextResponse.json({ success: false, message: "Empty response from server" }, { status: 500 })
    }

    // Parse the response text as JSON
    const data = JSON.parse(text)

    // Don't log sensitive token information
    console.log("Auth response received with keys:", Object.keys(data))

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.detail || "Invalid credentials" },
        { status: response.status },
      )
    }

    // Return the token data in the format expected by the frontend
    return NextResponse.json({
      success: true,
      access: data.access,
      refresh: data.refresh,
      user: {
        id: data.user_id || 1, // Fallback to 1 if user_id is not provided
        username: username,
        role: "administrator",
      },
    })
  } catch (error) {
    console.error("Error during authentication:", error)
    return NextResponse.json(
      {
        error: "Authentication failed",
        success: false,
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

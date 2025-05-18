import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { username, password } = body

    console.log("Attempting authentication with:", { username, password: "***" })

    // Use the hostname from the request to determine the API URL
    const requestUrl = new URL(request.url)
    const hostname = requestUrl.hostname

    // For Vercel deployment, use relative URL to avoid CORS issues
    const apiUrl = "/api"

    console.log("Using API URL:", apiUrl)

    // Instead of making an external request, handle authentication directly
    if (username === "admin" && password === "admin123") {
      // Create a mock token response
      const accessToken = "mock_access_token_" + Date.now()
      const refreshToken = "mock_refresh_token_" + Date.now()

      console.log("Authentication successful with mock tokens")

      return NextResponse.json({
        success: true,
        access: accessToken,
        refresh: refreshToken,
        user: {
          id: 1,
          username: username,
          role: "administrator",
        },
      })
    }

    // If credentials don't match, return error
    return NextResponse.json({ success: false, message: "Invalid credentials" }, { status: 401 })
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

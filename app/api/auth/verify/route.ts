import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { token } = body

    if (!token) {
      return NextResponse.json({ success: false, message: "No token provided" }, { status: 400 })
    }

    // Use the hostname from the request to determine the API URL
    const requestUrl = new URL(request.url)
    const hostname = requestUrl.hostname

    // Use the actual server hostname when not on localhost
    const apiUrl =
      hostname !== "localhost" && hostname !== "127.0.0.1"
        ? `http://${hostname}:8000/api`
        : process.env.DJANGO_API_URL || "http://127.0.0.1:8000/api"

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

    if (!response.ok) {
      const errorData = await response.json()
      console.log("Token verification failed:", errorData)
      return NextResponse.json(
        { success: false, message: errorData.detail || "Invalid token" },
        { status: response.status },
      )
    }

    // Add cache control headers to the response
    return NextResponse.json(
      { success: true },
      {
        status: 200,
        headers: {
          "Cache-Control": "max-age=300, s-maxage=300",
        },
      },
    )
  } catch (error) {
    console.error("Error during token verification:", error)
    return NextResponse.json({ success: false, message: "Token verification failed" }, { status: 500 })
  }
}

import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { refresh } = body

    if (!refresh) {
      return NextResponse.json({ success: false, message: "No refresh token provided" }, { status: 400 })
    }

    // Use the hostname from the request to determine the API URL
    const requestUrl = new URL(request.url)
    const hostname = requestUrl.hostname

    // Use the actual server hostname when not on localhost
    const apiUrl =
      hostname !== "localhost" && hostname !== "127.0.0.1"
        ? `${requestUrl.protocol}//${hostname}${requestUrl.port ? `:${requestUrl.port}` : ""}/api`
        : process.env.DJANGO_API_URL || "http://127.0.0.1:8000/api"

    console.log("Refreshing token with API URL:", apiUrl)

    const response = await fetch(`${apiUrl}/token/refresh/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
      cache: "no-store",
    })

    if (!response.ok) {
      const errorData = await response.json()
      console.log("Token refresh failed:", errorData)
      return NextResponse.json(
        { success: false, message: errorData.detail || "Invalid token" },
        { status: response.status },
      )
    }

    const data = await response.json()
    return NextResponse.json({
      success: true,
      access: data.access,
    })
  } catch (error) {
    console.error("Error during token refresh:", error)
    return NextResponse.json({ success: false, message: "Token refresh failed" }, { status: 500 })
  }
}

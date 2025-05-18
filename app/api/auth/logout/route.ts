import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { refresh } = body

    if (!refresh) {
      return NextResponse.json({ success: false, message: "Refresh token is required" }, { status: 400 })
    }

    // Send logout request to Django backend
    const apiUrl = process.env.DJANGO_API_URL || "http://localhost:8000/api"
    const response = await fetch(`${apiUrl}/logout/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refresh }),
    })

    if (!response.ok) {
      return NextResponse.json({ success: false, message: "Logout failed" }, { status: response.status })
    }

    return NextResponse.json({ success: true, message: "Logged out successfully" })
  } catch (error) {
    console.error("Error during logout:", error)
    return NextResponse.json({ success: false, message: "Logout failed" }, { status: 500 })
  }
}

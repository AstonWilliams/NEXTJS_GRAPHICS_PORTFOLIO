import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Send logout-all request to Django backend
    const apiUrl = process.env.DJANGO_API_URL || "http://localhost:8000/api"
    const response = await fetch(`${apiUrl}/logout-all/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: "Logout from all devices failed" },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, message: "Logged out from all devices successfully" })
  } catch (error) {
    console.error("Error during logout from all devices:", error)
    return NextResponse.json({ success: false, message: "Logout from all devices failed" }, { status: 500 })
  }
}

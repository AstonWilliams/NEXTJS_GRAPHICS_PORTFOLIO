import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { current_password, new_password } = body
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    if (!current_password || !new_password) {
      return NextResponse.json(
        { success: false, message: "Current password and new password are required" },
        { status: 400 },
      )
    }

    // Send change password request to Django backend
    const apiUrl = process.env.DJANGO_API_URL || "http://localhost:8000/api"
    const response = await fetch(`${apiUrl}/change-password/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ current_password, new_password }),
    })

    const data = await response.json()

    if (!response.ok) {
      return NextResponse.json(
        { success: false, message: data.detail || "Password change failed" },
        { status: response.status },
      )
    }

    return NextResponse.json({ success: true, message: "Password changed successfully" })
  } catch (error) {
    console.error("Error during password change:", error)
    return NextResponse.json({ success: false, message: "Password change failed" }, { status: 500 })
  }
}

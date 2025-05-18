import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    // Get sessions from Django backend
    const apiUrl = process.env.DJANGO_API_URL || "http://localhost:8000/api"
    const response = await fetch(`${apiUrl}/sessions/`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      return NextResponse.json({ success: false, message: "Failed to fetch sessions" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching sessions:", error)
    return NextResponse.json({ success: false, message: "Failed to fetch sessions" }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const body = await request.json()
    const { token_id } = body
    const token = request.headers.get("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ success: false, message: "Authentication required" }, { status: 401 })
    }

    if (!token_id) {
      return NextResponse.json({ success: false, message: "Token ID is required" }, { status: 400 })
    }

    // Delete session in Django backend
    const apiUrl = process.env.DJANGO_API_URL || "http://localhost:8000/api"
    const response = await fetch(`${apiUrl}/sessions/`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ token_id }),
    })

    if (!response.ok) {
      return NextResponse.json({ success: false, message: "Failed to revoke session" }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error revoking session:", error)
    return NextResponse.json({ success: false, message: "Failed to revoke session" }, { status: 500 })
  }
}

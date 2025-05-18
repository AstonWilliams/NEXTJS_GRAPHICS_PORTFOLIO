import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get the authorization token from the request headers
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Use the hostname from the request to determine the API URL
    const requestUrl = new URL(request.url)
    const hostname = requestUrl.hostname

    // Use the actual server hostname when not on localhost
    const apiUrl =
      hostname !== "localhost" && hostname !== "127.0.0.1"
        ? `http://${hostname}:8000/api`
        : process.env.DJANGO_API_URL || "http://127.0.0.1:8000/api"

    const url = `${apiUrl}/projects/${id}/`
    console.log("Fetching project details from:", url)

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
      throw new Error(`Failed to fetch project: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get the authorization token from the request headers
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Use the hostname from the request to determine the API URL
    const requestUrl = new URL(request.url)
    const hostname = requestUrl.hostname

    // Use the actual server hostname when not on localhost
    const apiUrl =
      hostname !== "localhost" && hostname !== "127.0.0.1"
        ? `http://${hostname}:8000/api`
        : process.env.DJANGO_API_URL || "http://127.0.0.1:8000/api"

    const url = `${apiUrl}/projects/${id}/`

    // Get the form data from the request
    const formData = await request.formData()
    console.log("Updating project with form data:", Object.fromEntries(formData.entries()))

    // Forward the request to the Django backend
    const response = await fetch(url, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to update project: ${response.status}`, errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error updating project:", error)
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

    // Get the authorization token from the request headers
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Use the hostname from the request to determine the API URL
    const requestUrl = new URL(request.url)
    const hostname = requestUrl.hostname

    // Use the actual server hostname when not on localhost
    const apiUrl =
      hostname !== "localhost" && hostname !== "127.0.0.1"
        ? `http://${hostname}:8000/api`
        : process.env.DJANGO_API_URL || "http://127.0.0.1:8000/api"

    const url = `${apiUrl}/projects/${id}/`
    console.log("Deleting project from:", url)

    const response = await fetch(url, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      if (response.status === 401) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }
      throw new Error(`Failed to delete project: ${response.status}`)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting project:", error)
    return NextResponse.json({ error: "Failed to delete project" }, { status: 500 })
  }
}

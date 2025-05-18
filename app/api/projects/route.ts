import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")
    const limit = searchParams.get("limit")

    // Build the API URL
    const apiUrl = process.env.DJANGO_API_URL || "http://127.0.0.1:8000/api"
    let url = `${apiUrl}/projects/`

    // Add query parameters if provided
    const queryParams = new URLSearchParams()
    if (category && category !== "All") {
      queryParams.append("category", category)
    }
    if (featured !== null) {
      queryParams.append("featured", featured)
    }
    if (limit !== null) {
      queryParams.append("limit", limit)
    }

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`
    }

    console.log("Fetching projects from:", url)

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store", // Disable caching
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch projects: ${response.status}`)
    }

    const data = await response.json()
    console.log("Fetched projects:", data)
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 })
  }
}

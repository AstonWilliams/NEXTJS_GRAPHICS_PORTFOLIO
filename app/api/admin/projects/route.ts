import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get("category")
    const featured = searchParams.get("featured")

    // Get the authorization token from the request headers
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Build the API URL - use relative URL for Vercel deployment
    const apiUrl = "/api"
    let url = `${apiUrl}/projects/`

    // Add query parameters if provided
    const queryParams = new URLSearchParams()
    if (category && category !== "All") {
      queryParams.append("category", category)
    }
    if (featured !== null) {
      queryParams.append("featured", featured)
    }

    if (queryParams.toString()) {
      url += `?${queryParams.toString()}`
    }

    console.log("Fetching admin projects from:", url)

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
      throw new Error(`Failed to fetch projects: ${response.status}`)
    }

    // Check if response is empty
    const text = await response.text()
    if (!text) {
      console.log("Empty response received from API")
      return NextResponse.json({ results: [] }) // Return empty results array
    }

    try {
      const data = JSON.parse(text)
      return NextResponse.json(data)
    } catch (e) {
      console.error("Error parsing JSON:", e)
      return NextResponse.json({ results: [] }) // Return empty results on parse error
    }
  } catch (error) {
    console.error("Error fetching projects:", error)
    return NextResponse.json({ error: "Failed to fetch projects", results: [] }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Get the authorization token from the request headers
    const authHeader = request.headers.get("Authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const token = authHeader.substring(7)

    // Build the API URL - use relative URL for Vercel deployment
    const apiUrl = "/api"
    const url = `${apiUrl}/projects/`

    // Get the form data from the request
    const formData = await request.formData()
    console.log("Creating project with form data:", Object.fromEntries(formData.entries()))

    // Convert featured checkbox value to boolean
    if (formData.has("featured")) {
      const featuredValue = formData.get("featured")
      // Handle various truthy string values
      const isFeatured =
        featuredValue === "true" || featuredValue === "on" || featuredValue === "1" || featuredValue === true

      // Replace with actual boolean value
      formData.set("featured", isFeatured.toString())
      console.log("Featured value converted to:", isFeatured)
    }

    // Forward the request to the Django backend
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      body: formData,
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`Failed to create project: ${response.status}`, errorText)
      return NextResponse.json({ error: errorText }, { status: response.status })
    }

    // Check if response is empty
    const text = await response.text()
    if (!text) {
      console.log("Empty response received from API")
      return NextResponse.json({ success: true }) // Return success with no data
    }

    try {
      const data = JSON.parse(text)
      return NextResponse.json(data)
    } catch (e) {
      console.error("Error parsing JSON:", e)
      return NextResponse.json({ success: true }) // Return success on parse error
    }
  } catch (error) {
    console.error("Error creating project:", error)
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 })
  }
}

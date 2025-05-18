import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const id = params.id

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
      },
      cache: "no-store", // Disable caching
    })

    if (!response.ok) {
      throw new Error(`Failed to fetch project: ${response.status}`)
    }

    const data = await response.json()
    return NextResponse.json(data)
  } catch (error) {
    console.error("Error fetching project:", error)
    return NextResponse.json({ error: "Failed to fetch project" }, { status: 500 })
  }
}

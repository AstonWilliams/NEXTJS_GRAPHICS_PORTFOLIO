// Get the API URL based on environment
export function getApiUrl() {
    // In production (Vercel), use relative path
    if (process.env.NODE_ENV === "production") {
      return "/api"
    }
  
    // In development, use the environment variable or default
    return process.env.NEXT_PUBLIC_DJANGO_API_URL || "http://127.0.0.1:8000/api"
  }
  
  // Helper function to handle API responses
  export async function handleApiResponse(response: Response) {
    if (!response.ok) {
      // Try to get error details from response
      try {
        const errorData = await response.json()
        throw new Error(errorData.detail || `API error: ${response.status}`)
      } catch (e) {
        throw new Error(`API error: ${response.status}`)
      }
    }
  
    return response.json()
  }
  
  // Function to get auth headers
  export function getAuthHeaders() {
    const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null
  
    return {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }
  }
  
  // Function to fetch data with authentication
  export async function fetchWithAuth(url: string, options: RequestInit = {}) {
    const headers = {
      ...getAuthHeaders(),
      ...(options.headers || {}),
    }
  
    const response = await fetch(url, {
      ...options,
      headers,
    })
  
    return handleApiResponse(response)
  }
  
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname

  // Check if the path is for the admin panel
  const isAdminPath = path.startsWith("/admin")

  // Check if the request is for an API route
  const isApiPath = path.startsWith("/api")

  // Get the protocol (http or https)
  const protocol = request.nextUrl.protocol

  // If we're not in production, allow HTTP
  if (process.env.NODE_ENV !== "production") {
    return NextResponse.next()
  }

  // In production, enforce HTTPS
  if (protocol === "http:") {
    // Create a new URL with HTTPS
    const secureUrl = request.nextUrl.clone()
    secureUrl.protocol = "https:"

    // Redirect to the secure URL
    return NextResponse.redirect(secureUrl)
  }

  // Add security headers to all responses
  const response = NextResponse.next()

  // Set security headers
  response.headers.set("X-Content-Type-Options", "nosniff")
  response.headers.set("X-Frame-Options", "DENY")
  response.headers.set("X-XSS-Protection", "1; mode=block")
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin")

  // Add Content-Security-Policy for admin routes
  if (isAdminPath) {
    response.headers.set(
      "Content-Security-Policy",
      "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' https://*.vercel.app https://*.now.sh;",
    )
  }

  return response
}

// Only run the middleware on the following paths
export const config = {
  matcher: [
    // Match all paths except for static files, api routes, and _next
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

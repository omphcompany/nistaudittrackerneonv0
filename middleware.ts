import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// List of public paths that don't require authentication
const PUBLIC_PATHS = ["/login", "/introduction", "/_next", "/favicon.ico", "/api/init-db"]

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Log the current path and cookie for debugging
  console.log(`Middleware checking path: ${pathname}`)
  console.log(
    `Auth cookies: auth=${request.cookies.get("auth")?.value}, nistauth=${request.cookies.get("nistauth")?.value}`,
  )

  // Check if the path is public
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"))

  // Skip auth check for API routes and public paths
  if (pathname.startsWith("/api/") || isPublicPath) {
    console.log(`Middleware: Skipping auth check for ${pathname}`)
    return NextResponse.next()
  }

  // Check if the user is authenticated - check both cookies
  const isAuthenticated =
    request.cookies.get("auth")?.value === "true" || request.cookies.get("nistauth")?.value === "true"

  console.log(`Middleware: Path ${pathname}, Auth: ${isAuthenticated ? "Yes" : "No"}`)

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    console.log(`Middleware: Redirecting to login from ${pathname}`)
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  // Handle root path redirect for authenticated users
  if (pathname === "/") {
    console.log("Middleware: Redirecting from root to introduction")
    const url = request.nextUrl.clone()
    url.pathname = "/introduction"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
}

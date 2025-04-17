import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
  // Skip auth check for API routes and the login page itself
  if (
    request.nextUrl.pathname.startsWith("/api") ||
    request.nextUrl.pathname === "/login" ||
    request.nextUrl.pathname.includes("_next") ||
    request.nextUrl.pathname.includes("favicon.ico")
  ) {
    return NextResponse.next()
  }

  // Check if the user is authenticated
  const isAuthenticated = request.cookies.get("auth")?.value === "true"

  // If not authenticated, redirect to login
  if (!isAuthenticated) {
    const url = request.nextUrl.clone()
    url.pathname = "/login"
    return NextResponse.redirect(url)
  }

  return NextResponse.next()
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (login page)
     */
    "/((?!api|_next/static|_next/image|favicon.ico|login).*)",
  ],
}

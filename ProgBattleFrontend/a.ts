// middleware.ts
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"

export function middleware(request: NextRequest) {
  const token = request.cookies.get("access_token")

  const protectedPaths = ["/dashboard", "/profile", "/submissions", "/teams", "/leaderboard"]
  const path = request.nextUrl.pathname

  if (protectedPaths.includes(path) && !token) {
    return NextResponse.redirect(new URL("/login", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ["/dashboard", "/profile", "/submissions", "/teams", "/leaderboard"],
}
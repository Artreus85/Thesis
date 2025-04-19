import { NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  // Get cookies from the request
  const cookieHeader = request.headers.get("cookie") || ""
  const cookies = Object.fromEntries(
    cookieHeader.split("; ").map((cookie) => {
      const [name, ...rest] = cookie.split("=")
      return [name, rest.join("=")]
    }),
  )

  // Check for Firebase auth cookies
  const firebaseAuthCookies = Object.keys(cookies).filter(
    (name) => name.startsWith("firebase:") || name.includes("firebaseAuth") || name.includes("firebase-auth"),
  )

  return NextResponse.json({
    authCookiesPresent: firebaseAuthCookies.length > 0,
    authCookies: firebaseAuthCookies,
    allCookies: Object.keys(cookies),
    timestamp: new Date().toISOString(),
    userAgent: request.headers.get("user-agent"),
  })
}

import { type NextRequest, NextResponse } from "next/server"
import { getAuthAdmin } from "@/lib/firebase-admin"
import { toggleFavorite } from "@/lib/firebase"

export async function POST(request: NextRequest) {
  try {
    // Get the authorization header
    const authHeader = request.headers.get("authorization")
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Extract the token
    const token = authHeader.split("Bearer ")[1]

    // Verify the token and get the user
    const auth = getAuthAdmin()
    const decodedToken = await auth.verifyIdToken(token)
    const userId = decodedToken.uid

    // Get car ID from request body
    const { carId } = await request.json()

    if (!carId) {
      return NextResponse.json({ error: "Car ID is required" }, { status: 400 })
    }

    // Toggle favorite status
    const isFavorited = await toggleFavorite(userId, carId)

    return NextResponse.json({
      success: true,
      isFavorited,
      message: isFavorited ? "Added to favorites" : "Removed from favorites",
    })
  } catch (error) {
    console.error("Error toggling favorite:", error)
    return NextResponse.json({ error: "Failed to toggle favorite status" }, { status: 500 })
  }
}

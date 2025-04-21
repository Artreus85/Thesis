import { type NextRequest, NextResponse } from "next/server"
import { getAuthAdmin } from "@/lib/firebase-admin"
import { addToFavorites, removeFromFavorites, getUserFavorites, checkIfFavorited } from "@/lib/firebase"

export async function GET(request: NextRequest) {
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

    // Get car ID from query params if present
    const carId = request.nextUrl.searchParams.get("carId")

    if (carId) {
      // Check if specific car is favorited
      const isFavorited = await checkIfFavorited(userId, carId)
      return NextResponse.json({ isFavorited: !!isFavorited })
    } else {
      // Get all favorites
      const favorites = await getUserFavorites(userId)
      return NextResponse.json({ favorites })
    }
  } catch (error) {
    console.error("Error in favorites API:", error)
    return NextResponse.json({ error: "Failed to process favorites request" }, { status: 500 })
  }
}

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

    // Add to favorites
    const favoriteId = await addToFavorites(userId, carId)

    return NextResponse.json({
      success: true,
      message: "Added to favorites",
      favoriteId,
    })
  } catch (error) {
    console.error("Error adding to favorites:", error)
    return NextResponse.json({ error: "Failed to add to favorites" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
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

    // Remove from favorites
    await removeFromFavorites(userId, carId)

    return NextResponse.json({
      success: true,
      message: "Removed from favorites",
    })
  } catch (error) {
    console.error("Error removing from favorites:", error)
    return NextResponse.json({ error: "Failed to remove from favorites" }, { status: 500 })
  }
}

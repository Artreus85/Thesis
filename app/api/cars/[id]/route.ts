import { type NextRequest, NextResponse } from "next/server"
import { getFirestoreAdmin } from "@/lib/firebase-admin"
import { getAuthAdmin } from "@/lib/firebase-admin"

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const carId = params.id

    const db = getFirestoreAdmin()
    const carDoc = await db.collection("cars").doc(carId).get()

    if (!carDoc.exists) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 })
    }

    const carData = carDoc.data()

    // Convert Firestore timestamps to ISO strings
    const car = {
      id: carDoc.id,
      ...carData,
      createdAt: carData?.createdAt?.toDate().toISOString(),
      updatedAt: carData?.updatedAt?.toDate().toISOString(),
    }

    return NextResponse.json(car)
  } catch (error) {
    console.error("Error fetching car details:", error)
    return NextResponse.json({ error: "Failed to fetch car details" }, { status: 500 })
  }
}

// Add PUT method for updating a car listing with authorization checks
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const carId = params.id
    const data = await request.json()

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

    // Get the car to check ownership
    const db = getFirestoreAdmin()
    const carDoc = await db.collection("cars").doc(carId).get()

    if (!carDoc.exists) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 })
    }

    const carData = carDoc.data()

    // Check if user is the owner or an admin
    const userDoc = await db.collection("users").doc(userId).get()
    const userData = userDoc.data()
    const isAdmin = userData?.role === "admin"

    if (carData.userId !== userId && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to update this listing" }, { status: 403 })
    }

    // Update the car document
    await db
      .collection("cars")
      .doc(carId)
      .update({
        ...data,
        updatedAt: new Date(),
      })

    return NextResponse.json({ success: true, message: "Car listing updated successfully" })
  } catch (error) {
    console.error("Error updating car:", error)
    return NextResponse.json({ error: "Failed to update car listing" }, { status: 500 })
  }
}

// Add DELETE method for deleting a car listing with authorization checks
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const carId = params.id

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

    // Get the car to check ownership
    const db = getFirestoreAdmin()
    const carDoc = await db.collection("cars").doc(carId).get()

    if (!carDoc.exists) {
      return NextResponse.json({ error: "Car not found" }, { status: 404 })
    }

    const carData = carDoc.data()

    // Check if user is the owner or an admin
    const userDoc = await db.collection("users").doc(userId).get()
    const userData = userDoc.data()
    const isAdmin = userData?.role === "admin"

    if (carData.userId !== userId && !isAdmin) {
      return NextResponse.json({ error: "Not authorized to delete this listing" }, { status: 403 })
    }

    // Delete the car document
    await db.collection("cars").doc(carId).delete()

    return NextResponse.json({ success: true, message: "Car listing deleted successfully" })
  } catch (error) {
    console.error("Error deleting car:", error)
    return NextResponse.json({ error: "Failed to delete car listing" }, { status: 500 })
  }
}

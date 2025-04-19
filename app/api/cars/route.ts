import { type NextRequest, NextResponse } from "next/server"
import { getFirestoreAdmin } from "@/lib/firebaseAdmin"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 20

    // Add logging to help diagnose the issue
    console.log("Initializing Firebase Admin...")
    const db = getFirestoreAdmin()
    console.log("Firebase Admin initialized successfully")

    const carsRef = db.collection("cars")

    // Query for visible cars, ordered by creation date
    console.log("Querying Firestore...")
    const snapshot = await carsRef.where("isVisible", "==", true).orderBy("createdAt", "desc").limit(limit).get()
    console.log("Firestore query completed successfully")

    const cars = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to ISO string
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }))

    return NextResponse.json(cars)
  } catch (error) {
    console.error("Detailed error fetching cars:", error)
    // Return more detailed error information
    return NextResponse.json(
      {
        error: "Failed to fetch car listings",
        details: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}

import { type NextRequest, NextResponse } from "next/server"

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log("API route /api/cars called")
    
    // Try to import Firebase Admin dynamically
    const { getFirestoreAdmin } = await import("@/lib/firebase-admin")
    
    console.log("Getting Firestore Admin instance")
    const db = getFirestoreAdmin()
    console.log("Firestore Admin instance obtained")
    
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 20

    // Query for visible cars, ordered by creation date
    console.log("Querying Firestore")
    const carsRef = db.collection("cars")
    const snapshot = await carsRef.where("isVisible", "==", true).orderBy("createdAt", "desc").limit(limit).get()
    console.log("Firestore query completed, found", snapshot.docs.length, "documents")

    const cars = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to ISO string
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || new Date().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate?.()?.toISOString() || new Date().toISOString(),
    }))

    return NextResponse.json(cars)
  } catch (error) {
    console.error("Detailed error in /api/cars:", error)
    
    // Return a fallback response with empty data
    return NextResponse.json(
      {
        error: "Failed to fetch car listings",
        details: error instanceof Error ? error.message : String(error),
        fallback: true,
        data: [] // Return empty array as fallback
      },
      { status: 200 }, // Return 200 to prevent crashing the app
    )
  }
}

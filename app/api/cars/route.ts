import { type NextRequest, NextResponse } from "next/server"
import { getFirestoreAdmin } from "@/lib/firebase-admin"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = searchParams.get("limit") ? Number.parseInt(searchParams.get("limit")!) : 20

    const db = getFirestoreAdmin()
    const carsRef = db.collection("cars")

    // Query for visible cars, ordered by creation date
    const snapshot = await carsRef.where("isVisible", "==", true).orderBy("createdAt", "desc").limit(limit).get()

    const cars = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      // Convert Firestore timestamp to ISO string
      createdAt: doc.data().createdAt?.toDate().toISOString(),
      updatedAt: doc.data().updatedAt?.toDate().toISOString(),
    }))

    return NextResponse.json(cars)
  } catch (error) {
    console.error("Error fetching cars:", error)
    return NextResponse.json({ error: "Failed to fetch car listings" }, { status: 500 })
  }
}

import { type NextRequest, NextResponse } from "next/server"
import { getFirestoreAdmin } from "@/lib/firebase-admin"

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

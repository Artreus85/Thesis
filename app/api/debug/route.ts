import { NextResponse } from "next/server"
import { getFirestoreAdmin } from "@/lib/firebase-admin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("Debug API route called")

    // Check Firebase Admin connection
    const db = getFirestoreAdmin()
    console.log("Firebase Admin initialized")

    // Try to get all cars without filtering
    const carsRef = db.collection("cars")
    const snapshot = await carsRef.get()
    console.log(`Found ${snapshot.docs.length} total cars in Firestore`)

    // Get details of first few cars
    const cars = snapshot.docs.slice(0, 5).map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
      isVisible: doc.data().isVisible === true ? "Yes" : "No",
    }))

    return NextResponse.json({
      success: true,
      totalCars: snapshot.docs.length,
      sampleCars: cars,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        firebaseProjectConfigured: !!process.env.FIREBASE_PROJECT_ID,
      },
    })
  } catch (error) {
    console.error("Debug API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : null,
      },
      { status: 500 },
    )
  }
}

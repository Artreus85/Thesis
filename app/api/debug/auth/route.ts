import { NextResponse } from "next/server"
import { getFirestoreAdmin } from "@/lib/firebase-admin"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    console.log("Debug Auth API route called")

    // Check Firebase Admin connection
    const db = getFirestoreAdmin()
    console.log("Firebase Admin initialized")

    // Try to get all users
    const usersRef = db.collection("users")
    const snapshot = await usersRef.get()
    console.log(`Found ${snapshot.docs.length} total users in Firestore`)

    // Get details of first few users (without sensitive info)
    const users = snapshot.docs.slice(0, 5).map((doc) => ({
      id: doc.id,
      name: doc.data().name || "No name",
      email: doc.data().email ? "Email exists" : "No email",
      role: doc.data().role || "No role",
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }))

    return NextResponse.json({
      success: true,
      totalUsers: snapshot.docs.length,
      sampleUsers: users,
      environment: {
        nodeEnv: process.env.NODE_ENV,
        firebaseProjectConfigured: !!process.env.FIREBASE_PROJECT_ID,
      },
    })
  } catch (error) {
    console.error("Debug Auth API error:", error)
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

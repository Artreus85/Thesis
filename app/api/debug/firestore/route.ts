import { NextResponse } from "next/server"
import { getFirestoreAdmin } from "@/lib/firebase-admin"
import { collection, getDocs, addDoc } from "firebase/firestore"
import { getFirestoreClient } from "@/lib/firebase-client"

export const dynamic = "force-dynamic"

export async function GET() {
  try {
    // Test both client and admin Firestore connections
    const results = {
      admin: { success: false, message: "", error: null },
      client: { success: false, message: "", error: null },
      environment: {
        nodeEnv: process.env.NODE_ENV,
        firebaseProjectId: process.env.FIREBASE_PROJECT_ID || "not set",
        firebaseClientEmail: process.env.FIREBASE_CLIENT_EMAIL ? "set" : "not set",
        firebasePrivateKey: process.env.FIREBASE_PRIVATE_KEY ? "set" : "not set",
        awsRegion: process.env.NEXT_PUBLIC_AWS_REGION || "not set",
        awsAccessKeyId: process.env.NEXT_PUBLIC_AWS_ACCESS_KEY_ID ? "set" : "not set",
        awsSecretAccessKey: process.env.NEXT_PUBLIC_AWS_SECRET_ACCESS_KEY ? "set" : "not set",
        awsS3BucketName: process.env.NEXT_PUBLIC_AWS_S3_BUCKET_NAME || "not set",
      },
    }

    // Test admin Firestore
    try {
      const db = getFirestoreAdmin()
      const carsRef = db.collection("cars")
      const snapshot = await carsRef.get()
      results.admin.success = true
      results.admin.message = `Successfully connected to Firestore Admin. Found ${snapshot.docs.length} cars.`
    } catch (error) {
      results.admin.success = false
      results.admin.message = "Failed to connect to Firestore Admin"
      results.admin.error = error instanceof Error ? error.message : String(error)
    }

    // Test client Firestore
    try {
      const db = getFirestoreClient()
      const carsRef = collection(db, "cars")
      const snapshot = await getDocs(carsRef)
      results.client.success = true
      results.client.message = `Successfully connected to Firestore Client. Found ${snapshot.docs.length} cars.`
    } catch (error) {
      results.client.success = false
      results.client.message = "Failed to connect to Firestore Client"
      results.client.error = error instanceof Error ? error.message : String(error)
    }

    return NextResponse.json(results)
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

// Test endpoint to create a simple document
export async function POST() {
  try {
    const db = getFirestoreClient()
    const testCollection = collection(db, "test_collection")

    const docData = {
      message: "Test document",
      timestamp: new Date(),
    }

    const docRef = await addDoc(testCollection, docData)

    return NextResponse.json({
      success: true,
      message: "Test document created successfully",
      documentId: docRef.id,
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}

import * as admin from "firebase-admin"

// Initialize Firebase Admin only once
let firebaseApp: admin.app.App | undefined

function getFirebaseAdminApp() {
  if (!firebaseApp) {
    try {
      // Log environment variables (without revealing sensitive data)
      console.log("Initializing Firebase Admin with project:", process.env.FIREBASE_PROJECT_ID)
      console.log("Client email available:", !!process.env.FIREBASE_CLIENT_EMAIL)
      console.log("Private key available:", !!process.env.FIREBASE_PRIVATE_KEY)

      // Format the private key correctly
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined

      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        throw new Error("Missing Firebase Admin credentials")
      }

      firebaseApp = admin.initializeApp({
        credential: admin.credential.cert({
          projectId: process.env.FIREBASE_PROJECT_ID,
          clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
          privateKey: privateKey,
        }),
      })

      console.log("Firebase Admin initialized successfully")
    } catch (error) {
      console.error("Firebase Admin initialization error:", error)
      throw error
    }
  }

  return firebaseApp
}

export function getFirestoreAdmin() {
  return getFirebaseAdminApp().firestore()
}

export function getAuthAdmin() {
  return getFirebaseAdminApp().auth()
}

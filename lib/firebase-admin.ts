import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getFirestore } from "firebase-admin/firestore"
import { getAuth } from "firebase-admin/auth"

// Initialize Firebase Admin for server-side
export function getFirebaseAdminApp() {
  if (getApps().length === 0) {
    // For local development, we'll use the client credentials
    // In production, you should use a service account
    const app = initializeApp({
      credential: cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail:
          process.env.FIREBASE_CLIENT_EMAIL ||
          `firebase-adminsdk@${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.iam.gserviceaccount.com`,
        // In development, we'll use a workaround for the private key
        privateKey: (process.env.FIREBASE_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
      }),
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`,
    })
    return app
  } else {
    return getApps()[0]
  }
}

// Get Firestore Admin instance
export function getFirestoreAdmin() {
  const app = getFirebaseAdminApp()
  return getFirestore(app)
}

// Get Auth Admin instance
export function getAuthAdmin() {
  const app = getFirebaseAdminApp()
  return getAuth(app)
}

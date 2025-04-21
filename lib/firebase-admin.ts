import * as admin from "firebase-admin"

// Initialize Firebase Admin only once
let firebaseApp: admin.app.App | undefined

export function getFirebaseAdminApp(): admin.app.App | null {
  try {
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n")
    const projectId = process.env.FIREBASE_PROJECT_ID
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL

    if (!projectId || !clientEmail || !privateKey) {
      console.warn("Missing Firebase Admin credentials")
      return null
    }

    // This prevents duplicate initialization
    if (admin.apps.length === 0) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      })

      console.log("✅ Firebase Admin initialized")
    }

    return admin.app()
  } catch (error) {
    console.error("❌ Firebase Admin initialization error:", error)
    return null
  }
}

export function getFirestoreAdmin() {
  const app = getFirebaseAdminApp()
  if (!app) {
    console.warn("⚠️ Using mock Firestore Admin")
    return {
      collection: () => ({
        doc: () => ({
          get: async () => ({ exists: false, data: () => ({}) }),
        }),
        get: async () => ({ docs: [] }),
      }),
    } as any
  }

  return admin.firestore(app)
}

export function getAuthAdmin() {
  const app = getFirebaseAdminApp()
  if (!app) {
    console.warn("⚠️ Using mock Auth Admin")
    return {
      verifyIdToken: async () => {
        throw new Error("Mock verifyIdToken called — Firebase Admin not initialized")
      },
    } as any
  }

  return admin.auth(app)
}

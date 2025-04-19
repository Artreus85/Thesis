import * as admin from "firebase-admin"

// Initialize Firebase Admin only once
let firebaseApp: admin.app.App | undefined

function getFirebaseAdminApp() {
  if (!firebaseApp) {
    try {
      // Format the private key correctly
      const privateKey = process.env.FIREBASE_PRIVATE_KEY
        ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n")
        : undefined

      if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !privateKey) {
        console.warn("Missing Firebase Admin credentials")
        return null
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
      return null
    }
  }

  return firebaseApp
}

export function getFirestoreAdmin() {
  const app = getFirebaseAdminApp()

  if (!app) {
    console.warn("Using mock Firestore Admin")
    // Return a mock object that won't crash the application
    return {
      collection: () => ({
        doc: () => ({
          get: async () => ({ exists: false, data: () => ({}) }),
        }),
        where: () => ({
          orderBy: () => ({
            limit: () => ({
              get: async () => ({ docs: [] }),
            }),
          }),
          get: async () => ({ docs: [] }),
        }),
        orderBy: () => ({
          limit: () => ({
            get: async () => ({ docs: [] }),
          }),
          get: async () => ({ docs: [] }),
        }),
        get: async () => ({ docs: [] }),
      }),
    } as any
  }

  return app.firestore()
}

export function getAuthAdmin() {
  const app = getFirebaseAdminApp()

  if (!app) {
    console.warn("Using mock Auth Admin")
    // Return a mock object that won't crash the application
    return {
      getUser: async () => ({}),
      createUser: async () => ({}),
      updateUser: async () => ({}),
      deleteUser: async () => ({}),
    } as any
  }

  return app.auth()
}

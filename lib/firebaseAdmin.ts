import * as admin from "firebase-admin"

let firebaseAdmin: admin.app.App

function initializeFirebaseAdmin() {
  if (!firebaseAdmin) {
    try {
      const serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY ? process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, "\n") : "",
      }

      firebaseAdmin = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
      })
    } catch (error) {
      console.error("Failed to initialize Firebase Admin:", error)
      throw error
    }
  }
  return firebaseAdmin
}

export function getFirestoreAdmin() {
  return initializeFirebaseAdmin().firestore()
}

"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"
import { firebaseConfig } from "./firebase-config"

// Initialize Firebase for client-side
export function getFirebaseApp() {
  if (getApps().length === 0) {
    console.log("Initializing Firebase app")
    return initializeApp(firebaseConfig)
  } else {
    console.log("Firebase app already initialized")
    return getApp()
  }
}

// Get Firestore instance
export function getFirestoreClient() {
  const app = getFirebaseApp()
  return getFirestore(app)
}

// Get Auth instance with local persistence
export function getAuthClient() {
  const app = getFirebaseApp()
  const auth = getAuth(app)

  // Set persistence to LOCAL (localStorage) to keep users logged in
  if (typeof window !== "undefined") {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("Firebase auth persistence set to LOCAL")
      })
      .catch((error) => {
        console.error("Error setting auth persistence:", error)
      })
  }

  return auth
}

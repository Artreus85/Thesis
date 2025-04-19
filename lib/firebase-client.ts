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

// Get Auth instance with persistence
export function getAuthClient() {
  const app = getFirebaseApp()
  const auth = getAuth(app)

  // Set persistence to LOCAL (survives browser restarts)
  // Only set it once to avoid warnings
  if (typeof window !== "undefined" && !auth._persistenceSet) {
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("Firebase auth persistence set to LOCAL")
        auth._persistenceSet = true
      })
      .catch((error) => {
        console.error("Error setting auth persistence:", error)
      })
  }

  return auth
}

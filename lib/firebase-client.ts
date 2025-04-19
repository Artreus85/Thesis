"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, setPersistence, inMemoryPersistence, signOut } from "firebase/auth"
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

// Get Auth instance with no persistence
export function getAuthClient() {
  const app = getFirebaseApp()
  const auth = getAuth(app)

  // Set persistence to NONE (doesn't survive page refreshes)
  // Only set it once to avoid warnings
  if (typeof window !== "undefined" && !auth._persistenceSet) {
    setPersistence(auth, inMemoryPersistence)
      .then(() => {
        console.log("Firebase auth persistence set to NONE")
        auth._persistenceSet = true

        // Force sign out any existing user when the app initializes
        signOut(auth).catch((error) => {
          console.error("Error signing out:", error)
        })
      })
      .catch((error) => {
        console.error("Error setting auth persistence:", error)
      })
  }

  return auth
}

"use client"

import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth } from "firebase/auth"
import { firebaseConfig } from "./firebase-config"

// Initialize Firebase for client-side
export function getFirebaseApp() {
  if (getApps().length === 0) {
    return initializeApp(firebaseConfig)
  } else {
    return getApp()
  }
}

// Get Firestore instance
export function getFirestoreClient() {
  const app = getFirebaseApp()
  return getFirestore(app)
}

// Get Auth instance
export function getAuthClient() {
  const app = getFirebaseApp()
  return getAuth(app)
}

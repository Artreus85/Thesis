"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, getAuth, signOut } from "firebase/auth"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { signIn as firebaseSignIn, signOut as firebaseSignOut, signUp as firebaseSignUp } from "@/lib/firebase"
import { handleFirestoreError, enableOfflinePersistence } from "@/lib/firebase-error-handler"
import type { User } from "@/lib/types"

// Initialize Firestore
const db = getFirestore()

interface AuthContextType {
  user: (User & { id: string }) | null
  loading: boolean
  connectionBlocked: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  connectionBlocked: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User & { id: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const [connectionBlocked, setConnectionBlocked] = useState(false)
  const auth = getAuth()

  // Enable offline persistence when component mounts
  useEffect(() => {
    enableOfflinePersistence()
      .then((success) => {
        if (!success) {
          console.warn("Failed to enable offline persistence")
        }
      })
      .catch((error) => {
        console.error("Error setting up offline persistence:", error)
      })
  }, [])

  useEffect(() => {
    console.log("Setting up auth state listener")

    // Force sign out when the component mounts
    signOut(auth).catch((error) => {
      console.error("Error signing out on initial load:", error)
    })

    // This ensures Firebase has time to initialize
    const timeoutId = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log("Auth state changed:", firebaseUser ? `User: ${firebaseUser.uid}` : "No user")

        if (firebaseUser) {
          try {
            // Try to get user data from Firestore using the UID as document ID
            const userDocRef = doc(db, "users", firebaseUser.uid)
            const userDocSnap = await getDoc(userDocRef)

            if (userDocSnap.exists()) {
              console.log("User data retrieved from Firestore")
              const userData = userDocSnap.data()
              setUser({
                id: firebaseUser.uid, // Ensure ID is set from Firebase Auth
                ...userData,
                createdAt: userData.createdAt || new Date().toISOString(),
              })
            } else {
              console.log("No user data found in Firestore, using Firebase user data")
              // Fallback to basic user data from Firebase Auth
              setUser({
                id: firebaseUser.uid, // Ensure ID is set from Firebase Auth
                name: firebaseUser.displayName || "User",
                email: firebaseUser.email || "",
                role: "regular",
                createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
              })

              // Attempt to create the user document if it doesn't exist
              try {
                const { setDoc } = await import("firebase/firestore")
                await setDoc(userDocRef, {
                  name: firebaseUser.displayName || "User",
                  email: firebaseUser.email || "",
                  role: "regular",
                  createdAt: new Date().toISOString(),
                })
                console.log("Created missing user document in Firestore")
              } catch (createError) {
                console.error("Failed to create user document:", createError)
              }
            }
          } catch (error) {
            console.error("Error fetching user data:", error)

            // Check if this is a connection blocked error
            if (error instanceof Error && (error.message.includes("network") || error.message.includes("blocked"))) {
              setConnectionBlocked(true)
            }

            // Still set basic user data to prevent blocking the UI
            setUser({
              id: firebaseUser.uid, // Ensure ID is set from Firebase Auth
              name: firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
              role: "regular",
              createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
            })
          }
        } else {
          setUser(null)
        }

        setLoading(false)
      })

      return () => {
        unsubscribe()
        clearTimeout(timeoutId)
      }
    }, 100) // Small delay to ensure Firebase is initialized

    return () => clearTimeout(timeoutId)
  }, [auth])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await firebaseSignIn(email, password)
      // The auth state listener will handle setting the user
    } catch (error) {
      console.error("Sign in error:", error)
      handleFirestoreError(error, "Failed to sign in. Please check your credentials.")
      setLoading(false)
      throw error
    }
  }

  const signUp = async (name: string, email: string, password: string) => {
    setLoading(true)
    try {
      await firebaseSignUp(name, email, password)
      // The auth state listener will handle setting the user
    } catch (error) {
      console.error("Sign up error:", error)
      handleFirestoreError(error, "Failed to create account. Please try again.")
      setLoading(false)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut()
      setUser(null)
    } catch (error) {
      console.error("Sign out error:", error)
      handleFirestoreError(error, "Failed to sign out. Please try again.")
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, connectionBlocked, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, getAuth, setPersistence, browserLocalPersistence } from "firebase/auth"
import { getFirestore, doc, getDoc } from "firebase/firestore"
import { signIn as firebaseSignIn, signOut as firebaseSignOut, signUp as firebaseSignUp, updateUserProfile as firebaseUpdateUserProfile} from "@/lib/firebase"
import { handleFirestoreError, enableOfflinePersistence } from "@/lib/firebase-error-handler"
import type { User } from "@/lib/types"

// Initialize Firestore
const db = getFirestore()

interface AuthContextType {
  user: (User & { id: string }) | null
  loading: boolean
  connectionBlocked: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string, phoneNumber: string) => Promise<void>
  updateUserProfile: (
    userId: string,
    data: { name?: string; phoneNumber?: string }
  ) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  connectionBlocked: false,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
  updateUserProfile: async () => {},
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

  // Modify the useEffect for auth state to improve persistence and error handling
  useEffect(() => {
    console.log("Setting up auth state listener")
    setLoading(true) // Ensure loading is true when starting

    // Initialize Firebase Auth
    const auth = getAuth()

    // Explicitly set persistence to LOCAL
    setPersistence(auth, browserLocalPersistence)
      .then(() => {
        console.log("Firebase auth persistence set to LOCAL")
      })
      .catch((error) => {
        console.error("Error setting auth persistence:", error)
      })

    // Set up a timeout to prevent infinite loading
    const loadingTimeout = setTimeout(() => {
      console.log("Auth loading timeout reached - forcing loading state to false")
      setLoading(false)
    }, 5000) // 5 second timeout as a fallback

    try {
      // Set up the auth state listener
      const unsubscribe = onAuthStateChanged(
        auth,
        async (firebaseUser) => {
          console.log("Auth state changed:", firebaseUser ? `User: ${firebaseUser.uid}` : "No user")

          // Clear the timeout since we got a response
          clearTimeout(loadingTimeout)

          if (firebaseUser) {
            try {
              // Try to get user data from Firestore using the UID as document ID
              const userDocRef = doc(db, "users", firebaseUser.uid)
              const userDocSnap = await getDoc(userDocRef)

              // Update the user state setting in the auth state listener
              if (userDocSnap.exists()) {
                console.log("User data retrieved from Firestore")
                const userData = userDocSnap.data()
                setUser({
                  id: firebaseUser.uid,
                  name: firebaseUser.displayName || "User",
                  email: firebaseUser.email || "",
                  phoneNumber: firebaseUser.phoneNumber || "",   // ➊ always include it
                  phoneVerified: false,                            // ➋ keep shape consistent
                  role: "regular",
                  createdAt:
                    firebaseUser.metadata.creationTime || new Date().toISOString(),
                });
              } else {
                console.log("No user data found in Firestore, using Firebase user data")
                // Fallback to basic user data from Firebase Auth
                setUser({
                  id: firebaseUser.uid, // Ensure ID is set from Firebase Auth
                  name: firebaseUser.displayName || "User",
                  email: firebaseUser.email || "",
                  phoneNumber: firebaseUser.phoneNumber || "",
                  phoneVerified: false,
                  role: "regular", // Default role
                  createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
                })

                // Attempt to create the user document if it doesn't exist
                try {
                  const { setDoc } = await import("firebase/firestore")
                  await setDoc(userDocRef, {
                    name: firebaseUser.displayName || "User",
                    email: firebaseUser.email || "",
                    phoneNumber: null,
                    phoneVerified: false,
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
                role: "regular", // Default role
                createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
              })
            }
          } else {
            setUser(null)
          }

          setLoading(false)
        },
        (error) => {
          // This is the error handler for onAuthStateChanged
          console.error("Auth state change error:", error)
          setLoading(false)
          setUser(null)
        },
      )

      return () => {
        clearTimeout(loadingTimeout)
        unsubscribe()
      }
    } catch (error) {
      console.error("Error setting up auth state listener:", error)
      setLoading(false)
      setUser(null)
    }
  }, [])

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

  const signUp = async (name: string, email: string, password: string, phoneNumber: string) => {
    setLoading(true)
    try {
      await firebaseSignUp(name, email, password, phoneNumber)
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
  const updateUserProfile = async (
    userId: string,
    data: { name?: string; phoneNumber?: string }
  ) => {
    await firebaseUpdateUserProfile(userId, data)       // ② call your lib fn

    // keep local state in sync so the UI mirrors Firestore immediately
    setUser((prev) => (prev && prev.id === userId ? { ...prev, ...data } : prev))
  }
  return (
    <AuthContext.Provider value={{ user, loading, connectionBlocked, signIn, signUp, signOut, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

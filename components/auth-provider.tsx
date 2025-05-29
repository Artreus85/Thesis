"use client"

import React, { createContext, useContext, useEffect, useState } from "react"
import {
  onAuthStateChanged,
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth"
import { getFirestore, doc, getDoc, setDoc } from "firebase/firestore"
import {
  signIn as firebaseSignIn,
  signOut as firebaseSignOut,
  signUp as firebaseSignUp,
  updateUserProfile as firebaseUpdateUserProfile,
} from "@/lib/firebase"
import { handleFirestoreError, enableOfflinePersistence } from "@/lib/firebase-error-handler"
import type { User } from "@/lib/types"

const db = getFirestore()

interface AuthContextType {
  user: (User & { id: string }) | null
  loading: boolean
  connectionBlocked: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string, phoneNumber: string) => Promise<void>
  updateUserProfile: (userId: string, data: { name?: string; phoneNumber?: string }) => Promise<void>
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

  // Enable Firestore offline persistence once
  useEffect(() => {
    enableOfflinePersistence()
      .then(success => {
        if (!success) {
          console.warn("Failed to enable offline persistence")
        }
      })
      .catch(error => {
        console.error("Error setting up offline persistence:", error)
      })
  }, [])

  useEffect(() => {
    setLoading(true)

    // Ensure auth persistence is local
    setPersistence(auth, browserLocalPersistence).catch(error => {
      console.error("Failed to set auth persistence:", error)
    })

    const loadingTimeout = setTimeout(() => {
      console.warn("Auth loading timeout, setting loading=false")
      setLoading(false)
    }, 7000)

    const unsubscribe = onAuthStateChanged(
      auth,
      async firebaseUser => {
        clearTimeout(loadingTimeout)

        if (!firebaseUser) {
          setUser(null)
          setLoading(false)
          return
        }

        try {
          const userDocRef = doc(db, "users", firebaseUser.uid)
          const userDocSnap = await getDoc(userDocRef)

          if (userDocSnap.exists()) {
            const userData = userDocSnap.data()

            setUser({
              id: firebaseUser.uid,
              name: userData.name || firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
              phoneNumber: userData.phoneNumber || firebaseUser.phoneNumber || "",
              phoneVerified: userData.phoneVerified ?? false,
              role: userData.role || "regular", // <-- Important: get role here
              createdAt:
                userData.createdAt ||
                (firebaseUser.metadata.creationTime
                  ? new Date(firebaseUser.metadata.creationTime).getTime()
                  : Date.now()),
            })
          } else {
            // No user doc: create it with default role "regular"
            const newUserData: Omit<User, "id"> = {
              name: firebaseUser.displayName || "User",
              email: firebaseUser.email || "",
              phoneNumber: "",
              phoneVerified: false,
              role: "regular",
              createdAt: new Date().toISOString(),
            }
            await setDoc(userDocRef, newUserData)

            setUser({
              id: firebaseUser.uid,
              ...newUserData,
              createdAt: newUserData.createdAt,
            })
          }
        } catch (error) {
          console.error("Error fetching user data:", error)

          if (error instanceof Error && (error.message.includes("network") || error.message.includes("blocked"))) {
            setConnectionBlocked(true)
          }

          // Fallback to minimal user object with default role
          setUser({
            id: firebaseUser.uid,
            name: firebaseUser.displayName || "User",
            email: firebaseUser.email || "",
            phoneNumber: firebaseUser.phoneNumber || "",
            phoneVerified: false,
            role: "regular",
            createdAt: firebaseUser.metadata.creationTime
              ? firebaseUser.metadata.creationTime
              : new Date().toISOString(),
          })
        }
        setLoading(false)
      },
      error => {
        console.error("Auth state change error:", error)
        setLoading(false)
        setUser(null)
      }
    )

    return () => {
      clearTimeout(loadingTimeout)
      unsubscribe()
    }
  }, [auth])

  const signIn = async (email: string, password: string) => {
    setLoading(true)
    try {
      await firebaseSignIn(email, password)
      // onAuthStateChanged listener updates user
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
      // onAuthStateChanged listener updates user
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
    await firebaseUpdateUserProfile(userId, data)
    setUser(prev => (prev && prev.id === userId ? { ...prev, ...data } : prev))
  }

  return (
    <AuthContext.Provider value={{ user, loading, connectionBlocked, signIn, signUp, signOut, updateUserProfile }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)

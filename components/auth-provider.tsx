"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { onAuthStateChanged, getAuth } from "firebase/auth"
import {
  getUserById,
  signIn as firebaseSignIn,
  signOut as firebaseSignOut,
  signUp as firebaseSignUp,
} from "@/lib/firebase"
import type { User } from "@/lib/types"

interface AuthContextType {
  user: (User & { id: string }) | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (name: string, email: string, password: string) => Promise<void>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  signIn: async () => {},
  signUp: async () => {},
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<(User & { id: string }) | null>(null)
  const [loading, setLoading] = useState(true)
  const auth = getAuth()

  useEffect(() => {
    console.log("Setting up auth state listener")

    // This ensures Firebase has time to initialize
    const timeoutId = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        console.log("Auth state changed:", firebaseUser ? `User: ${firebaseUser.uid}` : "No user")

        if (firebaseUser) {
          try {
            // Try to get user data from Firestore
            const userData = await getUserById(firebaseUser.uid)

            if (userData) {
              console.log("User data retrieved from Firestore")
              setUser(userData as User & { id: string })
            } else {
              console.log("No user data found in Firestore, using Firebase user data")
              // Fallback to basic user data from Firebase Auth
              setUser({
                id: firebaseUser.uid,
                name: firebaseUser.displayName || "User",
                email: firebaseUser.email || "",
                role: "regular",
                createdAt: firebaseUser.metadata.creationTime || new Date().toISOString(),
              })
            }
          } catch (error) {
            console.error("Error fetching user data:", error)
            // Still set basic user data to prevent blocking the UI
            setUser({
              id: firebaseUser.uid,
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
      throw error
    }
  }

  return <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>{children}</AuthContext.Provider>
}

export const useAuth = () => useContext(AuthContext)

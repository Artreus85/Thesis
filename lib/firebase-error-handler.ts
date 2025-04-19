import { FirebaseError } from "firebase/app"
import { enableIndexedDbPersistence, getFirestore } from "firebase/firestore"
import { toast } from "@/components/ui/use-toast"

// Error types that might indicate connection blocking
const CONNECTION_ERROR_CODES = ["unavailable", "failed-precondition", "resource-exhausted", "network-request-failed"]

// Enable offline persistence for Firestore
export async function enableOfflinePersistence() {
  try {
    const db = getFirestore()
    await enableIndexedDbPersistence(db)
    console.log("Offline persistence enabled successfully")
    return true
  } catch (error) {
    if (error instanceof FirebaseError && error.code === "failed-precondition") {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn("Multiple tabs open, persistence only enabled in one tab")
      return true
    } else if (error instanceof FirebaseError && error.code === "unimplemented") {
      // The current browser does not support all of the features required for persistence
      console.warn("This browser doesn't support offline persistence")
      return false
    } else {
      console.error("Error enabling offline persistence:", error)
      return false
    }
  }
}

// Check if error is likely caused by ad blockers or connection issues
export function isConnectionBlockedError(error: unknown): boolean {
  if (error instanceof FirebaseError) {
    // Check for specific Firebase error codes
    if (CONNECTION_ERROR_CODES.includes(error.code)) {
      return true
    }

    // Check error message for network-related terms
    const errorMessage = error.message.toLowerCase()
    if (
      errorMessage.includes("network") ||
      errorMessage.includes("connection") ||
      errorMessage.includes("timeout") ||
      errorMessage.includes("blocked")
    ) {
      return true
    }
  }

  // Check for general network errors
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase()
    if (
      errorMessage.includes("network") ||
      errorMessage.includes("failed to fetch") ||
      errorMessage.includes("blocked by client")
    ) {
      return true
    }
  }

  return false
}

// Handle Firestore errors with appropriate user feedback
export function handleFirestoreError(error: unknown, customMessage?: string): void {
  console.error("Firestore error:", error)

  if (isConnectionBlockedError(error)) {
    showConnectionBlockedMessage()
  } else {
    // For other types of errors
    toast({
      title: "Error",
      description: customMessage || "Something went wrong. Please try again later.",
      variant: "destructive",
    })
  }
}

// Show a helpful message when connection is blocked
export function showConnectionBlockedMessage(): void {
  toast({
    title: "Connection Issue Detected",
    description:
      "It looks like your connection to our database is being blocked. " +
      "This is often caused by ad blockers or privacy extensions. " +
      "Please disable them for this site or add an exception.",
    variant: "destructive",
    duration: 10000, // Show for 10 seconds
  })
}

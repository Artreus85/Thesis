export function clearAuthTokens() {
  if (typeof window === "undefined") return

  // Clear any Firebase auth tokens
  Object.keys(localStorage).forEach((key) => {
    if (key.startsWith("firebase:") || key.includes("firebaseAuth") || key.includes("firebase-auth")) {
      localStorage.removeItem(key)
    }
  })

  // Clear any session storage tokens too
  Object.keys(sessionStorage).forEach((key) => {
    if (key.startsWith("firebase:") || key.includes("firebaseAuth") || key.includes("firebase-auth")) {
      sessionStorage.removeItem(key)
    }
  })

  console.log("Cleared all Firebase auth tokens")
}
